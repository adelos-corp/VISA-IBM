'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import GlassSurface from '@/components/react-bits/GlassSurface'
import StrokeText from '@/components/react-bits/StrokeText'
import ScrollExpand from '@/components/react-bits/ScrollExpand'

const MOCKUPS = [
  'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#080d18"/><rect x="90" y="70" width="1420" height="760" rx="24" fill="#101827" stroke="#334155"/><rect x="90" y="70" width="1420" height="72" rx="24" fill="#172033"/><circle cx="130" cy="106" r="8" fill="#64748b"/><circle cx="158" cy="106" r="8" fill="#475569"/><circle cx="186" cy="106" r="8" fill="#334155"/><text x="130" y="210" fill="#f8fafc" font-size="52" font-family="Arial" font-weight="700">NORTHSTAR</text><text x="130" y="258" fill="#94a3b8" font-size="22" font-family="Arial">Operations dashboard</text><rect x="130" y="315" width="420" height="180" rx="16" fill="#172033"/><rect x="580" y="315" width="420" height="180" rx="16" fill="#172033"/><rect x="1030" y="315" width="400" height="180" rx="16" fill="#172033"/><path d="M165 445 L235 405 L305 420 L375 350 L445 380 L515 335" fill="none" stroke="#cbd5e1" stroke-width="5"/><text x="165" y="355" fill="#94a3b8" font-size="18" font-family="Arial">Throughput</text><text x="615" y="355" fill="#94a3b8" font-size="18" font-family="Arial">Deployments</text><text x="1065" y="355" fill="#94a3b8" font-size="18" font-family="Arial">Availability</text><rect x="130" y="535" width="1300" height="220" rx="16" fill="#0c1422"/><text x="165" y="585" fill="#cbd5e1" font-size="20" font-family="Arial">Recent activity</text><path d="M165 630H1395M165 675H1395M165 720H1395" stroke="#243047"/></svg>'),
  'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#070b14"/><rect x="110" y="65" width="1380" height="770" rx="22" fill="#111827" stroke="#374151"/><rect x="110" y="65" width="1380" height="78" rx="22" fill="#1b2435"/><text x="155" y="118" fill="#f9fafb" font-size="30" font-family="Arial" font-weight="700">atelier</text><text x="1210" y="118" fill="#94a3b8" font-size="17" font-family="Arial">Work · Journal · About</text><rect x="155" y="190" width="1290" height="260" rx="18" fill="#1a2435"/><text x="205" y="285" fill="#f8fafc" font-size="58" font-family="Georgia" font-weight="700">Ideas, made tangible.</text><text x="205" y="335" fill="#94a3b8" font-size="22" font-family="Arial">A quiet digital studio for products, systems and experiments.</text><rect x="205" y="375" width="170" height="44" rx="22" fill="#e5e7eb"/><text x="245" y="404" fill="#111827" font-size="16" font-family="Arial">Explore work</text><rect x="155" y="490" width="405" height="250" rx="16" fill="#202b3d"/><rect x="595" y="490" width="405" height="250" rx="16" fill="#182233"/><rect x="1035" y="490" width="410" height="250" rx="16" fill="#202b3d"/></svg>'),
  'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#090c13"/><rect x="100" y="70" width="1400" height="760" rx="20" fill="#111827" stroke="#3f4654"/><rect x="100" y="70" width="1400" height="70" rx="20" fill="#1f2937"/><text x="145" y="115" fill="#f9fafb" font-size="28" font-family="Arial" font-weight="700">pulse / analytics</text><rect x="145" y="190" width="1310" height="130" rx="14" fill="#182132"/><text x="180" y="235" fill="#9ca3af" font-size="17" font-family="Arial">Monthly active users</text><text x="180" y="290" fill="#f9fafb" font-size="48" font-family="Arial" font-weight="700">248,420</text><path d="M650 285 C730 190 800 300 870 215 S1010 270 1080 180 S1220 245 1370 165" fill="none" stroke="#d1d5db" stroke-width="5"/><rect x="145" y="350" width="635" height="370" rx="14" fill="#151e2d"/><rect x="820" y="350" width="635" height="370" rx="14" fill="#151e2d"/><text x="180" y="400" fill="#e5e7eb" font-size="22" font-family="Arial">Audience</text><text x="855" y="400" fill="#e5e7eb" font-size="22" font-family="Arial">Conversion</text></svg>'),
]

export function Hero() {
  const visual = useMemo(() => MOCKUPS[Math.floor(Math.random() * MOCKUPS.length)], [])

  return (
    <section className="relative mb-10 -mx-4 border-b border-white/10 bg-[radial-gradient(circle_at_50%_0%,#182235_0%,#0b1220_42%,#030712_100%)] px-4 pb-0 pt-28 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="fixed inset-x-0 top-4 z-[100] px-4 sm:px-6 lg:px-8 pointer-events-none"><div className="mx-auto max-w-6xl pointer-events-auto"><GlassSurface width="100%" height={58} borderRadius={999} backgroundOpacity={0.22} saturation={1.2} distortionScale={-60} className="border border-white/15 shadow-2xl shadow-black/30">
          <nav className="flex h-full w-full items-center justify-between px-3 sm:px-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-slate-900">V</span>
              VISA
            </Link>
            <div className="flex items-center gap-1 text-xs">
              <Link href="/" className="rounded-full bg-white/12 px-3.5 py-1.5 font-medium text-white shadow-inner shadow-white/5">Overview</Link>
              <Link href="/projects" className="rounded-full px-3.5 py-1.5 text-slate-300 hover:bg-white/10 hover:text-white">Projects</Link>
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

        <div className="relative z-10 h-[235vh] overflow-visible rounded-t-xl border border-white/10 border-b-0">
          <ScrollExpand src={visual} alt="VISA deployment workflow" useWindowScroll stageHeight="viewport" startWidth={58} startHeight={58} startRadius={28} endRadius={0} mediaZoom={1.08} scrollDistance={1} holdDistance={0.35} smoothing={0} title="Deploy with confidence." scrollHint="Scroll to expand" />
        </div>
      </div>
    </section>
  )
}
