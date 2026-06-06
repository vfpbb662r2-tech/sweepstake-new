import { z } from 'zod';

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

export const UpdateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
    .optional(),
  avatar: z.string().url('Avatar must be a valid URL').optional(),
});

// Sweepstake schemas
export const CreateSweepstakeSchema = z.object({
  name: z.string()
    .min(3, 'Sweepstake name must be at least 3 characters')
    .max(100, 'Sweepstake name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  maxParticipants: z.number()
    .min(2, 'Must allow at least 2 participants')
    .max(32, 'Maximum 32 participants allowed')
    .default(32),
});

export const JoinSweepstakeSchema = z.object({
  code: z.string()
    .length(6, 'Code must be exactly 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must only contain uppercase letters and numbers'),
});

export const UpdateSweepstakeSchema = z.object({
  name: z.string()
    .min(3, 'Sweepstake name must be at least 3 characters')
    .max(100, 'Sweepstake name must be less than 100 characters')
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  maxParticipants: z.number()
    .min(2, 'Must allow at least 2 participants')
    .max(32, 'Maximum 32 participants allowed')
    .optional(),
});

// Team schemas
export const TeamSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Team name is required'),
  code: z.string().length(3, 'Team code must be exactly 3 characters'),
  flag: z.string().url('Flag must be a valid URL'),
  group: z.string().length(1, 'Group must be a single letter'),
  eliminated: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Match schemas
export const MatchStageEnum = z.enum([
  'GROUP_STAGE',
  'ROUND_OF_16',
  'QUARTER_FINAL',
  'SEMI_FINAL',
  'THIRD_PLACE',
  'FINAL'
]);

export const UpdateMatchScoreSchema = z.object({
  homeScore: z.number().int().min(0, 'Score cannot be negative'),
  awayScore: z.number().int().min(0, 'Score cannot be negative'),
  isCompleted: z.boolean().default(false),
});

export const MatchSchema = z.object({
  id: z.string().uuid(),
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),
  matchDate: z.date(),
  venue: z.string().min(1, 'Venue is required'),
  stage: MatchStageEnum,
  group: z.string().length(1).optional(),
  isCompleted: z.boolean().default(false),
  winnerId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// User schemas
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  avatar: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Participant schemas
export const ParticipantSchema = z.object({
  id: z.string().uuid(),
  sweepstakeId: z.string().uuid(),
  userId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  position: z.number().int().min(1).optional(),
  joinedAt: z.date(),
});

// Notification schemas
export const NotificationTypeEnum = z.enum([
  'SWEEPSTAKE_INVITE',
  'SWEEPSTAKE_JOINED',
  'DRAW_COMPLETED',
  'MATCH_RESULT',
  'TOURNAMENT_UPDATE',
  'SYSTEM'
]);

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: NotificationTypeEnum,
  read: z.boolean().default(false),
  sweepstakeId: z.string().uuid().optional(),
  createdAt: z.date(),
});

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const PaginationParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.unknown()).optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
  }).optional(),
});

// Sweepstake full schema with relations
export const SweepstakeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  creatorId: z.string().uuid(),
  code: z.string().length(6),
  maxParticipants: z.number().int().min(2).max(32),
  isActive: z.boolean().default(true),
  isComplete: z.boolean().default(false),
  drawCompleted: z.boolean().default(false),
  drawDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Form validation schemas for mobile
export const MobileLoginSchema = LoginSchema.extend({
  rememberMe: z.boolean().default(false).optional(),
});

export const MobileRegisterSchema = RegisterSchema.extend({
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Search and filter schemas
export const SearchSweepstakesSchema = z.object({
  query: z.string().optional(),
  isActive: z.boolean().optional(),
  isComplete: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});

export const SearchMatchesSchema = z.object({
  stage: MatchStageEnum.optional(),
  group: z.string().length(1).optional(),
  teamId: z.string().uuid().optional(),
  isCompleted: z.boolean().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
});

// WebSocket message schemas
export const WebSocketMessageSchema = z.object({
  type: z.string(),
  data: z.unknown(),
  timestamp: z.date(),
});

export const MatchUpdateMessageSchema = WebSocketMessageSchema.extend({
  type: z.literal('MATCH_UPDATE'),
  data: z.object({
    matchId: z.string().uuid(),
    homeScore: z.number().int().min(0),
    awayScore: z.number().int().min(0),
    isCompleted: z.boolean(),
    winnerId: z.string().uuid().optional(),
  }),
});

export const SweepstakeUpdateMessageSchema = WebSocketMessageSchema.extend({
  type: z.literal('SWEEPSTAKE_UPDATE'),
  data: z.object({
    sweepstakeId: z.string().uuid(),
    updateType: z.enum(['PARTICIPANT_JOINED', 'DRAW_COMPLETED', 'STANDINGS_UPDATED']),
    payload: z.unknown(),
  }),
});

// Validation error schema
export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
});

// Type inference helpers
export type LoginFormData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type CreateSweepstakeFormData = z.infer<typeof CreateSweepstakeSchema>;
export type JoinSweepstakeFormData = z.infer<typeof JoinSweepstakeSchema>;
export type UpdateMatchScoreFormData = z.infer<typeof UpdateMatchScoreSchema>;
export type SearchSweepstakesParams = z.infer<typeof SearchSweepstakesSchema>;
export type SearchMatchesParams = z.infer<typeof SearchMatchesSchema>;
export type MobileLoginFormData = z.infer<typeof MobileLoginSchema>;
export type MobileRegisterFormData = z.infer<typeof MobileRegisterSchema>;

// Validation helper functions
export function validateLoginForm(data: unknown): LoginFormData {
  return LoginSchema.parse(data);
}

export function validateRegisterForm(data: unknown): RegisterFormData {
  return RegisterSchema.parse(data);
}

export function validateCreateSweepstakeForm(data: unknown): CreateSweepstakeFormData {
  return CreateSweepstakeSchema.parse(data);
}

export function validateJoinSweepstakeForm(data: unknown): JoinSweepstakeFormData {
  return JoinSweepstakeSchema.parse(data);
}

export function validateUpdateMatchScore(data: unknown): UpdateMatchScoreFormData {
  return UpdateMatchScoreSchema.parse(data);
}

// Safe validation functions that return results instead of throwing
export function safeValidateLoginForm(data: unknown) {
  return LoginSchema.safeParse(data);
}

export function safeValidateRegisterForm(data: unknown) {
  return RegisterSchema.safeParse(data);
}

export function safeValidateCreateSweepstakeForm(data: unknown) {
  return CreateSweepstakeSchema.safeParse(data);
}

export function safeValidateJoinSweepstakeForm(data: unknown) {
  return JoinSweepstakeSchema.safeParse(data);
}

// Constants for validation
export const VALIDATION_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_SWEEPSTAKE_NAME_LENGTH: 3,
  MAX_SWEEPSTAKE_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  SWEEPSTAKE_CODE_LENGTH: 6,
  TEAM_CODE_LENGTH: 3,
  MIN_PARTICIPANTS: 2,
  MAX_PARTICIPANTS: 32,
} as const;