'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GlassSurface from '@/components/react-bits/GlassSurface'

export function Navbar() {
  const pathname = usePathname()
  const projectsActive = pathname.startsWith('/projects') || pathname.startsWith('/deployments')

  return (
    <div className="fixed inset-x-0 top-4 z-[100] px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="mx-auto max-w-6xl pointer-events-auto">
        <GlassSurface width="100%" height={58} borderRadius={999} backgroundOpacity={0.22} saturation={1.2} distortionScale={-60} className="border border-white/15 shadow-2xl shadow-black/30">
          <nav className="flex h-full w-full items-center justify-between px-3 sm:px-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-slate-900">V</span>VISA</Link>
            <div className="flex items-center gap-1 text-xs">
              <Link href="/" className={`rounded-full px-3.5 py-1.5 font-medium transition ${!projectsActive ? "bg-white/[0.12] text-white shadow-inner shadow-white/5" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>Overview</Link>
              <Link href="/projects" className={`rounded-full px-3.5 py-1.5 font-medium transition ${projectsActive ? "bg-white/[0.12] text-white shadow-inner shadow-white/5" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>Projects</Link>
              <span className="ml-2 hidden items-center gap-1.5 border-l border-white/10 pl-3 text-slate-500 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-slate-400" />Operational</span>
            </div>
          </nav>
        </GlassSurface>
      </div>
    </div>
  )
}
