import { execa } from 'execa'
import type { DeploymentPlan } from '../store/pipeline.store'

export interface DockerBuildResult {
  imageId: string
  logs: string[]
}

export interface DockerRunResult {
  containerId: string
  port: number
}

// ─── Build image ──────────────────────────────────────────────────────────────

export async function buildImage(
  projectPath: string,
  tag: string,
  onLog: (line: string) => void
): Promise<DockerBuildResult> {
  const logs: string[] = []

  const result = await execa('docker', ['build', '-t', tag, '.'], {
    cwd: projectPath,
    all: true,
    reject: false,
  })

  const combined = (result.all ?? '').split('\n')
  for (const line of combined) {
    if (line) { logs.push(line); onLog(line) }
  }

  if (result.exitCode !== 0) {
    throw new Error(`docker build failed (exit ${result.exitCode})`)
  }

  // Get the image ID
  const inspectResult = await execa('docker', ['inspect', '--format={{.Id}}', tag], { reject: false })
  const imageId = inspectResult.stdout?.trim() ?? tag

  return { imageId, logs }
}

// ─── Run container ────────────────────────────────────────────────────────────

export async function runContainer(
  tag: string,
  plan: DeploymentPlan,
  onLog: (line: string) => void
): Promise<DockerRunResult> {
  const hostPort = plan.port + 10000 // avoid conflicts — map 8080 → 18080

  const envArgs: string[] = []
  for (const [k, v] of Object.entries(plan.envVars)) {
    envArgs.push('-e', `${k}=${v}`)
  }

  const containerName = tag.replace(/[^a-z0-9-]/g, '-')

  // Make retries/redeployments deterministic. A failed first attempt leaves
  // an exited container behind, and Docker refuses to reuse its name.
  await execa('docker', ['rm', '-f', containerName], { reject: false })

  const args = [
    'run', '-d',
    '--name', containerName,
    '-p', `${hostPort}:${plan.port}`,
    ...envArgs,
    tag,
  ]

  onLog(`docker ${args.join(' ')}`)

  const result = await execa('docker', args, { reject: false })
  if (result.exitCode !== 0) {
    throw new Error(`docker run failed: ${result.stderr}`)
  }

  const containerId = result.stdout.trim()
  onLog(`Container started: ${containerId.slice(0, 12)}`)

  return { containerId, port: hostPort }
}

// ─── Tail container logs and wait for exit ────────────────────────────────────

export async function waitForContainerExit(
  containerId: string,
  timeoutMs: number,
  onLog: (line: string) => void
): Promise<{ exitCode: number; logs: string[] }> {
  const logs: string[] = []

  // Wait for container to settle, then grab logs
  await new Promise(r => setTimeout(r, timeoutMs))

  const logResult = await execa('docker', ['logs', '--tail=200', containerId], {
    reject: false,
    all: true,
  })

  const combined = (logResult.all ?? '').split('\n')
  for (const line of combined) {
    if (line) { logs.push(line); onLog(line) }
  }

  // Inspect exit code
  const inspect = await execa(
    'docker', ['inspect', '--format={{.State.ExitCode}}', containerId],
    { reject: false }
  )
  const exitCode = parseInt(inspect.stdout?.trim() ?? '1', 10)
  return { exitCode, logs }
}

// ─── Stop & remove container ──────────────────────────────────────────────────

export async function stopContainer(containerId: string): Promise<void> {
  await execa('docker', ['stop', containerId], { reject: false })
  await execa('docker', ['rm', '-f', containerId], { reject: false })
}

export async function removeImage(tag: string): Promise<void> {
  await execa('docker', ['rmi', '-f', tag], { reject: false })
}

// ─── Check if container is still running ─────────────────────────────────────

export async function isContainerRunning(containerId: string): Promise<boolean> {
  const r = await execa(
    'docker', ['inspect', '--format={{.State.Running}}', containerId],
    { reject: false }
  )
  return r.stdout?.trim() === 'true'
}
