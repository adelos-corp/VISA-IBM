'use client'

import { useEffect, useState } from 'react'
import { projects as projectsApi, type Deployment } from '@/lib/api'

interface Stats {
  total: number
  live: number
  failed: number
  corrected: number
}

async function fetchStats(): Promise<Stats> {
  const { projects } = await projectsApi.list()
  const allDeployments: Deployment[] = []

  await Promise.all(
    projects.map(async (p) => {
      const { deployments } = await projectsApi.listDeployments(p.id)
      allDeployments.push(...deployments)
    })
  )

  return {
    total: allDeployments.length,
    live: allDeployments.filter((d) => d.status === 'LIVE').length,
    failed: allDeployments.filter((d) => d.status === 'TERMINAL').length,
    corrected: allDeployments.filter((d) => d.attemptNumber > 1 && d.status === 'LIVE').length,
  }
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats>({ total: 0, live: 0, failed: 0, corrected: 0 })

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {})
  }, [])

  const cards = [
    { label: 'Deployments', value: stats.total, detail: 'Total attempts', tone: 'text-slate-900' },
    { label: 'Live applications', value: stats.live, detail: 'Verified healthy', tone: 'text-emerald-600' },
    { label: 'Terminated', value: stats.failed, detail: 'Stopped workflows', tone: 'text-rose-600' },
    { label: 'Auto-corrected', value: stats.corrected, detail: 'Recovered deployments', tone: 'text-blue-600' },
  ]

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {cards.map((card) => (
        <div key={card.label} className="visa-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-slate-500">{card.label}</p>
            <span className="h-2 w-2 rounded-full bg-slate-200" />
          </div>
          <p className={`text-2xl font-semibold tracking-tight ${card.tone}`}>{card.value}</p>
          <p className="mt-1 text-[11px] text-slate-400">{card.detail}</p>
        </div>
      ))}
    </section>
  )
}
