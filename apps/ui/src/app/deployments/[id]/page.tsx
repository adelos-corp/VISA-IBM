'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { deployments, type Deployment, type DeploymentEvent, type LogEntry } from '@/lib/api'

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  ANALYZING: 'Analyzing',
  CHECKING: 'Checking',
  AWAITING_APPROVAL: 'Awaiting Approval',
  DEPLOYING: 'Deploying',
  VERIFYING: 'Verifying',
  LIVE: 'Live',
  FAILED: 'Failed',
  CORRECTING: 'Auto-Correcting',
  TERMINAL: 'Terminated',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-700 border-gray-300',
  ANALYZING: 'bg-blue-50 text-blue-700 border-blue-300',
  CHECKING: 'bg-blue-50 text-blue-700 border-blue-300',
  AWAITING_APPROVAL: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  DEPLOYING: 'bg-blue-50 text-blue-700 border-blue-300',
  VERIFYING: 'bg-blue-50 text-blue-700 border-blue-300',
  LIVE: 'bg-green-50 text-green-700 border-green-300',
  FAILED: 'bg-red-50 text-red-700 border-red-300',
  CORRECTING: 'bg-purple-50 text-purple-700 border-purple-300',
  TERMINAL: 'bg-red-50 text-red-700 border-red-300',
}

const TERMINAL_STATUSES = new Set(['LIVE', 'TERMINAL'])

// ─── Component ────────────────────────────────────────────────────────────────

