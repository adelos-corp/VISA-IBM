import type { FastifyInstance } from 'fastify'
import {
  getDeploymentById,
  getLogs,
  updateDeploymentStatus,
} from '../store/deployments.store'

export async function deploymentRoutes(app: FastifyInstance) {
  // Get deployment details
  app.get<{ Params: { id: string } }>(
    '/deployments/:id',
    async (request, reply) => {
      const deployment = getDeploymentById(request.params.id)
      if (!deployment)
        return reply.status(404).send({ error: 'Deployment not found' })
      return { deployment }
    }
  )

  // Get deployment logs
  app.get<{ Params: { id: string } }>(
    '/deployments/:id/logs',
    async (request, reply) => {
      const deployment = getDeploymentById(request.params.id)
      if (!deployment)
        return reply.status(404).send({ error: 'Deployment not found' })
      const logs = getLogs(request.params.id)
      return { deploymentId: request.params.id, logs }
    }
  )

  // SSE stream for live deployment events
  app.get<{ Params: { id: string } }>(
    '/deployments/:id/events',
    async (request, reply) => {
      const deployment = getDeploymentById(request.params.id)
      if (!deployment)
        return reply.status(404).send({ error: 'Deployment not found' })

      reply.raw.setHeader('Content-Type', 'text/event-stream')
      reply.raw.setHeader('Cache-Control', 'no-cache')
      reply.raw.setHeader('Connection', 'keep-alive')
      reply.raw.setHeader('Access-Control-Allow-Origin', '*')

      const send = (data: Record<string, unknown>) => {
        reply.raw.write(`data: ${JSON.stringify(data)}\n\n`)
      }

      // Send current status immediately
      send({
        type: 'status',
        deploymentId: request.params.id,
        payload: { status: deployment.status },
        timestamp: new Date().toISOString(),
      })

      // Keep alive ping every 15s
      const ping = setInterval(() => {
        reply.raw.write(': ping\n\n')
      }, 15000)

      request.raw.on('close', () => {
        clearInterval(ping)
      })

      // Don't call reply.send() — SSE keeps connection open
      await new Promise(() => {}) // hold
    }
  )

  // Submit approval
  app.post<{
    Params: { id: string }
    Body: { gate: 'DEPLOY' | 'CORRECT'; decision: 'APPROVED' | 'REJECTED'; notes?: string }
  }>('/deployments/:id/approve', async (request, reply) => {
    const deployment = getDeploymentById(request.params.id)
    if (!deployment)
      return reply.status(404).send({ error: 'Deployment not found' })

    const { gate, decision, notes } = request.body ?? {}
    if (!gate || !decision)
      return reply.status(400).send({ error: 'gate and decision are required' })

    const { getDb } = await import('../store/db')
    const { randomUUID } = await import('crypto')
    const db = getDb()
    const approvalId = randomUUID()
    db.prepare(
      `INSERT INTO approvals (id, deployment_id, gate, decision, user_notes)
       VALUES (?, ?, ?, ?, ?)`
    ).run(approvalId, request.params.id, gate, decision, notes ?? null)

    // Advance status on approval
    if (gate === 'DEPLOY' && decision === 'APPROVED') {
      updateDeploymentStatus(request.params.id, 'DEPLOYING')
    } else if (gate === 'CORRECT' && decision === 'APPROVED') {
      updateDeploymentStatus(request.params.id, 'CORRECTING')
    } else if (decision === 'REJECTED') {
      updateDeploymentStatus(request.params.id, 'TERMINAL')
    }

    return { approvalId, gate, decision }
  })
}
