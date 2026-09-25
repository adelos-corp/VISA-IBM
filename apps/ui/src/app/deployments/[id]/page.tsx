'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { deployments, type Deployment, type DeploymentEvent, type LogEntry } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StageUpdate { stage: string; stageStatus: 'RUNNING' | 'DONE' | 'FAILED'; [k: string]: unknown }
interface DiagnosisInfo {
  failureType: string; rootCause: string; proposedCorrectionJson: string
  confidence: number; rationale: string; id: string
}
interface Plan { imageTag: string; port: number; healthPath: string; steps: string[] }
interface CheckResult { name: string; status: string; message: string }

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending', ANALYZING: 'Analyzing…', CHECKING: 'Pre-Checks…',
  AWAITING_APPROVAL: 'Awaiting Approval', DEPLOYING: 'Deploying…',
  VERIFYING: 'Verifying…', LIVE: 'Live', FAILED: 'Failed',
  CORRECTING: 'Auto-Correcting…', TERMINAL: 'Terminated',
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
  const [stages, setStages] = useState<Record<string, StageUpdate>>({})
  const [plan, setPlan] = useState<Plan | null>(null)
  const [checks, setChecks] = useState<CheckResult[] | null>(null)
  const [diagnosis, setDiagnosis] = useState<DiagnosisInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [approving, setApproving] = useState(false)

  const logsEndRef = useRef<HTMLDivElement>(null)

  // Initial load
  useEffect(() => {
    deployments.get(id).then(({ deployment: d }) => setDeployment(d)).catch(e => setError(e.message))
    deployments.getLogs(id).then(({ logs: l }) => setLogs(l)).catch(() => {})
    deployments.getPlan(id).then(r => { if (r.plan) setPlan(r.plan) }).catch(() => {})
    deployments.getChecks(id).then(r => { if (r.report) setChecks(r.report.checks) }).catch(() => {})
    deployments.getDiagnosis(id).then(r => { if (r.diagnosis) setDiagnosis(r.diagnosis) }).catch(() => {})
  }, [id])

  // SSE
  useEffect(() => {
    if (!deployment) return
    if (TERMINAL_STATUSES.has(deployment.status)) return

    const es = deployments.streamEvents(id, (event: DeploymentEvent) => {
      if (event.type === 'status') {
        const newStatus = event.payload.status as string
        setDeployment(prev => prev ? { ...prev, status: newStatus as Deployment['status'] } : prev)
        // Refresh derived data when status changes
        if (newStatus === 'AWAITING_APPROVAL') {
          deployments.getPlan(id).then(r => { if (r.plan) setPlan(r.plan) }).catch(() => {})
          deployments.getChecks(id).then(r => { if (r.report) setChecks(r.report.checks) }).catch(() => {})
        }
        if (newStatus === 'FAILED') {
          deployments.getDiagnosis(id).then(r => { if (r.diagnosis) setDiagnosis(r.diagnosis) }).catch(() => {})
        }
      }
      if (event.type === 'stage') {
        const s = event.payload as unknown as StageUpdate
        setStages(prev => ({ ...prev, [s.stage]: s }))
      }
      if (event.type === 'log') {
        setLogs(prev => [...prev, event.payload as unknown as LogEntry])
      }
    }, () => {})

    return () => es.close()
  }, [id, deployment?.status])

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleApproval = useCallback(async (gate: 'DEPLOY' | 'CORRECT', decision: 'APPROVED' | 'REJECTED') => {
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
  }, [id, deployment])

  if (error) return (
    <PageShell>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium">{error}</p>
        <button onClick={() => router.push('/')} className="mt-4 text-sm text-red-600 underline">← Back</button>
      </div>
    </PageShell>
  )

  if (!deployment) return <PageShell><div className="text-center py-16 text-gray-400">Loading…</div></PageShell>

  const statusLabel = STATUS_LABEL[deployment.status] ?? deployment.status
  const statusColor = STATUS_COLOR[deployment.status] ?? 'bg-gray-100 text-gray-700 border-gray-300'
  const isTerminal = TERMINAL_STATUSES.has(deployment.status)
  const diagnosisCorrection = diagnosis ? JSON.parse(diagnosis.proposedCorrectionJson) : null

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

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 mb-1">Deployment #{deployment.attemptNumber}</h1>
            <p className="text-sm text-gray-500 font-mono">{deployment.id}</p>
          </div>
          <span className={`text-sm font-medium border rounded-full px-3 py-1 whitespace-nowrap ${statusColor}`}>
            {!isTerminal && '⟳ '}{statusLabel}
          </span>
        </div>
        {deployment.containerId && (
          <p className="mt-2 text-xs text-gray-400">Container: <span className="font-mono">{deployment.containerId.slice(0, 12)}</span></p>
        )}
        {deployment.completedAt && (
          <p className="text-xs text-gray-400">Completed: {new Date(deployment.completedAt).toLocaleString()}</p>
        )}
      </div>

      {/* Stage tracker */}
      <StageTracker stages={stages} status={deployment.status} />

      {/* Pre-check results */}
      {checks && checks.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Pre-Checks</h2>
          <div className="flex flex-col gap-2">
            {checks.map(c => (
              <div key={c.name} className="flex items-start gap-3 text-sm">
                <span className={`font-mono font-bold shrink-0 ${c.status === 'PASS' ? 'text-green-600' : c.status === 'WARN' ? 'text-yellow-600' : 'text-red-600'}`}>
                  [{c.status}]
                </span>
                <span className="text-gray-600"><span className="font-medium text-gray-800">{c.name}:</span> {c.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan */}
      {plan && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Deployment Plan</h2>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-500">Image: <span className="font-mono text-gray-800">{plan.imageTag}</span></p>
            <p className="text-xs text-gray-500">Port: <span className="font-mono text-gray-800">{plan.port}</span> → host <span className="font-mono text-gray-800">{plan.port + 10000}</span></p>
            <p className="text-xs text-gray-500">Health: <span className="font-mono text-gray-800">{plan.healthPath}</span></p>
          </div>
          <div className="mt-3 bg-gray-950 rounded-lg p-3 font-mono text-xs text-gray-300">
            {plan.steps.map((s, i) => <div key={i} className="leading-5">$ {s}</div>)}
          </div>
        </div>
      )}

      {/* Gate 1: Approval */}
      {deployment.status === 'AWAITING_APPROVAL' && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-6 mb-4">
          <h2 className="text-base font-semibold text-yellow-800 mb-1">Approval Required — Gate 1</h2>
          <p className="text-sm text-yellow-700 mb-4">
            Analysis and pre-checks are complete. Review the plan above and logs below, then approve or reject.
          </p>
          <div className="flex gap-3">
            <button disabled={approving} onClick={() => handleApproval('DEPLOY', 'APPROVED')}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
              {approving ? 'Submitting…' : '✓ Approve Deployment'}
            </button>
            <button disabled={approving} onClick={() => handleApproval('DEPLOY', 'REJECTED')}
              className="bg-white hover:bg-red-50 disabled:opacity-50 text-red-600 border border-red-300 text-sm font-medium px-5 py-2 rounded-lg transition-colors">
              ✕ Reject
            </button>
          </div>
        </div>
      )}

      {/* Diagnosis + Gate 2 */}
      {deployment.status === 'FAILED' && diagnosis && (
        <div className="bg-orange-50 border border-orange-300 rounded-xl p-6 mb-4">
          <h2 className="text-base font-semibold text-orange-800 mb-2">Failure Diagnosed — Gate 2</h2>
          <div className="mb-3 text-sm text-orange-900 space-y-1">
            <p><span className="font-medium">Type:</span> {diagnosis.failureType} ({Math.round(diagnosis.confidence * 100)}% confidence)</p>
            <p><span className="font-medium">Root cause:</span> {diagnosis.rootCause}</p>
            <p><span className="font-medium">Rationale:</span> {diagnosis.rationale}</p>
          </div>
          {diagnosisCorrection?.diff && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-orange-700 mb-1">Proposed Correction Diff:</p>
              <pre className="bg-gray-950 text-xs text-gray-300 rounded-lg p-3 overflow-x-auto whitespace-pre font-mono leading-5">
                {diagnosisCorrection.diff.split('\n').map((line: string, i: number) => (
                  <span key={i} className={line.startsWith('+') ? 'text-green-400' : line.startsWith('-') ? 'text-red-400' : ''}>{line}{'\n'}</span>
                ))}
              </pre>
            </div>
          )}
          {diagnosis.failureType === 'CORRECTABLE' ? (
            <div className="flex gap-3">
              <button disabled={approving} onClick={() => handleApproval('CORRECT', 'APPROVED')}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                {approving ? 'Submitting…' : '↻ Approve Auto-Correction'}
              </button>
              <button disabled={approving} onClick={() => handleApproval('CORRECT', 'REJECTED')}
                className="bg-white hover:bg-red-50 disabled:opacity-50 text-red-600 border border-red-300 text-sm font-medium px-5 py-2 rounded-lg transition-colors">
                ✕ Reject — Terminate
              </button>
            </div>
          ) : (
            <p className="text-sm text-orange-700 font-medium">
              {diagnosis.failureType === 'UNRECOVERABLE'
                ? 'This failure cannot be auto-corrected. Manual investigation required.'
                : 'Human intervention required — auto-correction not available for this failure type.'}
            </p>
          )}
        </div>
      )}

      {/* Live badge */}
      {deployment.status === 'LIVE' && (
        <div className="bg-green-50 border border-green-300 rounded-xl p-5 mb-4 flex items-center gap-3">
          <span className="text-2xl">🟢</span>
          <div>
            <p className="text-green-800 font-semibold">Deployment is Live</p>
            <p className="text-sm text-green-700">Health check passed. Container is running.</p>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Deployment Logs</h2>
          <span className="text-xs text-gray-400">{logs.length} lines</span>
        </div>
        <div className="bg-gray-950 rounded-b-xl font-mono text-xs text-gray-300 p-4 max-h-[32rem] overflow-y-auto">
          {logs.length === 0
            ? <p className="text-gray-600 italic">No logs yet…</p>
            : logs.map(log => (
              <div key={log.lineNumber} className="flex gap-3 leading-5">
                <span className="text-gray-600 select-none w-8 text-right shrink-0">{log.lineNumber}</span>
                <span className={`shrink-0 ${log.source.startsWith('check') ? 'text-yellow-500' : log.source === 'diagnosis' ? 'text-orange-400' : log.source === 'verify' ? 'text-cyan-400' : 'text-gray-500'}`}>[{log.source}]</span>
                <span className="break-all">{log.content}</span>
              </div>
            ))
          }
          <div ref={logsEndRef} />
        </div>
      </div>
    </PageShell>
  )
}

// ─── Stage Tracker ────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { key: 'analysis', label: 'Analysis' },
  { key: 'pre-checks', label: 'Pre-Checks' },
  { key: 'deploy', label: 'Deploy' },
  { key: 'verification', label: 'Verify' },
  { key: 'diagnosis', label: 'Diagnose' },
  { key: 'correction', label: 'Correct' },
  { key: 'redeploy', label: 'Redeploy' },
]

