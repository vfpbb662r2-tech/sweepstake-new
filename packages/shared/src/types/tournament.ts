export interface Tournament {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: TournamentStatus;
  type: TournamentType;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export type TournamentStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type TournamentType = 'world_cup' | 'euros' | 'copa_america' | 'custom';

export interface Team {
  id: string;
  name: string;
  country_code: string;
  flag_url?: string;
  tournament_id: string;
  group?: string;
  fifa_ranking?: number;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  home_team?: Team;
  away_team?: Team;
  home_score?: number;
  away_score?: number;
  match_date: string;
  venue?: string;
  stage: MatchStage;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
}

export type MatchStage = 
  | 'group'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final';

export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled';

export interface TournamentStats {
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  activeSweepstakes: number;
}