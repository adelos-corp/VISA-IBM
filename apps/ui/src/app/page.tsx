import { PipelineSteps } from '@/components/PipelineSteps'
import { EmptyState } from '@/components/EmptyState'
import { DeployForm } from '@/components/DeployForm'
import { StatsBar } from '@/components/StatsBar'
import Link from 'next/link'

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-sm">V</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-slate-950">VISA</span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700">Platform</span>
              </div>
              <p className="text-[10px] text-slate-500">Fast · Approved · Auto-Correctible</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Link href="/" className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900">Overview</Link>
            <Link href="/projects" className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900">Projects</Link>
            <div className="ml-3 hidden h-5 w-px bg-slate-200 sm:block" />
            <span className="ml-3 hidden items-center gap-2 text-[10px] font-medium text-slate-500 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.1)]" />
              Control plane operational
            </span>
          </nav>
        </div>
      </header>

      <main className="visa-grid mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
        <section className="mb-8 overflow-hidden rounded-3xl bg-slate-950 px-7 py-8 text-white shadow-xl shadow-slate-900/10 lg:px-10 lg:py-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300">Deployment intelligence platform</p>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                Ship software. <span className="text-blue-300">Recover automatically.</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                VISA orchestrates analysis, approval, deployment, failure diagnosis, correction and verification in one controlled workflow.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {['FAST', 'APPROVED', 'AUTO-CORRECTIBLE', 'VERIFIED'].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-semibold tracking-wider text-slate-300">{item}</div>
              ))}
            </div>
          </div>
        </section>

        <StatsBar />

        <section className="grid gap-4 lg:grid-cols-[1.45fr_.75fr] mb-8">
          <div className="visa-card overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="visa-eyebrow">New deployment</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Deploy a repository</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Connect a Git repository or local project. VISA will build the deployment plan and pause for approval before consequential actions.</p>
                </div>
                <span className="hidden rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 sm:block">CONTROLLED EXECUTION</span>
              </div>
            </div>
            <div className="p-6">
              <DeployForm />
              <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-slate-400">
                <span className="rounded-md bg-slate-50 px-2 py-1">Git URL</span>
                <span className="rounded-md bg-slate-50 px-2 py-1">Local path</span>
                <span className="rounded-md bg-slate-50 px-2 py-1">Human approval gates</span>
                <span className="rounded-md bg-slate-50 px-2 py-1">Health verification</span>
              </div>
            </div>
          </div>

          <div className="visa-card p-6">
            <p className="visa-eyebrow">Operating model</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">Closed-loop delivery</h2>
            <div className="mt-5 space-y-4">
              {[
                ['01', 'Analyze', 'Understand source, runtime and deployment requirements.'],
                ['02', 'Approve', 'Keep a human in control of consequential actions.'],
                ['03', 'Recover', 'Diagnose safe failures and propose a bounded correction.'],
                ['04', 'Verify', 'Treat deployment as complete only after health passes.'],
              ].map(([n, title, copy]) => (
                <div key={n} className="flex gap-3">
                  <span className="visa-mono text-[10px] font-semibold text-blue-600">{n}</span>
                  <div><p className="text-xs font-semibold text-slate-800">{title}</p><p className="mt-0.5 text-[11px] leading-4 text-slate-500">{copy}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="visa-card mb-8 p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="visa-eyebrow">Workflow topology</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">From source code to verified production state</h2>
            </div>
            <Link href="/projects" className="hidden items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 sm:flex">View projects <ArrowIcon /></Link>
          </div>
          <PipelineSteps />
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div><p className="visa-eyebrow">Activity</p><h2 className="mt-1 text-lg font-semibold tracking-tight">Recent deployments</h2></div>
            <Link href="/projects" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Open project control plane</Link>
          </div>
          <EmptyState />
        </section>
      </main>
    </div>
  )
}
