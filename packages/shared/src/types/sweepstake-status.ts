export enum SweepstakeStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface SweepstakeStatusTransition {
  from: SweepstakeStatus;
  to: SweepstakeStatus;
  timestamp: Date;
  triggeredBy: string;
  reason?: string;
}

export interface StartSweepstakeRequest {
  sweepstakeId: string;
  userId: string;
  force?: boolean;
}

export interface StartSweepstakeResponse {
  success: boolean;
  sweepstakeId: string;
  newStatus: SweepstakeStatus;
  assignedTeams?: Record<string, string>;
  message?: string;
  error?: string;
}

export const MINIMUM_PARTICIPANTS = 2;
export const MAXIMUM_PARTICIPANTS = 32;

export const VALID_STATUS_TRANSITIONS: Record<SweepstakeStatus, SweepstakeStatus[]> = {
  [SweepstakeStatus.CREATED]: [SweepstakeStatus.ACTIVE, SweepstakeStatus.CANCELLED],
  [SweepstakeStatus.ACTIVE]: [SweepstakeStatus.COMPLETED, SweepstakeStatus.CANCELLED],
  [SweepstakeStatus.COMPLETED]: [],
  [SweepstakeStatus.CANCELLED]: []
};