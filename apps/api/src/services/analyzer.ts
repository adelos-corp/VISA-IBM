import fs from 'fs'
import path from 'path'
import type { ProjectAnalysis } from '../types'

// ─── Static analysis of a project directory ───────────────────────────────────
// No LLM call — we parse the real files deterministically.

export function analyzeProject(projectPath: string): Omit<ProjectAnalysis, 'id' | 'projectId' | 'createdAt'> {
  const files = listFiles(projectPath)

  const hasDockerfile = files.includes('Dockerfile')
  const hasPkg = files.includes('package.json')
  const hasRequirements = files.includes('requirements.txt') || files.includes('pyproject.toml')
  const hasGoMod = files.includes('go.mod')

  let framework = 'unknown'
  let runtime = 'node'
  let buildCommand = ''
  let port = 8080
  const healthPath = '/health'
  const envVarsNeeded: string[] = []

  // ── Detect runtime ────────────────────────────────────────────────────────
  if (hasPkg) {
    runtime = 'node'
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'))
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }
      if (deps.next) framework = 'next'
      else if (deps.express) framework = 'express'
      else if (deps.fastify) framework = 'fastify'
      else if (deps.koa) framework = 'koa'
      buildCommand = pkg.scripts?.build ? 'npm run build' : ''
    } catch { /* ignore */ }
  } else if (hasRequirements) {
    runtime = 'python'
    framework = 'flask'
  } else if (hasGoMod) {
    runtime = 'go'
    framework = 'go'
  }

  // ── Detect port from Dockerfile ───────────────────────────────────────────
  if (hasDockerfile) {
    try {
      const df = fs.readFileSync(path.join(projectPath, 'Dockerfile'), 'utf8')
      const exposeMatch = df.match(/^EXPOSE\s+(\d+)/m)
      if (exposeMatch) port = parseInt(exposeMatch[1], 10)

      // Scan ENV lines to understand what env vars are explicitly set
      const envSet = new Set<string>()
      for (const m of df.matchAll(/^ENV\s+([A-Z_][A-Z0-9_]*)\s*=/gm)) {
        envSet.add(m[1])
      }

      // Scan for process.env references in JS/TS source files
      const srcFiles = listRecursive(projectPath).filter(f =>
        (f.endsWith('.js') || f.endsWith('.ts')) && !f.includes('node_modules')
      )
      const envRefPattern = /process\.env\.([A-Z_][A-Z0-9_]*)/g
      for (const srcFile of srcFiles) {
        try {
          const content = fs.readFileSync(path.join(projectPath, srcFile), 'utf8')
          for (const m of content.matchAll(envRefPattern)) {
            const varName = m[1]
            if (varName !== 'NODE_ENV' && varName !== 'PORT' && !envSet.has(varName)) {
              if (!envVarsNeeded.includes(varName)) envVarsNeeded.push(varName)
            }
          }
        } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
  }

  const rawJson = JSON.stringify({ framework, runtime, port, healthPath, buildCommand, envVarsNeeded, files })

  return { framework, runtime, port, healthPath, buildCommand, envVarsNeeded, rawJson }
}

function listFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter(f => {
      try { return fs.statSync(path.join(dir, f)).isFile() } catch { return false }
    })
  } catch { return [] }
}

function listRecursive(dir: string, base = ''): string[] {
  const results: string[] = []
  try {
    for (const entry of fs.readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '.git') continue
      const rel = base ? `${base}/${entry}` : entry
      const full = path.join(dir, entry)
      try {
        if (fs.statSync(full).isDirectory()) {
          results.push(...listRecursive(full, rel))
        } else {
          results.push(rel)
        }
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
  return results
}