function StageTracker({ stages, status }: { stages: Record<string, StageUpdate>; status: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-4">
      <div className="flex items-center gap-1 flex-wrap">
        {PIPELINE_STAGES.map((s, i) => {
          const update = stages[s.key]
          const isDone = update?.stageStatus === 'DONE' || (s.key === 'analysis' && ['CHECKING', 'AWAITING_APPROVAL', 'DEPLOYING', 'VERIFYING', 'LIVE', 'FAILED', 'CORRECTING', 'TERMINAL'].includes(status))
          const isFailed = update?.stageStatus === 'FAILED'
          const isRunning = update?.stageStatus === 'RUNNING'
          const color = isFailed ? 'text-red-600 border-red-300 bg-red-50' : isDone ? 'text-green-700 border-green-300 bg-green-50' : isRunning ? 'text-blue-700 border-blue-300 bg-blue-50 animate-pulse' : 'text-gray-400 border-gray-200 bg-gray-50'
          return (
            <div key={s.key} className="flex items-center gap-1">
              <span className={`text-xs border rounded px-2 py-0.5 font-medium ${color}`}>{s.label}</span>
              {i < PIPELINE_STAGES.length - 1 && <span className="text-gray-300 text-xs">→</span>}
            </div>
          )
        })}
      </div>
    </div>
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
              <p className="text-xs text-gray-500 leading-none mt-0.5">Fast · Approved · Auto-Correctible</p>
            </div>
          </div>
          <span className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded px-2 py-1">Powered by IBM Bob 2.0</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
