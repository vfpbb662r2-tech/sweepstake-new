import { z } from 'zod';

// User types
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Tournament types
export const TournamentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tournament = z.infer<typeof TournamentSchema>;

// Team types
export const TeamSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  country: z.string().min(1),
  flag: z.string().url().optional(),
  tournamentId: z.string().uuid(),
});

export type Team = z.infer<typeof TeamSchema>;

// Sweepstake types
export const SweepstakeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  tournamentId: z.string().uuid(),
  creatorId: z.string().uuid(),
  maxParticipants: z.number().int().positive().optional(),
  entryFee: z.number().nonnegative().optional(),
  isPrivate: z.boolean().default(false),
  joinCode: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Sweepstake = z.infer<typeof SweepstakeSchema>;

// Common API response types
export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiSuccessSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  message: z.string().optional(),
});

export type ApiSuccess<T = unknown> = Omit<z.infer<typeof ApiSuccessSchema>, 'data'> & {
  data?: T;
};