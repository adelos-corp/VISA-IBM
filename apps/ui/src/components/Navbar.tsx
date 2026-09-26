'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GlassSurface from '@/components/react-bits/GlassSurface'
import { ThemeToggle } from '@/components/ThemeToggle'

const links = [
  { href: '/', label: 'Overview' },
  { href: '/projects', label: 'Projects' },
  { href: '/deploy', label: 'Deploy' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-x-0 top-4 z-[100] px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div className="mx-auto max-w-6xl pointer-events-auto">
        <GlassSurface
          width="100%"
          height={58}
          borderRadius={999}
          backgroundOpacity={0.22}
          saturation={0.8}
          distortionScale={-60}
          className="border border-[#2d4a72]/35 bg-[#071426]/20 shadow-2xl shadow-black/30"
        >
          <nav className="flex h-full w-full items-center justify-between px-3 sm:px-4">
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-white/[0.08] text-xs font-bold text-white">V</span>
              VISA
            </Link>

            <div className="flex items-center gap-1 text-xs">
              {links.map((link) => {
                const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                      active ? 'bg-white/[0.10] text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}

              <span className="ml-1 hidden h-5 w-px bg-white/10 sm:block" />

              <Link href="/about" className="hidden rounded-full px-3 py-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200 md:block">About</Link>
              <Link href="/preferences" aria-label="Preferences" className="hidden rounded-full px-3 py-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200 sm:block">Preferences</Link>
              <ThemeToggle />

              <span className="ml-1 hidden items-center gap-1.5 border-l border-white/10 pl-3 text-slate-500 lg:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                Operational
              </span>
            </div>
          </nav>
        </GlassSurface>
      </div>
    </div>
  )
}
