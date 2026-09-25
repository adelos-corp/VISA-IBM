// HTTP health verifier — polls the app's /health endpoint after container start

const MAX_ATTEMPTS = 10
const RETRY_INTERVAL_MS = 2000

export interface VerifyResult {
  healthy: boolean
  httpStatus: number | null
  responseTimeMs: number | null
  attempts: number
  endpoint: string
}

export async function verifyHealth(
  hostPort: number,
  healthPath: string,
  onLog: (line: string) => void
): Promise<VerifyResult> {
  const endpoint = `http://localhost:${hostPort}${healthPath}`
  onLog(`[verify] Probing ${endpoint} (up to ${MAX_ATTEMPTS} attempts)`)

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    await sleep(RETRY_INTERVAL_MS)
    const t0 = Date.now()
    try {
      const res = await fetchWithTimeout(endpoint, 5000)
      const responseTimeMs = Date.now() - t0
      onLog(`[verify] attempt ${attempt}: HTTP ${res.status} in ${responseTimeMs}ms`)
      if (res.status >= 200 && res.status < 300) {
        return { healthy: true, httpStatus: res.status, responseTimeMs, attempts: attempt, endpoint }
      }
    } catch (e) {
      onLog(`[verify] attempt ${attempt}: ${e}`)
    }
  }

  return { healthy: false, httpStatus: null, responseTimeMs: null, attempts: MAX_ATTEMPTS, endpoint }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}
