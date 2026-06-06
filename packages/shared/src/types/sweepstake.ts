export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: TournamentStatus;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  code: string;
  flag_url?: string;
  group_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Sweepstake {
  id: string;
  name: string;
  description?: string;
  tournament_id: string;
  owner_id: string;
  max_participants: number;
  entry_fee: number;
  prize_distribution: PrizeDistribution;
  status: SweepstakeStatus;
  join_code: string;
  is_private: boolean;
  draw_date?: string;
  created_at: string;
  updated_at: string;
}

export interface SweepstakeParticipant {
  id: string;
  sweepstake_id: string;
  user_id: string;
  joined_at: string;
  payment_status: PaymentStatus;
}

export interface TeamAllocation {
  id: string;
  sweepstake_id: string;
  participant_id: string;
  team_id: string;
  allocated_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  match_type: MatchType;
  round: string;
  scheduled_at: string;
  status: MatchStatus;
  home_score?: number;
  away_score?: number;
  winner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SweepstakeInvite {
  id: string;
  sweepstake_id: string;
  invited_by_id: string;
  email: string;
  status: InviteStatus;
  expires_at: string;
  created_at: string;
}

// Enums
export type TournamentStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type SweepstakeStatus = 'draft' | 'open' | 'full' | 'drawn' | 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type MatchType = 'group' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'third_place' | 'final';
export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'cancelled' | 'postponed';
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// Prize Distribution
export interface PrizeDistribution {
  first: number; // Percentage
  second?: number;
  third?: number;
  participation?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form types
export interface CreateSweepstakeForm {
  name: string;
  description?: string;
  tournament_id: string;
  max_participants: number;
  entry_fee: number;
  prize_distribution: PrizeDistribution;
  is_private: boolean;
  draw_date?: string;
}

export interface JoinSweepstakeForm {
  join_code: string;
}

export interface InviteParticipantForm {
  email: string;
  sweepstake_id: string;
}

// Extended types with relations
export interface SweepstakeWithDetails extends Sweepstake {
  tournament: Tournament;
  owner: User;
  participants: (SweepstakeParticipant & { user: User })[];
  team_allocations: (TeamAllocation & { team: Team; participant: SweepstakeParticipant & { user: User } })[];
  _count?: {
    participants: number;
  };
}

export interface ParticipantWithAllocation extends SweepstakeParticipant {
  user: User;
  team_allocation?: TeamAllocation & { team: Team };
}

export interface MatchWithTeams extends Match {
  home_team: Team;
  away_team: Team;
  tournament: Tournament;
}

export interface TournamentWithTeams extends Tournament {
  teams: Team[];
  _count?: {
    teams: number;
    sweepstakes: number;
  };
}

// Dashboard types
export interface DashboardStats {
  total_sweepstakes: number;
  active_sweepstakes: number;
  total_participants: number;
  total_winnings: number;
}

export interface UserSweepstakeStats {
  participated: number;
  owned: number;
  won: number;
  total_winnings: number;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

export type NotificationType = 
  | 'sweepstake_invite'
  | 'sweepstake_draw'
  | 'match_result'
  | 'sweepstake_complete'
  | 'payment_reminder'
  | 'general';