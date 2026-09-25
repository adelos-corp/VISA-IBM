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
    fetchStats()
      .then(setStats)
      .catch(() => {}) // silently fail if API is down
  }, [])

  return (
    <section className="grid grid-cols-4 gap-4 mb-8">
      <StatCard label="Total Deployments" value={String(stats.total)} />
      <StatCard label="Live Apps" value={String(stats.live)} color="green" />
      <StatCard label="Failed" value={String(stats.failed)} color="red" />
      <StatCard label="Auto-Corrected" value={String(stats.corrected)} color="blue" />
    </section>
  )
}

function StatCard({
  label,
  value,
  color = 'gray',
}: {
  label: string
  value: string
  color?: 'gray' | 'green' | 'red' | 'blue'
}) {
  const colorMap: Record<string, string> = {
    gray: 'text-gray-900',
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}</p>
    </div>
  )
}
