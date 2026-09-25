'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { projects as projectsApi, type Project, type Deployment } from '@/lib/api'

interface ProjectWithLatest {
  project: Project
  latest: Deployment | null
  total: number
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'border-slate-200 bg-slate-50 text-slate-600',
  ANALYZING: 'border-blue-200 bg-blue-50 text-blue-700',
  CHECKING: 'border-blue-200 bg-blue-50 text-blue-700',
  AWAITING_APPROVAL: 'border-amber-200 bg-amber-50 text-amber-700',
  DEPLOYING: 'border-blue-200 bg-blue-50 text-blue-700',
  VERIFYING: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  LIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  FAILED: 'border-rose-200 bg-rose-50 text-rose-700',
  CORRECTING: 'border-violet-200 bg-violet-50 text-violet-700',
  TERMINAL: 'border-rose-200 bg-rose-50 text-rose-700',
}

export default function ProjectsPage() {
  const [items, setItems] = useState<ProjectWithLatest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    projectsApi.list()
      .then(async ({ projects }) => {
        const enriched = await Promise.all(projects.map(async (project) => {
          const { deployments } = await projectsApi.listDeployments(project.id)
          return { project, latest: deployments[0] ?? null, total: deployments.length }
        }))
        setItems(enriched)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">V</div>
            <div><div className="text-sm font-bold tracking-tight text-slate-950">VISA</div><p className="text-[10px] text-slate-500">Deployment control plane</p></div>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/" className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900">Overview</Link>
            <Link href="/projects" className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900">Projects</Link>
            <span className="ml-3 flex items-center gap-2 text-[10px] font-medium text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Operational
            </span>
          </nav>
        </div>
      </header>

      <main className="visa-grid min-h-[calc(100vh-4rem)] px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="visa-eyebrow">Project inventory</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-slate-950">Projects</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">Repositories and applications managed by the VISA deployment control plane.</p>
            </div>
            <Link href="/" className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800">+ New deployment</Link>
          </div>

          {loading && (
            <div className="visa-card p-10 text-center"><div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" /><p className="text-xs text-slate-500">Loading project inventory…</p></div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"><span className="font-semibold">Control plane error:</span> {error}</div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="visa-card p-14 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">V</div>
              <p className="text-sm font-semibold text-slate-800">No projects registered</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">Connect a repository to create the first managed application.</p>
              <Link href="/" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">Deploy a repository</Link>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="visa-card overflow-hidden">
              <div className="grid grid-cols-[1.4fr_.5fr_.55fr] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                <span>Project</span><span>Deployments</span><span>Latest state</span>
              </div>
              <div className="divide-y divide-slate-100">
                {items.map(({ project, latest, total }) => (
                  <div key={project.id} className="grid grid-cols-1 gap-4 px-5 py-5 transition-colors hover:bg-slate-50/70 sm:grid-cols-[1.4fr_.5fr_.55fr] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700">P</div>
                        <p className="truncate text-sm font-semibold text-slate-900">{project.name}</p>
                      </div>
                      <p className="visa-mono mt-2 truncate text-[10px] text-slate-400">{project.gitUrl ?? project.localPath ?? project.id}</p>
                    </div>
                    <p className="text-xs text-slate-500">{total} deployment{total !== 1 ? 's' : ''}</p>
                    <div>
                      {latest ? (
                        <Link href={`/deployments/${latest.id}`} className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${STATUS_COLOR[latest.status] ?? STATUS_COLOR.PENDING}`}>
                          {latest.status.replace('_', ' ')}
                        </Link>
                      ) : <span className="text-xs text-slate-400">No deployments</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
