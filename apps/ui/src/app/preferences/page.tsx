'use client'

import { useEffect, useState } from 'react'

type Preferences = {
  compact: boolean
  reducedMotion: boolean
  notifications: boolean
}

const defaults: Preferences = { compact: false, reducedMotion: false, notifications: true }

export default function PreferencesPage() {
  const [prefs, setPrefs] = useState<Preferences>(defaults)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('visa-preferences')
      if (stored) setPrefs({ ...defaults, ...JSON.parse(stored) })
    } catch {}
  }, [])

  function update(key: keyof Preferences) {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  function save() {
    localStorage.setItem('visa-preferences', JSON.stringify(prefs))
    document.documentElement.dataset.reducedMotion = prefs.reducedMotion ? 'true' : 'false'
    document.documentElement.dataset.compact = prefs.compact ? 'true' : 'false'
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return (
    <main className="visa-grid min-h-screen px-4 pb-16 pt-32 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="max-w-2xl">
          <p className="visa-eyebrow">Workspace</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-white">Preferences</h1>
          <p className="mt-4 text-sm leading-6 text-slate-400">Tune how the VISA dashboard behaves in this browser. These settings are local to this workspace.</p>
        </div>

        <section className="mt-10 visa-card overflow-hidden">
          {[
            ['compact', 'Compact interface', 'Reduce spacing in dashboard surfaces and lists.'],
            ['reducedMotion', 'Reduce motion', 'Disable non-essential transitions and animated effects.'],
            ['notifications', 'Deployment notifications', 'Keep deployment status feedback enabled in the interface.'],
          ].map(([key, title, copy]) => (
            <div key={key} className="flex items-center justify-between gap-6 border-b border-white/10 px-6 py-5 last:border-b-0 sm:px-8">
              <div>
                <h2 className="text-sm font-semibold text-white">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p>
              </div>
              <button
                type="button"
                aria-pressed={prefs[key as keyof Preferences]}
                onClick={() => update(key as keyof Preferences)}
                className={`relative h-6 w-11 shrink-0 rounded-full border transition ${prefs[key as keyof Preferences] ? 'border-white/30 bg-white/20' : 'border-white/10 bg-white/[0.04]'}`}
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${prefs[key as keyof Preferences] ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </section>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-slate-600">Changes are stored in local browser storage.</p>
          <button onClick={save} className="rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-slate-200">{saved ? 'Saved' : 'Save preferences'}</button>
        </div>
      </div>
    </main>
  )
}
