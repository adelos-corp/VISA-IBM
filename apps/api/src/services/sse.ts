import type { ServerResponse } from 'http'
import type { DeploymentStatus } from '../types'

// In-process SSE broadcaster.
// The deployment route registers a client; the pipeline emits to it.

type SseClient = ServerResponse

const clients = new Map<string, Set<SseClient>>()

export function registerSseClient(deploymentId: string, res: SseClient): void {
  if (!clients.has(deploymentId)) clients.set(deploymentId, new Set())
  clients.get(deploymentId)!.add(res)
}

export function unregisterSseClient(deploymentId: string, res: SseClient): void {
  clients.get(deploymentId)?.delete(res)
}

function emit(deploymentId: string, data: Record<string, unknown>): void {
  const set = clients.get(deploymentId)
  if (!set || set.size === 0) return
  const payload = `data: ${JSON.stringify(data)}\n\n`
  for (const res of set) {
    try {
      res.write(payload)
    } catch {
      set.delete(res)
    }
  }
}

export function emitStatus(deploymentId: string, status: DeploymentStatus): void {
  emit(deploymentId, {
    type: 'status',
    deploymentId,
    payload: { status },
    timestamp: new Date().toISOString(),
  })
}

export function emitLog(
  deploymentId: string,
  lineNumber: number,
  source: string,
  content: string
): void {
  emit(deploymentId, {
    type: 'log',
    deploymentId,
    payload: { lineNumber, source, content, timestamp: new Date().toISOString() },
    timestamp: new Date().toISOString(),
  })
}

export function emitStage(
  deploymentId: string,
  stage: string,
  stageStatus: 'RUNNING' | 'DONE' | 'FAILED',
  meta?: Record<string, unknown>
): void {
  emit(deploymentId, {
    type: 'stage',
    deploymentId,
    payload: { stage, stageStatus, ...(meta ?? {}) },
    timestamp: new Date().toISOString(),
  })
}
