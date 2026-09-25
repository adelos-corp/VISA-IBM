import fs from 'fs'
import path from 'path'
import type { CheckResult } from '../store/pipeline.store'

// ─── Parallel pre-checks ──────────────────────────────────────────────────────

export async function runPreChecks(projectPath: string): Promise<{
  checks: CheckResult[]
  overallStatus: 'PASS' | 'WARN' | 'FAIL'
}> {
  const [dockerfile, deps, config] = await Promise.all([
    checkDockerfile(projectPath),
    checkDependencies(projectPath),
    checkConfig(projectPath),
  ])

  const checks = [dockerfile, deps, config]
  const overallStatus = checks.some(c => c.status === 'FAIL')
    ? 'FAIL'
    : checks.some(c => c.status === 'WARN')
    ? 'WARN'
    : 'PASS'

  return { checks, overallStatus }
}

// 1. Dockerfile linter
async function checkDockerfile(projectPath: string): Promise<CheckResult> {
  const dfPath = path.join(projectPath, 'Dockerfile')
  if (!fs.existsSync(dfPath)) {
    return { name: 'Dockerfile Linter', status: 'FAIL', message: 'No Dockerfile found in project root.' }
  }
  const content = fs.readFileSync(dfPath, 'utf8')
  const warnings: string[] = []

  if (!content.includes('HEALTHCHECK') && !content.includes('EXPOSE')) {
    warnings.push('No EXPOSE directive found.')
  }
  if (content.includes('FROM node:latest') || content.includes('FROM ubuntu:latest')) {
    warnings.push('Using :latest tag — pin to a specific version for reproducibility.')
  }
  if (!content.match(/^USER\s/m) && content.includes('FROM')) {
    warnings.push('No USER directive — container will run as root.')
  }
  const hasCmd = content.includes('CMD') || content.includes('ENTRYPOINT')
  if (!hasCmd) {
    return { name: 'Dockerfile Linter', status: 'FAIL', message: 'No CMD or ENTRYPOINT directive.' }
  }

  if (warnings.length > 0) {
    return { name: 'Dockerfile Linter', status: 'WARN', message: warnings.join(' ') }
  }
  return { name: 'Dockerfile Linter', status: 'PASS', message: 'Dockerfile looks good.' }
}

// 2. Dependency auditor
async function checkDependencies(projectPath: string): Promise<CheckResult> {
  const pkgPath = path.join(projectPath, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    return { name: 'Dependency Auditor', status: 'PASS', message: 'No package.json (non-Node project).' }
  }
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    const deps = { ...pkg.dependencies }
    const issues: string[] = []

    // Check for known vulnerable or deprecated patterns (heuristic)
    for (const [name, ver] of Object.entries(deps)) {
      const v = String(ver)
      if (v === '*' || v === 'latest') {
        issues.push(`${name}: unpinned version "${v}"`)
      }
    }

    // Check for lockfile
    const hasLock = fs.existsSync(path.join(projectPath, 'package-lock.json'))
      || fs.existsSync(path.join(projectPath, 'yarn.lock'))
      || fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'))

    if (!hasLock) {
      issues.push('No lockfile found — builds may not be reproducible.')
    }

    if (issues.length > 0) {
      return { name: 'Dependency Auditor', status: 'WARN', message: issues.join('; ') }
    }
    return { name: 'Dependency Auditor', status: 'PASS', message: `${Object.keys(deps).length} dependencies checked, no issues.` }
  } catch (e) {
    return { name: 'Dependency Auditor', status: 'WARN', message: `Could not parse package.json: ${e}` }
  }
}

// 3. Config inspector — checks for required env vars documented in code
async function checkConfig(projectPath: string): Promise<CheckResult> {
  const dfPath = path.join(projectPath, 'Dockerfile')
  if (!fs.existsSync(dfPath)) {
    return { name: 'Config Inspector', status: 'PASS', message: 'No Dockerfile to inspect.' }
  }

  const dfContent = fs.readFileSync(dfPath, 'utf8')

  // Find env vars referenced in source but not set in Dockerfile
  const envSetInDockerfile = new Set<string>()
  for (const m of dfContent.matchAll(/^ENV\s+([A-Z_][A-Z0-9_]*)\s*[=\s]/gm)) {
    envSetInDockerfile.add(m[1])
  }

  const missingVars: string[] = []
  const srcFiles: string[] = []
  try {
    for (const f of walkJs(projectPath)) srcFiles.push(f)
  } catch { /* ignore */ }

  for (const srcFile of srcFiles) {
    try {
      const content = fs.readFileSync(srcFile, 'utf8')
      for (const m of content.matchAll(/process\.env\.([A-Z_][A-Z0-9_]*)/g)) {
        const v = m[1]
        if (v === 'NODE_ENV' || v === 'PORT') continue
        if (!envSetInDockerfile.has(v) && !missingVars.includes(v)) {
          missingVars.push(v)
        }
      }
    } catch { /* ignore */ }
  }

  if (missingVars.length > 0) {
    return {
      name: 'Config Inspector',
      status: 'WARN',
      message: `Env vars referenced in code but not set in Dockerfile: ${missingVars.join(', ')}. These must be provided at runtime.`,
    }
  }

  return { name: 'Config Inspector', status: 'PASS', message: 'All referenced env vars are accounted for.' }
}

function* walkJs(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue
    const full = path.join(dir, entry)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) yield* walkJs(full)
    else if (entry.endsWith('.js') || entry.endsWith('.ts')) yield full
  }
}
