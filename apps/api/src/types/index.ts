// Shared TypeScript types for the VISA platform

export type DeploymentStatus =
  | 'PENDING'
  | 'ANALYZING'
  | 'CHECKING'
  | 'AWAITING_APPROVAL'
  | 'DEPLOYING'
  | 'VERIFYING'
  | 'LIVE'
  | 'FAILED'
  | 'CORRECTING'
  | 'TERMINAL'

export type FailureType = 'CORRECTABLE' | 'NEEDS_HUMAN' | 'UNRECOVERABLE'

export type ApprovalGate = 'DEPLOY' | 'CORRECT'

export type ApprovalDecision = 'APPROVED' | 'REJECTED'

export interface Project {
  id: string
  name: string
  gitUrl: string | null
  localPath: string | null
  createdAt: string
}

export interface Deployment {
  id: string
  projectId: string
  status: DeploymentStatus
  attemptNumber: number
  parentDeploymentId: string | null
  dockerImageId: string | null
  containerId: string | null
  createdAt: string
  completedAt: string | null
}

export interface ProjectAnalysis {
  id: string
  projectId: string
  framework: string
  runtime: string
  port: number
  healthPath: string
  buildCommand: string
  envVarsNeeded: string[]
  rawJson: string
  createdAt: string
}

export interface Diagnosis {
  id: string
  deploymentId: string
  failureType: FailureType
  rootCause: string
  proposedCorrectionJson: string
  confidence: number
  rationale: string
  createdAt: string
}

export interface Approval {
  id: string
  deploymentId: string
  gate: ApprovalGate
  decision: ApprovalDecision
  userNotes: string | null
  createdAt: string
}

export interface Verification {
  id: string
  deploymentId: string
  endpoint: string
  httpStatus: number | null
  responseTimeMs: number | null
  healthy: boolean
  attempts: number
  completedAt: string
}

// SSE event shape
export interface DeploymentEvent {
  type: 'stage' | 'log' | 'status' | 'error'
  deploymentId: string
  payload: Record<string, unknown>
  timestamp: string
}