export default function DeploymentPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [deployment, setDeployment] = useState<Deployment | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [approving, setApproving] = useState(false)

  const logsEndRef = useRef<HTMLDivElement>(null)

  // Load initial deployment + logs
  useEffect(() => {
    deployments.get(id).then(({ deployment: d }) => setDeployment(d)).catch((e) =>
      setError(e.message)
    )
    deployments.getLogs(id).then(({ logs: l }) => setLogs(l)).catch(() => {})
  }, [id])

  // SSE stream
  useEffect(() => {
    if (!deployment) return
    if (TERMINAL_STATUSES.has(deployment.status)) return

    const es = deployments.streamEvents(
      id,
      (event: DeploymentEvent) => {
        if (event.type === 'status') {
          const newStatus = event.payload.status as string
          setDeployment((prev) => prev ? { ...prev, status: newStatus as Deployment['status'] } : prev)
        }
        if (event.type === 'log') {
          const entry = event.payload as unknown as LogEntry
          setLogs((prev) => [...prev, entry])
        }
      },
      () => {} // ignore connection errors, SSE will reconnect
    )

    return () => es.close()
  }, [id, deployment?.status]) // re-subscribe when status changes

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleApproval = useCallback(
    async (gate: 'DEPLOY' | 'CORRECT', decision: 'APPROVED' | 'REJECTED') => {
      if (!deployment) return
      setApproving(true)
      try {
        await deployments.approve(id, { gate, decision })
        const { deployment: updated } = await deployments.get(id)
        setDeployment(updated)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Approval failed')
      } finally {
        setApproving(false)
      }
    },
    [id, deployment]
  )

  if (error) {
    return (
      <PageShell>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm text-red-600 underline"
          >
            ← Back to home
          </button>
        </div>
      </PageShell>
    )
  }

  if (!deployment) {
    return (
      <PageShell>
        <div className="text-center py-16 text-gray-400">Loading…</div>
      </PageShell>
    )
  }

  const statusLabel = STATUS_LABEL[deployment.status] ?? deployment.status
  const statusColor = STATUS_COLOR[deployment.status] ?? 'bg-gray-100 text-gray-700 border-gray-300'
  const isTerminal = TERMINAL_STATUSES.has(deployment.status)

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <span>→</span>
        <Link href="/projects" className="hover:text-gray-900">Projects</Link>
        <span>→</span>
        <span className="text-gray-900 font-medium">Deployment {id.slice(0, 8)}</span>
      </div>

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 mb-1">
              Deployment #{deployment.attemptNumber}
            </h1>
            <p className="text-sm text-gray-500 font-mono">{deployment.id}</p>
          </div>
          <span
            className={`text-sm font-medium border rounded-full px-3 py-1 whitespace-nowrap ${statusColor}`}
          >
            {isTerminal ? '' : '⟳ '}{statusLabel}
          </span>
        </div>

        {deployment.dockerImageId && (
          <p className="mt-3 text-xs text-gray-400">
            Image: <span className="font-mono">{deployment.dockerImageId}</span>
          </p>
        )}
        {deployment.containerId && (
          <p className="text-xs text-gray-400">
            Container: <span className="font-mono">{deployment.containerId}</span>
          </p>
        )}
        {deployment.completedAt && (
          <p className="mt-2 text-xs text-gray-400">
            Completed: {new Date(deployment.completedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Approval gate */}
      {deployment.status === 'AWAITING_APPROVAL' && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-yellow-800 mb-1">
            Approval Required
          </h2>
          <p className="text-sm text-yellow-700 mb-4">
            VISA has analyzed the project and built a deployment plan. Review the
            logs below, then approve or reject this deployment.
          </p>
          <div className="flex gap-3">
            <button
              disabled={approving}
              onClick={() => handleApproval('DEPLOY', 'APPROVED')}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {approving ? 'Submitting…' : '✓ Approve Deployment'}
            </button>
            <button
              disabled={approving}
              onClick={() => handleApproval('DEPLOY', 'REJECTED')}
              className="bg-white hover:bg-red-50 disabled:opacity-50 text-red-600 border border-red-300 text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              ✕ Reject
            </button>
          </div>
        </div>
      )}

      {/* Correction approval gate */}
      {deployment.status === 'FAILED' && (
        <div className="bg-orange-50 border border-orange-300 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-orange-800 mb-1">
            Failure Detected — Correction Available
          </h2>
          <p className="text-sm text-orange-700 mb-4">
            Bob has diagnosed the failure and proposed an automated correction.
            Review the diagnosis logs and approve to let VISA auto-correct and
            redeploy.
          </p>
          <div className="flex gap-3">
            <button
              disabled={approving}
              onClick={() => handleApproval('CORRECT', 'APPROVED')}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {approving ? 'Submitting…' : '↻ Approve Auto-Correction'}
            </button>
            <button
              disabled={approving}
              onClick={() => handleApproval('CORRECT', 'REJECTED')}
              className="bg-white hover:bg-red-50 disabled:opacity-50 text-red-600 border border-red-300 text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              ✕ Reject — Terminate
            </button>
          </div>
        </div>
      )}

      {/* Live badge */}
      {deployment.status === 'LIVE' && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-5 mb-6 flex items-center gap-3">
          <span className="text-2xl">🟢</span>
          <div>
            <p className="text-green-800 font-semibold">Deployment is Live</p>
            <p className="text-sm text-green-700">
              The application is running and health checks passed.
            </p>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            Deployment Logs
          </h2>
          <span className="text-xs text-gray-400">{logs.length} lines</span>
        </div>
        <div className="bg-gray-950 rounded-b-xl font-mono text-xs text-gray-300 p-4 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-600 italic">No logs yet…</p>
          ) : (
            logs.map((log) => (
              <div key={log.lineNumber} className="flex gap-3 leading-5">
                <span className="text-gray-600 select-none w-8 text-right shrink-0">
                  {log.lineNumber}
                </span>
                <span className="text-gray-500 shrink-0">[{log.source}]</span>
                <span className="break-all">{log.content}</span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </PageShell>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">VISA</h1>
              <p className="text-xs text-gray-500 leading-none mt-0.5">
                Fast · Approved · Auto-Correctible
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded px-2 py-1">
            Powered by IBM Bob 2.0
          </span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
