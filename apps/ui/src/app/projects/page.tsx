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
  PENDING: 'bg-gray-100 text-gray-600',
  ANALYZING: 'bg-blue-50 text-blue-700',
  CHECKING: 'bg-blue-50 text-blue-700',
  AWAITING_APPROVAL: 'bg-yellow-50 text-yellow-800',
  DEPLOYING: 'bg-blue-50 text-blue-700',
  VERIFYING: 'bg-blue-50 text-blue-700',
  LIVE: 'bg-green-50 text-green-700',
  FAILED: 'bg-red-50 text-red-700',
  CORRECTING: 'bg-purple-50 text-purple-700',
  TERMINAL: 'bg-red-50 text-red-700',
}

export default function ProjectsPage() {
  const [items, setItems] = useState<ProjectWithLatest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    projectsApi
      .list()
      .then(async ({ projects }) => {
        const enriched = await Promise.all(
          projects.map(async (project) => {
            const { deployments } = await projectsApi.listDeployments(project.id)
            return {
              project,
              latest: deployments[0] ?? null,
              total: deployments.length,
            }
          })
        )
        setItems(enriched)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

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
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              ← Home
            </Link>
            <span className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded px-2 py-1">
              Powered by IBM Bob 2.0
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          All Projects
        </h2>

        {loading && (
          <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">No projects yet</p>
            <p className="text-xs text-gray-400">
              <Link href="/" className="text-blue-600 hover:underline">
                Deploy a repository
              </Link>{' '}
              to create your first project.
            </p>
          </div>
        )}

        {items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map(({ project, latest, total }) => (
              <div
                key={project.id}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{project.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                    {project.gitUrl ?? project.localPath ?? project.id}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-gray-400">{total} deployment{total !== 1 ? 's' : ''}</span>

                  {latest ? (
                    <Link
                      href={`/deployments/${latest.id}`}
                      className={`text-xs font-medium rounded-full px-2.5 py-1 ${STATUS_COLOR[latest.status] ?? 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-opacity`}
                    >
                      {latest.status}
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-400">No deployments</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
