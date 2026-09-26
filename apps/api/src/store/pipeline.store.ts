import { getDb } from './db'
import { randomUUID } from 'crypto'
import type { ProjectAnalysis, Diagnosis, Verification } from '../types'

// ─── Project Analysis ─────────────────────────────────────────────────────────

export function upsertAnalysis(data: {
  projectId: string
  framework: string
  runtime: string
  port: number
  healthPath: string
  buildCommand: string
  envVarsNeeded: string[]
  rawJson: string
}): ProjectAnalysis {
  const db = getDb()
  const id = randomUUID()
  db.prepare(
    `INSERT INTO project_analyses
       (id, project_id, framework, runtime, port, health_path, build_command, env_vars_needed, raw_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, data.projectId, data.framework, data.runtime, data.port,
    data.healthPath, data.buildCommand, JSON.stringify(data.envVarsNeeded), data.rawJson
  )
  return getAnalysisByProject(data.projectId)!
}

export function getAnalysisByProject(projectId: string): ProjectAnalysis | undefined {
  const db = getDb()
  const row = db.prepare(
    `SELECT * FROM project_analyses WHERE project_id = ? ORDER BY created_at DESC LIMIT 1`
  ).get(projectId) as Record<string, unknown> | undefined
  if (!row) return undefined
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    framework: row.framework as string,
    runtime: row.runtime as string,
    port: row.port as number,
    healthPath: row.health_path as string,
    buildCommand: row.build_command as string,
    envVarsNeeded: JSON.parse(row.env_vars_needed as string),
    rawJson: row.raw_json as string,
    createdAt: row.created_at as string,
  }
}

// ─── Pre-check report ─────────────────────────────────────────────────────────

export interface CheckResult {
  name: string
  status: 'PASS' | 'WARN' | 'FAIL'
  message: string
}

export function savePreCheckReport(data: {
  deploymentId: string
  checks: CheckResult[]
  overallStatus: 'PASS' | 'WARN' | 'FAIL'
}): string {
  const db = getDb()
  const id = randomUUID()
  db.prepare(
    `INSERT INTO pre_check_reports (id, deployment_id, checks_json, overall_status)
     VALUES (?, ?, ?, ?)`
  ).run(id, data.deploymentId, JSON.stringify(data.checks), data.overallStatus)
  return id
}

export function getPreCheckReport(deploymentId: string): {
  id: string; checks: CheckResult[]; overallStatus: string
} | undefined {
  const db = getDb()
  const row = db.prepare(
    `SELECT * FROM pre_check_reports WHERE deployment_id = ? ORDER BY created_at DESC LIMIT 1`
  ).get(deploymentId) as Record<string, unknown> | undefined
  if (!row) return undefined
  return {
    id: row.id as string,
    checks: JSON.parse(row.checks_json as string),
    overallStatus: row.overall_status as string,
  }
}

// ─── Deployment Plan ──────────────────────────────────────────────────────────

export interface DeploymentPlan {
  imageTag: string
  port: number
  healthPath: string
  envVars: Record<string, string>
  steps: string[]
  sourceUrl?: string
}

export function savePlan(deploymentId: string, plan: DeploymentPlan): string {
  const db = getDb()
  const id = randomUUID()
  db.prepare(
    `INSERT INTO deployment_plans (id, deployment_id, plan_json) VALUES (?, ?, ?)`
  ).run(id, deploymentId, JSON.stringify(plan))
  return id
}

export function getPlan(deploymentId: string): DeploymentPlan | undefined {
  const db = getDb()
  const row = db.prepare(
    `SELECT plan_json FROM deployment_plans WHERE deployment_id = ? ORDER BY created_at DESC LIMIT 1`
  ).get(deploymentId) as { plan_json: string } | undefined
  if (!row) return undefined
  return JSON.parse(row.plan_json)
}

// ─── Diagnosis ────────────────────────────────────────────────────────────────

export function saveDiagnosis(data: {
  deploymentId: string
  failureType: 'CORRECTABLE' | 'NEEDS_HUMAN' | 'UNRECOVERABLE'
  rootCause: string
  proposedCorrection: Record<string, unknown>
  confidence: number
  rationale: string
}): Diagnosis {
  const db = getDb()
  const id = randomUUID()
  db.prepare(
    `INSERT INTO diagnoses
       (id, deployment_id, failure_type, root_cause, proposed_correction_json, confidence, rationale)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, data.deploymentId, data.failureType, data.rootCause,
    JSON.stringify(data.proposedCorrection), data.confidence, data.rationale
  )
  return getDiagnosis(data.deploymentId)!
}

export function getDiagnosis(deploymentId: string): Diagnosis | undefined {
  const db = getDb()
  const row = db.prepare(
    `SELECT * FROM diagnoses WHERE deployment_id = ? ORDER BY created_at DESC LIMIT 1`
  ).get(deploymentId) as Record<string, unknown> | undefined
  if (!row) return undefined
  return {
    id: row.id as string,
    deploymentId: row.deployment_id as string,
    failureType: row.failure_type as Diagnosis['failureType'],
    rootCause: row.root_cause as string,
    proposedCorrectionJson: row.proposed_correction_json as string,
    confidence: row.confidence as number,
    rationale: row.rationale as string,
    createdAt: row.created_at as string,
  }
}

// ─── Correction attempt ───────────────────────────────────────────────────────

export function saveCorrectionAttempt(data: {
  deploymentId: string
  diagnosisId: string
  patchJson: Record<string, unknown>
}): string {
  const db = getDb()
  const id = randomUUID()
  db.prepare(
    `INSERT INTO correction_attempts (id, deployment_id, diagnosis_id, patch_json, validation_status)
     VALUES (?, ?, ?, ?, 'APPLIED')`
  ).run(id, data.deploymentId, data.diagnosisId, JSON.stringify(data.patchJson))
  return id
}

export function countCorrectionAttempts(deploymentId: string): number {
  const db = getDb()
  const row = db.prepare(
    `SELECT COUNT(*) as n FROM correction_attempts WHERE deployment_id = ?`
  ).get(deploymentId) as { n: number }
  return row.n
}

// ─── Verification ─────────────────────────────────────────────────────────────

export function saveVerification(data: {
  deploymentId: string
  endpoint: string
  httpStatus: number | null
  responseTimeMs: number | null
  healthy: boolean
  attempts: number
}): Verification {
  const db = getDb()
  const id = randomUUID()
  db.prepare(
    `INSERT INTO verifications
       (id, deployment_id, endpoint, http_status, response_time_ms, healthy, attempts)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, data.deploymentId, data.endpoint, data.httpStatus,
    data.responseTimeMs, data.healthy ? 1 : 0, data.attempts
  )
  return {
    id, deploymentId: data.deploymentId, endpoint: data.endpoint,
    httpStatus: data.httpStatus, responseTimeMs: data.responseTimeMs,
    healthy: data.healthy, attempts: data.attempts,
    completedAt: new Date().toISOString(),
  }
}
