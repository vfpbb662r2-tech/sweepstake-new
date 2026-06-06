/**
 * Team assignment result representing a single participant-team pairing
 */
export interface TeamAssignmentResult {
  participantId: string
  teamId: string
}

/**
 * Strategy for how teams should be assigned to participants
 */
export type AssignmentStrategy = 'fair' | 'round-robin' | 'snake-draft'

/**
 * Detailed assignment information including participant and team details
 */
export interface TeamAssignmentDetails {
  participantId: string
  participantName: string
  teamId: string
  teamName: string
  teamFlag?: string | null
}

/**
 * Assignment configuration options
 */
export interface AssignmentOptions {
  strategy: AssignmentStrategy
  allowMultipleTeamsPerParticipant: boolean
  randomSeed?: number
}

/**
 * Assignment execution result
 */
export interface AssignmentExecutionResult {
  success: boolean
  assignments: TeamAssignmentDetails[]
  totalParticipants: number
  totalTeams: number
  strategy: AssignmentStrategy
  executedAt: string
  errors?: string[]
}

/**
 * Assignment validation result
 */
export interface AssignmentValidation {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * Assignment statistics for analysis
 */
export interface AssignmentStatistics {
  totalAssignments: number
  participantsWithTeams: number
  teamsAssigned: number
  averageTeamsPerParticipant: number
  minTeamsPerParticipant: number
  maxTeamsPerParticipant: number
  participantDistribution: Record<string, number>
  strategyUsed: AssignmentStrategy
}

/**
 * Assignment audit log entry
 */
export interface AssignmentAuditEntry {
  id: string
  sweepstakeId: string
  executedBy: string
  executedAt: string
  strategy: AssignmentStrategy
  participantCount: number
  teamCount: number
  assignmentCount: number
  success: boolean
  errors?: string[]
  undoneAt?: string
  undoneBy?: string
}

/**
 * Request payload for team assignment edge function
 */
export interface AssignTeamsRequest {
  sweepstakeId: string
  strategy?: AssignmentStrategy
  options?: Partial<AssignmentOptions>
}

/**
 * Response from team assignment edge function
 */
export interface AssignTeamsResponse extends AssignmentExecutionResult {
  auditId?: string
}

/**
 * Database representation of a team assignment
 */
export interface TeamAssignmentRecord {
  id: string
  sweepstake_id: string
  participant_id: string
  team_id: string
  assigned_at: string
  assignment_round?: number
  assignment_order?: number
}

/**
 * Extended assignment result with additional metadata
 */
export interface ExtendedAssignmentResult extends TeamAssignmentResult {
  assignmentRound: number
  assignmentOrder: number
  timestamp: string
}

/**
 * Assignment preview for UI display before execution
 */
export interface AssignmentPreview {
  strategy: AssignmentStrategy
  participantCount: number
  teamCount: number
  estimatedAssignments: number
  distributionPreview: {
    minTeamsPerParticipant: number
    maxTeamsPerParticipant: number
    participantsWithExtraTeam: number
  }
  warnings: string[]
}

/**
 * Assignment rollback information
 */
export interface AssignmentRollback {
  sweepstakeId: string
  previousAssignments: TeamAssignmentRecord[]
  rollbackReason: string
  rollbackBy: string
  rollbackAt: string
}

/**
 * Assignment strategy configuration
 */
export interface StrategyConfig {
  name: AssignmentStrategy
  displayName: string
  description: string
  bestForParticipantRange: {
    min: number
    max?: number
  }
  fairnessScore: number // 1-10 scale
  complexityScore: number // 1-10 scale
  supportsMultipleTeams: boolean
}

/**
 * Predefined strategy configurations
 */
export const ASSIGNMENT_STRATEGIES: StrategyConfig[] = [
  {
    name: 'fair',
    displayName: 'Fair Distribution',
    description: 'Distributes teams as evenly as possible among all participants',
    bestForParticipantRange: { min: 1 },
    fairnessScore: 10,
    complexityScore: 3,
    supportsMultipleTeams: true,
  },
  {
    name: 'round-robin',
    displayName: 'Round Robin',
    description: 'Assigns teams one by one to participants in rotation',
    bestForParticipantRange: { min: 2, max: 20 },
    fairnessScore: 9,
    complexityScore: 2,
    supportsMultipleTeams: true,
  },
  {
    name: 'snake-draft',
    displayName: 'Snake Draft',
    description: 'Draft-style assignment that alternates direction each round',
    bestForParticipantRange: { min: 2, max: 12 },
    fairnessScore: 8,
    complexityScore: 5,
    supportsMultipleTeams: true,
  },
]

/**
 * Assignment error types
 */
export enum AssignmentErrorType {
  NO_PARTICIPANTS = 'NO_PARTICIPANTS',
  NO_TEAMS = 'NO_TEAMS',
  INVALID_STRATEGY = 'INVALID_STRATEGY',
  SWEEPSTAKE_NOT_FOUND = 'SWEEPSTAKE_NOT_FOUND',
  SWEEPSTAKE_WRONG_STATUS = 'SWEEPSTAKE_WRONG_STATUS',
  TEAMS_ALREADY_ASSIGNED = 'TEAMS_ALREADY_ASSIGNED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
}

/**
 * Assignment error with context
 */
export interface AssignmentError {
  type: AssignmentErrorType
  message: string
  details?: Record<string, any>
  suggestion?: string
}