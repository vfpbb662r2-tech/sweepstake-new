import { z } from 'zod';

export const SweepstakeStatus = z.enum(['draft', 'open', 'closed', 'started', 'completed']);

export const SweepstakeSettings = z.object({
  maxParticipants: z.number().int().min(2).max(64).default(32),
  allowLateJoining: z.boolean().default(false),
  autoAssignTeams: z.boolean().default(true),
  requirePayment: z.boolean().default(false),
  entryFee: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  isPublic: z.boolean().default(false),
  requireApproval: z.boolean().default(false),
});

export const CreateSweepstakeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  tournament: z.string().min(1, 'Tournament is required'),
  settings: SweepstakeSettings,
});

export const UpdateSweepstakeSchema = CreateSweepstakeSchema.partial().extend({
  id: z.string().uuid(),
});

export const SweepstakeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  tournament: z.string(),
  status: SweepstakeStatus,
  settings: SweepstakeSettings,
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  startedAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  inviteCode: z.string().nullable(),
  participantCount: z.number().int().min(0).default(0),
});

export const SweepstakeParticipantSchema = z.object({
  id: z.string().uuid(),
  sweepstakeId: z.string().uuid(),
  userId: z.string().uuid(),
  userName: z.string(),
  userEmail: z.string().email(),
  joinedAt: z.date(),
  isApproved: z.boolean().default(true),
  assignedTeam: z.string().nullable(),
});

export const SweepstakeWithParticipantsSchema = SweepstakeSchema.extend({
  participants: z.array(SweepstakeParticipantSchema),
});

export const JoinSweepstakeSchema = z.object({
  sweepstakeId: z.string().uuid().optional(),
  inviteCode: z.string().min(1, 'Invite code is required').optional(),
}).refine(
  (data) => data.sweepstakeId || data.inviteCode,
  {
    message: "Either sweepstakeId or inviteCode is required",
    path: ["sweepstakeId"],
  }
);

export const SweepstakeListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  tournament: z.string(),
  status: SweepstakeStatus,
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  participantCount: z.number().int().min(0),
  maxParticipants: z.number().int().min(2),
  isPublic: z.boolean(),
  requireApproval: z.boolean(),
});

export const StartSweepstakeSchema = z.object({
  id: z.string().uuid(),
});

export const AssignTeamsSchema = z.object({
  sweepstakeId: z.string().uuid(),
  assignments: z.record(z.string().uuid(), z.string()).optional(), // userId -> teamId
});

// Type exports
export type SweepstakeStatus = z.infer<typeof SweepstakeStatus>;
export type SweepstakeSettings = z.infer<typeof SweepstakeSettings>;
export type CreateSweepstakeInput = z.infer<typeof CreateSweepstakeSchema>;
export type UpdateSweepstakeInput = z.infer<typeof UpdateSweepstakeSchema>;
export type Sweepstake = z.infer<typeof SweepstakeSchema>;
export type SweepstakeParticipant = z.infer<typeof SweepstakeParticipantSchema>;
export type SweepstakeWithParticipants = z.infer<typeof SweepstakeWithParticipantsSchema>;
export type JoinSweepstakeInput = z.infer<typeof JoinSweepstakeSchema>;
export type SweepstakeListItem = z.infer<typeof SweepstakeListItemSchema>;
export type StartSweepstakeInput = z.infer<typeof StartSweepstakeSchema>;
export type AssignTeamsInput = z.infer<typeof AssignTeamsSchema>;

// Validation functions
export function validateSweepstakeStatusTransition(
  currentStatus: SweepstakeStatus,
  newStatus: SweepstakeStatus
): boolean {
  const validTransitions: Record<SweepstakeStatus, SweepstakeStatus[]> = {
    draft: ['open', 'closed'],
    open: ['closed', 'started'],
    closed: ['open', 'started'],
    started: ['completed'],
    completed: [],
  };

  return validTransitions[currentStatus].includes(newStatus);
}

export function canJoinSweepstake(sweepstake: Sweepstake): boolean {
  if (sweepstake.status !== 'open') return false;
  if (sweepstake.participantCount >= sweepstake.settings.maxParticipants) return false;
  return true;
}

export function canStartSweepstake(sweepstake: SweepstakeWithParticipants): boolean {
  if (!['open', 'closed'].includes(sweepstake.status)) return false;
  if (sweepstake.participants.length < 2) return false;
  
  // If manual team assignment is required, check all participants have teams
  if (!sweepstake.settings.autoAssignTeams) {
    return sweepstake.participants.every(p => p.assignedTeam !== null);
  }
  
  return true;
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}