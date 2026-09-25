import { PipelineSteps } from '@/components/PipelineSteps'
import { EmptyState } from '@/components/EmptyState'
import { DeployForm } from '@/components/DeployForm'
import { StatsBar } from '@/components/StatsBar'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-xs font-bold text-white">V</div>
            <span className="text-sm font-semibold text-slate-900">VISA</span>
            <span className="hidden text-xs text-slate-400 sm:inline">/ Deployment Platform</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/" className="rounded-md px-3 py-1.5 font-medium text-slate-900 hover:bg-slate-100">Overview</Link>
            <Link href="/projects" className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900">Projects</Link>
            <span className="ml-2 flex items-center gap-1.5 border-l border-slate-200 pl-3 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Operational
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Deployments</h1>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">VISA</span>
          </div>
          <p className="text-sm text-slate-500">Analyze, approve, deploy, recover, and verify applications.</p>
        </div>

        <StatsBar />

        <section className="mb-8 rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">New deployment</h2>
            <p className="mt-0.5 text-xs text-slate-500">Connect a Git repository or local project.</p>
          </div>
          <div className="p-4">
            <DeployForm />
          </div>
        </section>

        <section className="mb-8 rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Workflow</h2>
            <p className="mt-0.5 text-xs text-slate-500">Controlled execution from source to verified live state.</p>
          </div>
          <div className="overflow-x-auto p-4">
            <PipelineSteps />
          </div>
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
