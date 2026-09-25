import { PipelineSteps } from '@/components/PipelineSteps'
import { EmptyState } from '@/components/EmptyState'
import { DeployForm } from '@/components/DeployForm'
import { StatsBar } from '@/components/StatsBar'
import { Hero } from '@/components/Hero'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#182235_0%,#0b1220_34%,#050912_68%,#02040a_100%)] text-white">
      <Hero />

      <main className="mx-auto max-w-6xl px-4 pb-12">
        <StatsBar />

        <section className="mb-8 rounded-xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-blue-950/20 backdrop-blur-sm">
          <div className="border-b border-white/10 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">New deployment</h2>
            <p className="mt-0.5 text-xs text-blue-100/60">Connect a Git repository or local project.</p>
          </div>
          <div className="p-4"><DeployForm /></div>
        </section>

        <section className="mb-8 rounded-xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-blue-950/20 backdrop-blur-sm">
          <div className="border-b border-white/10 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">Workflow</h2>
            <p className="mt-0.5 text-xs text-blue-100/60">Controlled execution from source to verified live state.</p>
          </div>
          <div className="overflow-x-auto p-4"><PipelineSteps /></div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Recent deployments</h2>
              <p className="mt-0.5 text-xs text-blue-100/60">Latest activity across managed projects.</p>
            </div>
            <Link href="/projects" className="text-xs font-medium text-blue-300 hover:text-white hover:underline">View projects →</Link>
          </div>
          <EmptyState />
        </section>
      </main>
    </div>
  )
}
