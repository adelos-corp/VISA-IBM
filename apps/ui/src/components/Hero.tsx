'use client'

import Link from 'next/link'
import GlassSurface from '@/components/react-bits/GlassSurface'
import StrokeText from '@/components/react-bits/StrokeText'

export function Hero() {
  return (
    <section className="relative mb-10 -mx-4 border-b border-white/10 bg-[radial-gradient(circle_at_50%_0%,#182235_0%,#0b1220_42%,#030712_100%)] px-4 pb-0 pt-28 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative z-10 py-16 text-center sm:py-20">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b949e]">Fast · Approved · Auto-Correctible</p>
          <div className="mx-auto max-w-5xl">
            <StrokeText text="VISA" strokeColor="#58a6ff" fillColor="#f0f6fc" fontSize={180} fontWeight={800} letterSpacing={-10} drawDuration={1.3} fillDelay={0.15} trigger="mount" />
          </div>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8b949e] sm:text-base">A controlled deployment platform that analyzes, approves, deploys, recovers, and verifies applications.</p>
        </div>

        <div className="relative z-10 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-left shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b949e]">Deployment workflow</p>
                <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Deploy with confidence.</h2>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">Operational</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {['Analyze', 'Approve', 'Deploy', 'Verify'].map((step, index) => (
                <div key={step} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <span className="text-[10px] font-semibold text-[#8b949e]">0{index + 1}</span>
                  <p className="mt-2 text-sm font-medium text-white">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
