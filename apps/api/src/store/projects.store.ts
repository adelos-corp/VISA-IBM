import { getDb } from './db'
import { randomUUID } from 'crypto'
import type { Project } from '../types'

export function createProject(data: {
  name: string
  gitUrl?: string
  localPath?: string
}): Project {
  const db = getDb()
  const id = randomUUID()
  db.prepare(
    `INSERT INTO projects (id, name, git_url, local_path) VALUES (?, ?, ?, ?)`
  ).run(id, data.name, data.gitUrl ?? null, data.localPath ?? null)
  return getProjectById(id)!
}

export function getProjectById(id: string): Project | undefined {
  const db = getDb()
  const row = db
    .prepare(`SELECT id, name, git_url, local_path, created_at FROM projects WHERE id = ?`)
    .get(id) as Record<string, string> | undefined
  if (!row) return undefined
  return {
    id: row.id,
    name: row.name,
    gitUrl: row.git_url,
    localPath: row.local_path,
    createdAt: row.created_at,
  }
}

export function listProjects(): Project[] {
  const db = getDb()
  const rows = db
    .prepare(`SELECT id, name, git_url, local_path, created_at FROM projects ORDER BY created_at DESC`)
    .all() as Record<string, string>[]
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    gitUrl: row.git_url,
    localPath: row.local_path,
    createdAt: row.created_at,
  }))
}
