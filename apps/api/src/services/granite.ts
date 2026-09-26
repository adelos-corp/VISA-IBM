import fs from 'fs'
import path from 'path'
import type { DiagnosisResult, ProposedCorrection } from './diagnosis'

const GRANITE_MODEL = process.env.GRANITE_MODEL ?? 'ibm/granite4.2:3b'
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL ?? (process.env.VERCEL === '1' ? 'https://ollama.com' : 'http://127.0.0.1:11434')).replace(/\/$/, '')
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY
const GRANITE_TIMEOUT_MS = Number(process.env.GRANITE_TIMEOUT_MS ?? '10000')

interface GraniteDiagnosis {
  failureType: DiagnosisResult['failureType']
  rootCause: string
  confidence: number
  rationale: string
  proposedCorrection: ProposedCorrection
}

export async function diagnoseWithGranite(input: {
  containerLogs: string[]
  projectPath: string
  fallback: () => DiagnosisResult
}): Promise<{ result: DiagnosisResult; modelUsed: string; usedFallback: boolean }> {
  const fallback = input.fallback()

  try {
    const dockerfilePath = path.join(input.projectPath, 'Dockerfile')
    const dockerfile = fs.existsSync(dockerfilePath)
      ? fs.readFileSync(dockerfilePath, 'utf8').slice(0, 8000)
      : ''

    const prompt = [
      'You are the code-repair diagnosis engine inside VISA, a controlled deployment platform.',
      'Analyze the deployment logs and Dockerfile.',
      'Return ONLY valid JSON. Do not use markdown.',
      'You may propose only a bounded correction of type ADD_ENV_VAR, FIX_DOCKERFILE, or MANUAL.',
      'Never propose shell execution, arbitrary file deletion, credential exfiltration, or changes outside the Dockerfile.',
      'For ADD_ENV_VAR, provide envVar, envValue, dockerfilePatch.search, dockerfilePatch.replace, and diff.',
      'For unknown or unsafe failures, use MANUAL.',
      'The correction will be shown to a human and must be approved before application.',
      '',
      'JSON schema:',
      '{"failureType":"CORRECTABLE|NEEDS_HUMAN|UNRECOVERABLE","rootCause":"string","confidence":0,"rationale":"string","proposedCorrection":{"type":"ADD_ENV_VAR|FIX_DOCKERFILE|MANUAL","description":"string","envVar":"optional","envValue":"optional","dockerfilePatch":{"search":"optional","replace":"optional"},"diff":"string"}}',
      '',
      'Deployment logs:',
      input.containerLogs.join('\n').slice(-8000),
      '',
      'Dockerfile:',
      dockerfile,
    ].join('\n')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), GRANITE_TIMEOUT_MS)

    const response = await fetch(OLLAMA_BASE_URL + '/api/chat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(OLLAMA_API_KEY ? { authorization: 'Bearer ' + OLLAMA_API_KEY } : {}),
      },
      body: JSON.stringify({
        model: GRANITE_MODEL,
        stream: false,
        format: 'json',
        think: false,
        options: { temperature: 0, num_predict: 512 },
        messages: [
          { role: 'system', content: 'You are a precise deployment failure analysis and bounded code-correction engine.' },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    })

    clearTimeout(timer)

    if (!response.ok) {
      throw new Error('Granite endpoint returned HTTP ' + response.status)
    }

    const body = await response.json() as { message?: { content?: string } }
    const content = body.message?.content
    if (!content) throw new Error('Granite returned no message content')

    const parsed = JSON.parse(content) as GraniteDiagnosis
    const result = validateGraniteDiagnosis(parsed, fallback)

    return { result, modelUsed: GRANITE_MODEL, usedFallback: false }
  } catch {
    return { result: fallback, modelUsed: GRANITE_MODEL, usedFallback: true }
  }
}

function validateGraniteDiagnosis(candidate: GraniteDiagnosis, fallback: DiagnosisResult): DiagnosisResult {
  const allowedFailureTypes: DiagnosisResult['failureType'][] = ['CORRECTABLE', 'NEEDS_HUMAN', 'UNRECOVERABLE']
  const allowedCorrectionTypes: ProposedCorrection['type'][] = ['ADD_ENV_VAR', 'FIX_DOCKERFILE', 'FIX_CODE', 'MANUAL']

  if (!allowedFailureTypes.includes(candidate.failureType)) return fallback
  if (!candidate.rootCause || !candidate.rationale) return fallback
  if (!candidate.proposedCorrection || !allowedCorrectionTypes.includes(candidate.proposedCorrection.type)) return fallback

  const correction = candidate.proposedCorrection
  if (correction.type === 'ADD_ENV_VAR') {
    if (!correction.envVar || !/^[A-Z_][A-Z0-9_]*$/.test(correction.envVar)) return fallback
    if (!correction.envValue || !correction.dockerfilePatch?.search || !correction.dockerfilePatch?.replace) return fallback
  }

  const confidence = Math.max(0, Math.min(1, Number(candidate.confidence) || 0))

  return {
    failureType: candidate.failureType,
    rootCause: candidate.rootCause,
    proposedCorrection: correction,
    confidence,
    rationale: candidate.rationale,
  }
}
