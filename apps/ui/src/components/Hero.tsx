'use client'

import Link from 'next/link'
import GlassSurface from '@/components/react-bits/GlassSurface'
import StrokeText from '@/components/react-bits/StrokeText'
import ScrollExpand from '@/components/react-bits/ScrollExpand'

const visual = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">' +
  '<rect width="1600" height="900" fill="#0d1117"/>' +
  '<path d="M0 150H1600M0 300H1600M0 450H1600M0 600H1600M0 750H1600M200 0V900M400 0V900M600 0V900M800 0V900M1000 0V900M1200 0V900M1400 0V900" stroke="#30363d" stroke-width="1"/>' +
  '<path d="M220 450H480M560 450H820M900 450H1160M1240 450H1380" stroke="#58a6ff" stroke-width="3"/>' +
  '<circle cx="200" cy="450" r="20" fill="#0969da"/><circle cx="520" cy="450" r="20" fill="#0969da"/><circle cx="860" cy="450" r="20" fill="#0969da"/><circle cx="1200" cy="450" r="20" fill="#0969da"/><circle cx="1400" cy="450" r="20" fill="#3fb950"/>' +
  '<text x="800" y="170" text-anchor="middle" fill="#f0f6fc" font-family="Arial,sans-serif" font-size="42" font-weight="700">CODE → APPROVE → DEPLOY → VERIFY</text>' +
  '<text x="800" y="730" text-anchor="middle" fill="#8b949e" font-family="monospace" font-size="22">VISA deployment control plane</text>' +
  '</svg>'
)

export function Hero() {
  return (
    <section className="relative mb-10 -mx-4 overflow-hidden border-b border-white/10 bg-[#071a3d] px-4 pb-0 pt-28 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="fixed inset-x-0 top-4 z-[100] px-4 sm:px-6 lg:px-8 pointer-events-none"><div className="mx-auto max-w-6xl pointer-events-auto"><GlassSurface width="100%" height={58} borderRadius={10} backgroundOpacity={0.22} saturation={1.2} distortionScale={-60} className="border border-white/15 shadow-2xl shadow-blue-950/30">
          <nav className="flex h-full w-full items-center justify-between px-3 sm:px-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-slate-900">V</span>
              VISA
            </Link>
            <div className="flex items-center gap-1 text-xs">
              <Link href="/" className="rounded-md bg-white/10 px-3 py-1.5 font-medium text-white">Overview</Link>
              <Link href="/projects" className="rounded-md px-3 py-1.5 text-slate-300 hover:bg-white/10 hover:text-white">Projects</Link>
              <span className="ml-2 hidden items-center gap-1.5 border-l border-white/10 pl-3 text-slate-400 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>Operational</span>
            </div>
          </nav>
        </GlassSurface></div></div>

        <div className="relative z-10 py-16 text-center sm:py-20">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8b949e]">Fast · Approved · Auto-Correctible</p>
          <div className="mx-auto max-w-5xl">
            <StrokeText text="VISA" strokeColor="#58a6ff" fillColor="#f0f6fc" fontSize={180} fontWeight={800} letterSpacing={-10} drawDuration={1.3} fillDelay={0.15} trigger="mount" />
          </div>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#8b949e] sm:text-base">A controlled deployment platform that analyzes, approves, deploys, recovers, and verifies applications.</p>
        </div>

        <div className="relative z-10 h-[68vh] min-h-[520px] max-h-[760px] overflow-hidden rounded-t-xl border border-white/10 border-b-0">
          <ScrollExpand src={visual} alt="VISA deployment workflow" useWindowScroll startWidth={58} startHeight={58} startRadius={12} endRadius={0} mediaZoom={1.15} scrollDistance={0.9} holdDistance={0.2} smoothing={0.08} title="Deploy with confidence." scrollHint="Scroll to expand" />
        </div>
      </div>
    </section>
  )
}
