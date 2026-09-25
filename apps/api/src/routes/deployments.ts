import type { FastifyInstance } from 'fastify'
import {
  getDeploymentById,
  getLogs,
  updateDeploymentStatus,
} from '../store/deployments.store'
import {
  getPreCheckReport,
  getPlan,
  getDiagnosis,
} from '../store/pipeline.store'
import { registerSseClient, unregisterSseClient } from '../services/sse'
import {
  startPipeline,
  resumeAfterDeployApproval,
  resumeAfterCorrectionApproval,
} from '../services/pipeline'
import { getDb } from '../store/db'
import { randomUUID } from 'crypto'

export async function deploymentRoutes(app: FastifyInstance) {
  // Get deployment details
  app.get<{ Params: { id: string } }>('/deployments/:id', async (request, reply) => {
    const d = getDeploymentById(request.params.id)
    if (!d) return reply.status(404).send({ error: 'Deployment not found' })
    return { deployment: d }
  })

  // Get deployment logs
  app.get<{ Params: { id: string } }>('/deployments/:id/logs', async (request, reply) => {
    const d = getDeploymentById(request.params.id)
    if (!d) return reply.status(404).send({ error: 'Deployment not found' })
    return { deploymentId: request.params.id, logs: getLogs(request.params.id) }
  })

  // Get pre-check report
  app.get<{ Params: { id: string } }>('/deployments/:id/checks', async (request, reply) => {
    const d = getDeploymentById(request.params.id)
    if (!d) return reply.status(404).send({ error: 'Deployment not found' })
    const report = getPreCheckReport(request.params.id)
    return { deploymentId: request.params.id, report }
  })

  // Get deployment plan
  app.get<{ Params: { id: string } }>('/deployments/:id/plan', async (request, reply) => {
    const d = getDeploymentById(request.params.id)
    if (!d) return reply.status(404).send({ error: 'Deployment not found' })
    const plan = getPlan(request.params.id)
    return { deploymentId: request.params.id, plan }
  })

  // Get diagnosis
  app.get<{ Params: { id: string } }>('/deployments/:id/diagnosis', async (request, reply) => {
    const d = getDeploymentById(request.params.id)
    if (!d) return reply.status(404).send({ error: 'Deployment not found' })
    const diagnosis = getDiagnosis(request.params.id)
    return { deploymentId: request.params.id, diagnosis }
  })

  // SSE stream for live deployment events
  app.get<{ Params: { id: string } }>('/deployments/:id/events', async (request, reply) => {
    const d = getDeploymentById(request.params.id)
    if (!d) return reply.status(404).send({ error: 'Deployment not found' })

    reply.raw.setHeader('Content-Type', 'text/event-stream')
    reply.raw.setHeader('Cache-Control', 'no-cache')
    reply.raw.setHeader('Connection', 'keep-alive')
    reply.raw.setHeader('Access-Control-Allow-Origin', '*')

    // Send current status immediately
    reply.raw.write(`data: ${JSON.stringify({
      type: 'status',
      deploymentId: request.params.id,
      payload: { status: d.status },
      timestamp: new Date().toISOString(),
    })}\n\n`)

    registerSseClient(request.params.id, reply.raw)

    const ping = setInterval(() => { reply.raw.write(': ping\n\n') }, 15000)
    request.raw.on('close', () => {
      clearInterval(ping)
      unregisterSseClient(request.params.id, reply.raw)
    })

    await new Promise(() => {}) // hold connection
  })

  // Trigger pipeline run (fire-and-forget)
  app.post<{ Params: { id: string } }>('/deployments/:id/run', async (request, reply) => {
    const d = getDeploymentById(request.params.id)
    if (!d) return reply.status(404).send({ error: 'Deployment not found' })
    if (d.status !== 'PENDING') {
      return reply.status(409).send({ error: `Cannot run from status ${d.status}` })
    }
    // Fire and forget — don't await
    setImmediate(() => startPipeline(request.params.id).catch(console.error))
    return { started: true }
  })

  // Submit approval
  app.post<{
    Params: { id: string }
    Body: { gate: 'DEPLOY' | 'CORRECT'; decision: 'APPROVED' | 'REJECTED'; notes?: string }
  }>('/deployments/:id/approve', async (request, reply) => {
    const d = getDeploymentById(request.params.id)
    if (!d) return reply.status(404).send({ error: 'Deployment not found' })

    const { gate, decision, notes } = request.body ?? {}
    if (!gate || !decision) return reply.status(400).send({ error: 'gate and decision are required' })

    const db = getDb()
    const approvalId = randomUUID()
    db.prepare(
      `INSERT INTO approvals (id, deployment_id, gate, decision, user_notes) VALUES (?, ?, ?, ?, ?)`
    ).run(approvalId, request.params.id, gate, decision, notes ?? null)

    // Resume pipeline based on decision
    if (decision === 'REJECTED') {
      updateDeploymentStatus(request.params.id, 'TERMINAL')
      return { approvalId, gate, decision }
    }

    if (gate === 'DEPLOY' && decision === 'APPROVED') {
      setImmediate(() => resumeAfterDeployApproval(request.params.id).catch(console.error))
    } else if (gate === 'CORRECT' && decision === 'APPROVED') {
      setImmediate(() => resumeAfterCorrectionApproval(request.params.id).catch(console.error))
    }

    return { approvalId, gate, decision }
  })
}
