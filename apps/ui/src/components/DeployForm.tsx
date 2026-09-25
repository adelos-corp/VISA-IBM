'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { projects } from '@/lib/api'

export function DeployForm() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    try {
      const isGit = trimmed.startsWith('https://') || trimmed.startsWith('git@') || trimmed.endsWith('.git')
      const { project } = await projects.create(isGit ? { gitUrl: trimmed } : { localPath: trimmed })
      const { deployment } = await projects.createDeployment(project.id)
      router.push(`/deployments/${deployment.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-1.5 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="M4 15.5V4.5m0 0L7 7.5M4 4.5L1 7.5M8.5 15.5h7a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
              placeholder="Git URL or /path/to/local/project"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-50"
            />
          </div>
          <button type="submit" disabled={loading || !value.trim()} className="rounded-lg bg-slate-950 px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
            {loading ? 'Preparing…' : 'Analyze repository'}
          </button>
        </div>
      </div>
      {error && <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</div>}
    </form>
  )
}
