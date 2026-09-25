import fs from 'fs'
import path from 'path'
import type { ProposedCorrection } from './diagnosis'

// ─── Apply a proposed correction to the project directory ────────────────────

export interface CorrectionResult {
  applied: boolean
  description: string
}

export async function applyCorrection(
  projectPath: string,
  correction: ProposedCorrection
): Promise<CorrectionResult> {
  if (correction.type === 'ADD_ENV_VAR' && correction.dockerfilePatch) {
    const dfPath = path.join(projectPath, 'Dockerfile')
    if (!fs.existsSync(dfPath)) {
      return { applied: false, description: 'Dockerfile not found — cannot apply correction.' }
    }
    const current = fs.readFileSync(dfPath, 'utf8')
    const { search, replace } = correction.dockerfilePatch

    if (current.includes(replace)) {
      return { applied: true, description: 'Correction already applied (idempotent).' }
    }

    if (!current.includes(search)) {
      return { applied: false, description: `Could not find target line in Dockerfile: "${search}"` }
    }

    const updated = current.replace(search, replace)
    fs.writeFileSync(dfPath, updated, 'utf8')

    return {
      applied: true,
      description: `Applied: added ENV ${correction.envVar}=${correction.envValue} to Dockerfile`,
    }
  }

  return {
    applied: false,
    description: `Correction type "${correction.type}" requires manual intervention.`,
  }
}
