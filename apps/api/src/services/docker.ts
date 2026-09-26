import { execa } from 'execa'\nimport { Sandbox } from '@vercel/sandbox'\nimport type { DeploymentPlan } from '../store/pipeline.store'\n\nexport interface DockerBuildResult {\n  imageId: string\n  logs: string[]\n}\n\nexport interface DockerRunResult {\n  containerId: string\n  port: number\n}\n\nconst USE_VERCEL_SANDBOX = process.env.RUNNER_MODE === 'vercel-sandbox' || process.env.VERCEL === '1'\nconst PROJECT_DIR = '/vercel/sandbox/project'\n\nasync function getSandbox(name: string, port?: number): Promise<Sandbox> {
  try {
    return await Sandbox.get({ name })
  } catch {
    return await Sandbox.create({
      name,
      ports: port ? [port] : undefined,
      timeout: 24 * 60 * 60 * 1000,
    })
  }
}}