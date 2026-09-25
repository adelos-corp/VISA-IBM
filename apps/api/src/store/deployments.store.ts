import { getDb } from './db'
import { randomUUID } from 'crypto'
import type { Deployment, DeploymentStatus } from '../types'

function rowToDeployment(row: Record<string, unknown>): Deployment {
  return {
    id: row.id as string,
    projectId: row.project_id as string,
    status: row.status as DeploymentStatus,
    attemptNumber: row.attempt_number as number,
    parentDeploymentId: row.parent_deployment_id as string | null,
    dockerImageId: row.docker_image_id as string | null,
    containerId: row.container_id as string | null,
    createdAt: row.created_at as string,
    completedAt: row.completed_at as string | null,
  }
}

export function createDeployment(data: {
  projectId: string
  attemptNumber?: number
  parentDeploymentId?: string
}): Deployment {
  const db = getDb()
  const id = randomUUID()
  db.prepare(
    `INSERT INTO deployments (id, project_id, status, attempt_number, parent_deployment_id)
     VALUES (?, ?, 'PENDING', ?, ?)`
  ).run(
    id,
    data.projectId,
    data.attemptNumber ?? 1,
    data.parentDeploymentId ?? null
  )
  return getDeploymentById(id)!
}

export function getDeploymentById(id: string): Deployment | undefined {
  const db = getDb()
  const row = db
    .prepare(`SELECT * FROM deployments WHERE id = ?`)
    .get(id) as Record<string, unknown> | undefined
  if (!row) return undefined
  return rowToDeployment(row)
}

export function updateDeploymentStatus(
  id: string,
  status: DeploymentStatus,
  extra?: { dockerImageId?: string; containerId?: string }
): void {
  const db = getDb()
  const terminal: DeploymentStatus[] = ['LIVE', 'TERMINAL', 'FAILED']
  const completedAt = terminal.includes(status) ? new Date().toISOString() : null

  db.prepare(
    `UPDATE deployments SET status = ?, docker_image_id = COALESCE(?, docker_image_id),
     container_id = COALESCE(?, container_id),
     completed_at = COALESCE(?, completed_at)
     WHERE id = ?`
  ).run(
    status,
    extra?.dockerImageId ?? null,
    extra?.containerId ?? null,
    completedAt,
    id
  )
}

export function listDeploymentsByProject(projectId: string): Deployment[] {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT * FROM deployments WHERE project_id = ? ORDER BY created_at DESC`
    )
    .all(projectId) as Record<string, unknown>[]
  return rows.map(rowToDeployment)
}

export function appendLog(data: {
  deploymentId: string
  source: string
  lineNumber: number
  content: string
}): void {
  const db = getDb()
  db.prepare(
    `INSERT INTO deployment_logs (deployment_id, source, line_number, content)
     VALUES (?, ?, ?, ?)`
  ).run(data.deploymentId, data.source, data.lineNumber, data.content)
}

export function getLogs(deploymentId: string): Array<{
  lineNumber: number
  source: string
  content: string
  timestamp: string
}> {
  const db = getDb()
  return db
    .prepare(
      `SELECT line_number, source, content, timestamp FROM deployment_logs
       WHERE deployment_id = ? ORDER BY line_number ASC`
    )
    .all(deploymentId) as Array<{
    lineNumber: number
    source: string
    content: string
    timestamp: string
  }>
}
