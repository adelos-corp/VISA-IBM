'use client'

import { useEffect, useState } from 'react'
import { projects as projectsApi, type Deployment } from '@/lib/api'

interface Stats { total: number; live: number; failed: number; corrected: number }

async function fetchStats(): Promise<Stats> {
  const { projects } = await projectsApi.list()
  const allDeployments: Deployment[] = []
  await Promise.all(projects.map(async (p) => {
    const { deployments } = await projectsApi.listDeployments(p.id)
    allDeployments.push(...deployments)
  }))
  return {
    total: allDeployments.length,
    live: allDeployments.filter((d) => d.status === 'LIVE').length,
    failed: allDeployments.filter((d) => d.status === 'TERMINAL').length,
    corrected: allDeployments.filter((d) => d.attemptNumber > 1 && d.status === 'LIVE').length,
  }
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats>({ total: 0, live: 0, failed: 0, corrected: 0 })
  useEffect(() => { fetchStats().then(setStats).catch(() => {}) }, [])

  const cards = [
    ['Deployments', stats.total, 'text-white'],
    ['Live', stats.live, 'text-slate-200'],
    ['Terminated', stats.failed, 'text-slate-400'],
    ['Recovered', stats.corrected, 'text-slate-300'],
  ]

  return (
    <section className="mb-6 grid grid-cols-2 divide-x divide-y divide-white/10 overflow-hidden rounded-md border border-white/10 sm:grid-cols-4 sm:divide-y-0">
      {cards.map(([label, value, tone]) => (
        <div key={label as string} className="bg-white/[0.045] px-4 py-3">
          <p className="text-xs text-slate-500">{label}</p>
          <p className={`mt-1 text-lg font-semibold ${tone}`}>{value}</p>
        </div>
      ))}
    </section>
  )
}
