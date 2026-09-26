'use client'

import { useEffect } from 'react'

export function WorkspacePreferencesInit() {
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('visa-preferences') || '{}')
      const savedTheme = localStorage.getItem('visa-theme')
      const theme = savedTheme || (stored.theme === 'light' ? 'light' : stored.theme === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : 'dark')
      document.documentElement.dataset.theme = theme
      document.documentElement.dataset.reducedMotion = stored.reducedMotion ? 'true' : 'false'
      document.documentElement.dataset.compact = stored.compact ? 'true' : 'false'
      document.documentElement.dataset.glassEffects = stored.glassEffects === false ? 'false' : 'true'
      document.documentElement.dataset.accent = stored.accent === 'neutral' ? 'neutral' : 'blue'
    } catch {}
  }, [])

  return null
}
