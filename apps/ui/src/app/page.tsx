import { PipelineSteps } from '@/components/PipelineSteps'
import { EmptyState } from '@/components/EmptyState'
import { StatsBar } from '@/components/StatsBar'
import { Hero } from '@/components/Hero'
import Link from 'next/link'

const features = [
  ['Human approval', 'Every consequential deployment action stays behind an explicit approval gate.'],
  ['Failure recovery', 'Diagnose recoverable failures, review a proposed correction, and retry safely.'],
  ['Verification', 'A deployment is only complete after the running application passes its health check.'],
]

export default function Home() {
  return (
    <div className="min-h-screen bg-[#02040a] text-white">
      <Hero />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <StatsBar />

        <section className="mb-8 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-8">
            <p className="visa-eyebrow">Deployment control plane</p>
            <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">From source code to a verified application.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">VISA brings analysis, approval, deployment, recovery, and verification into one focused workflow instead of making developers stitch the pieces together by hand.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/deploy" className="rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-slate-200">Start a deployment</Link>
              <Link href="/about" className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.08]">How VISA works</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
            <p className="visa-eyebrow">Built around four principles</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {['FAST', 'APPROVED', 'AUTO-CORRECTIBLE', 'VERIFIED'].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="border-b border-white/10 px-5 py-5 sm:px-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="visa-eyebrow">Runtime intelligence</p>
                <h2 className="mt-1 text-base font-semibold text-white">Deployment orchestration layer</h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  VISA turns repository state, deployment policy, runtime signals, and verification results into a controlled execution graph.
                </p>
              </div>
              <Link href="/deploy" className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-slate-300 hover:bg-white/[0.08]">
                Open deployment center →
              </Link>
            </div>
          </div>

          <div className="grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              ['Artifact inspection', 'SOURCE → PLAN', 'Repository structure, runtime requirements, dependencies, and deployment metadata are normalized before execution.'],
              ['Policy evaluation', 'PLAN → APPROVAL', 'Safety checks and the proposed execution plan are evaluated before a consequential action can proceed.'],
              ['Runtime recovery', 'FAILURE → VERIFY', 'Failure telemetry is classified, recoverable corrections are proposed, and the resulting deployment is verified.'],
            ].map(([title, flow, copy]) => (
              <div key={title} className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
                  <span className="visa-mono text-[9px] tracking-wide text-slate-600">{flow}</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">{copy}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 bg-black/20 px-5 py-4 sm:px-6">
            <div className="grid gap-3 font-mono text-[10px] sm:grid-cols-4">
              {[
                ['SOURCE', 'repository snapshot'],
                ['POLICY', 'human approval gate'],
                ['RUNTIME', 'health + log telemetry'],
                ['RECOVERY', 'bounded correction loop'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-slate-600">{label}</p>
                  <p className="mt-1 text-slate-400">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-3 md:grid-cols-3">
          {features.map(([title, copy]) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
              <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <p className="visa-eyebrow">Pipeline</p>
            <h2 className="mt-1 text-base font-semibold text-white">Controlled execution</h2>
            <p className="mt-1 text-xs text-slate-500">Source to verified live state, with recovery built into the loop.</p>
          </div>
          <div className="overflow-x-auto p-5 sm:p-6"><PipelineSteps /></div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="visa-eyebrow">Activity</p>
              <h2 className="mt-1 text-base font-semibold text-white">Recent deployments</h2>
              <p className="mt-1 text-xs text-slate-500">Latest activity across managed projects.</p>
            </div>
            <Link href="/projects" className="shrink-0 text-xs font-medium text-slate-400 hover:text-white">View projects →</Link>
          </div>
          <EmptyState />
        </section>
      </main>
    </div>
  )
}
