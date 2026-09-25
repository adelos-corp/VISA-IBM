'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { projects } from '@/lib/api'

export function DeployForm() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    try {
      const isGit =
        trimmed.startsWith('https://') ||
        trimmed.startsWith('git@') ||
        trimmed.endsWith('.git')

      const { project } = await projects.create(
        isGit ? { gitUrl: trimmed } : { localPath: trimmed }
      )
      const { deployment } = await projects.createDeployment(project.id)
      router.push(`/deployments/${deployment.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={loading}
          placeholder="https://github.com/org/repo  or  /path/to/local/project"
          className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Creating…' : 'Analyze'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  )
}
