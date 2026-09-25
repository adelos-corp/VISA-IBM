import { PipelineSteps } from '@/components/PipelineSteps'
import { EmptyState } from '@/components/EmptyState'
import { DeployForm } from '@/components/DeployForm'
import { StatsBar } from '@/components/StatsBar'
import { Hero } from '@/components/Hero'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />

      <main className="mx-auto max-w-6xl px-4 pb-12">
        <StatsBar />

        <section className="mb-8 rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">New deployment</h2>
            <p className="mt-0.5 text-xs text-slate-500">Connect a Git repository or local project.</p>
          </div>
          <div className="p-4"><DeployForm /></div>
        </section>

        <section className="mb-8 rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Workflow</h2>
            <p className="mt-0.5 text-xs text-slate-500">Controlled execution from source to verified live state.</p>
          </div>
          <div className="overflow-x-auto p-4"><PipelineSteps /></div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent deployments</h2>
              <p className="mt-0.5 text-xs text-slate-500">Latest activity across managed projects.</p>
            </div>
            <Link href="/projects" className="text-xs font-medium text-blue-600 hover:underline">View projects →</Link>
          </div>
          <EmptyState />
        </section>
      </main>
    </div>
  )
}
