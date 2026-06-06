import { z } from 'zod';

export const tournamentStatusSchema = z.enum(['upcoming', 'active', 'completed', 'cancelled']);

export const tournamentTypeSchema = z.enum(['world_cup', 'euros', 'copa_america', 'custom']);

export const matchStageSchema = z.enum([
  'group',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'third_place',
  'final',
]);

export const matchStatusSchema = z.enum(['scheduled', 'live', 'completed', 'postponed', 'cancelled']);

export const tournamentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Tournament name is required').max(100),
  description: z.string().max(500).optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  status: tournamentStatusSchema,
  type: tournamentTypeSchema,
  logo_url: z.string().url().optional(),
});

export const createTournamentSchema = tournamentSchema
  .omit({ id: true })
  .refine((data) => new Date(data.end_date) > new Date(data.start_date), {
    message: 'End date must be after start date',
    path: ['end_date'],
  });

export const teamSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Team name is required').max(50),
  country_code: z.string().length(2, 'Country code must be 2 characters'),
  flag_url: z.string().url().optional(),
  tournament_id: z.string().uuid(),
  group: z.string().max(10).optional(),
  fifa_ranking: z.number().min(1).max(300).optional(),
});

export const createTeamSchema = teamSchema.omit({ id: true });

export const matchSchema = z.object({
  id: z.string().uuid(),
  tournament_id: z.string().uuid(),
  home_team_id: z.string().uuid(),
  away_team_id: z.string().uuid(),
  home_score: z.number().min(0).optional(),
  away_score: z.number().min(0).optional(),
  match_date: z.string().datetime(),
  venue: z.string().max(100).optional(),
  stage: matchStageSchema,
  status: matchStatusSchema,
});

export const createMatchSchema = matchSchema
  .omit({ id: true })
  .refine((data) => data.home_team_id !== data.away_team_id, {
    message: 'Home team and away team cannot be the same',
    path: ['away_team_id'],
  });

export const updateMatchResultSchema = z.object({
  home_score: z.number().min(0),
  away_score: z.number().min(0),
  status: z.enum(['completed']),
});

// Type inference
export type TournamentInput = z.infer<typeof createTournamentSchema>;
export type TeamInput = z.infer<typeof createTeamSchema>;
export type MatchInput = z.infer<typeof createMatchSchema>;
export type UpdateMatchResultInput = z.infer<typeof updateMatchResultSchema>;