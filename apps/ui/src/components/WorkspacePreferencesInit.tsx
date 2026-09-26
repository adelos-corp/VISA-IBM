'use client'

import { useEffect } from 'react'

export function WorkspacePreferencesInit() {
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('visa-preferences') || '{}')
      const theme = localStorage.getItem('visa-theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
      document.documentElement.dataset.theme = theme
      document.documentElement.dataset.reducedMotion = stored.reducedMotion ? 'true' : 'false'
      document.documentElement.dataset.compact = stored.compact ? 'true' : 'false'
    } catch {}
  }, [])

  return null
}
