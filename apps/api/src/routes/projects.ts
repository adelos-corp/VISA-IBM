import type { FastifyInstance } from 'fastify'
import { createProject, getProjectById, listProjects } from '../store/projects.store'
import {
  createDeployment,
  listDeploymentsByProject,
} from '../store/deployments.store'
import { startPipeline } from '../services/pipeline'

export async function projectRoutes(app: FastifyInstance) {
  // List all projects
  app.get('/projects', async () => {
    return { projects: listProjects() }
  })

  // Create a project
  app.post<{
    Body: { name?: string; gitUrl?: string; localPath?: string }
  }>('/projects', async (request, reply) => {
    const { name, gitUrl, localPath } = request.body ?? {}

    if (!gitUrl && !localPath) {
      return reply
        .status(400)
        .send({ error: 'Either gitUrl or localPath is required' })
    }

    const derivedName =
      name ??
      (gitUrl
        ? gitUrl.split('/').pop()?.replace('.git', '') ?? 'project'
        : (localPath?.split('/').pop() ?? 'project'))

    const project = createProject({ name: derivedName, gitUrl, localPath })
    return reply.status(201).send({ project })
  })

  // Get a single project
  app.get<{ Params: { id: string } }>('/projects/:id', async (request, reply) => {
    const project = getProjectById(request.params.id)
    if (!project) return reply.status(404).send({ error: 'Project not found' })
    return { project }
  })

  // List deployments for a project
  app.get<{ Params: { id: string } }>(
    '/projects/:id/deployments',
    async (request, reply) => {
      const project = getProjectById(request.params.id)
      if (!project) return reply.status(404).send({ error: 'Project not found' })
      const deployments = listDeploymentsByProject(request.params.id)
      return { deployments }
    }
  )

  // Initiate a new deployment
  app.post<{ Params: { id: string } }>(
    '/projects/:id/deployments',
    async (request, reply) => {
      const project = getProjectById(request.params.id)
      if (!project) return reply.status(404).send({ error: 'Project not found' })

      const existing = listDeploymentsByProject(request.params.id)
      const attemptNumber = existing.length + 1

      const deployment = createDeployment({
        projectId: request.params.id,
        attemptNumber,
      })

      // Auto-start the pipeline immediately
      setImmediate(() => startPipeline(deployment.id).catch(console.error))

      return reply.status(201).send({ deployment })
    }
  )
}
