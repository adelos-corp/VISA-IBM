import { PipelineSteps } from '@/components/PipelineSteps'
import { EmptyState } from '@/components/EmptyState'
import { DeployForm } from '@/components/DeployForm'
import { StatsBar } from '@/components/StatsBar'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <Link
              href="/projects"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Projects
            </Link>
            <span className="text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded px-2 py-1">
              Powered by IBM Bob 2.0
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Pipeline overview */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Core Workflow
          </h2>
          <PipelineSteps />
        </section>

        {/* Stats row */}
        <StatsBar />

        {/* New deployment CTA */}
        <section className="mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              Deploy a Repository
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Paste a Git URL or local path. VISA will analyze, plan, and guide
              you through approval before deploying.
            </p>
            <DeployForm />
          </div>
        </section>

        {/* Deployment list */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Recent Deployments
          </h2>
          <EmptyState />
        </section>
      </main>
    </div>
  )
}
