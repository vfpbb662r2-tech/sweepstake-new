export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          name: string
          code: string
          flag_url: string | null
          group_letter: string | null
          fifa_ranking: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          flag_url?: string | null
          group_letter?: string | null
          fifa_ranking?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          flag_url?: string | null
          group_letter?: string | null
          fifa_ranking?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          id: string
          name: string
          description: string | null
          start_date: string
          end_date: string
          status: 'upcoming' | 'active' | 'completed'
          max_participants: number | null
          entry_fee: number | null
          prize_pool: number | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          start_date: string
          end_date: string
          status?: 'upcoming' | 'active' | 'completed'
          max_participants?: number | null
          entry_fee?: number | null
          prize_pool?: number | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          start_date?: string
          end_date?: string
          status?: 'upcoming' | 'active' | 'completed'
          max_participants?: number | null
          entry_fee?: number | null
          prize_pool?: number | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sweepstakes: {
        Row: {
          id: string
          tournament_id: string
          name: string
          description: string | null
          type: 'random_draw' | 'draft' | 'auction'
          status: 'draft' | 'open' | 'full' | 'active' | 'completed'
          max_participants: number
          entry_fee: number | null
          prize_structure: Record<string, any> | null
          draw_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          name: string
          description?: string | null
          type: 'random_draw' | 'draft' | 'auction'
          status?: 'draft' | 'open' | 'full' | 'active' | 'completed'
          max_participants: number
          entry_fee?: number | null
          prize_structure?: Record<string, any> | null
          draw_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          name?: string
          description?: string | null
          type?: 'random_draw' | 'draft' | 'auction'
          status?: 'draft' | 'open' | 'full' | 'active' | 'completed'
          max_participants?: number
          entry_fee?: number | null
          prize_structure?: Record<string, any> | null
          draw_date?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sweepstakes_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sweepstakes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      participants: {
        Row: {
          id: string
          sweepstake_id: string
          user_id: string
          status: 'invited' | 'joined' | 'withdrawn'
          joined_at: string | null
          invited_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sweepstake_id: string
          user_id: string
          status?: 'invited' | 'joined' | 'withdrawn'
          joined_at?: string | null
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sweepstake_id?: string
          user_id?: string
          status?: 'invited' | 'joined' | 'withdrawn'
          joined_at?: string | null
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_sweepstake_id_fkey"
            columns: ["sweepstake_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      team_assignments: {
        Row: {
          id: string
          sweepstake_id: string
          participant_id: string
          team_id: string
          assigned_at: string
          assignment_method: 'random' | 'draft' | 'auction'
          draft_order: number | null
          auction_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sweepstake_id: string
          participant_id: string
          team_id: string
          assigned_at?: string
          assignment_method: 'random' | 'draft' | 'auction'
          draft_order?: number | null
          auction_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sweepstake_id?: string
          participant_id?: string
          team_id?: string
          assigned_at?: string
          assignment_method?: 'random' | 'draft' | 'auction'
          draft_order?: number | null
          auction_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_assignments_sweepstake_id_fkey"
            columns: ["sweepstake_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_assignments_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          home_team_id: string
          away_team_id: string
          match_type: 'group' | 'round_16' | 'quarter_final' | 'semi_final' | 'third_place' | 'final'
          group_letter: string | null
          match_date: string
          venue: string | null
          status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled'
          home_score: number | null
          away_score: number | null
          home_penalties: number | null
          away_penalties: number | null
          winner_id: string | null
          match_minute: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          home_team_id: string
          away_team_id: string
          match_type: 'group' | 'round_16' | 'quarter_final' | 'semi_final' | 'third_place' | 'final'
          group_letter?: string | null
          match_date: string
          venue?: string | null
          status?: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled'
          home_score?: number | null
          away_score?: number | null
          home_penalties?: number | null
          away_penalties?: number | null
          winner_id?: string | null
          match_minute?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          home_team_id?: string
          away_team_id?: string
          match_type?: 'group' | 'round_16' | 'quarter_final' | 'semi_final' | 'third_place' | 'final'
          group_letter?: string | null
          match_date?: string
          venue?: string | null
          status?: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled'
          home_score?: number | null
          away_score?: number | null
          home_penalties?: number | null
          away_penalties?: number | null
          winner_id?: string | null
          match_minute?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      leaderboards: {
        Row: {
          id: string
          sweepstake_id: string
          participant_id: string
          team_id: string
          total_points: number
          matches_played: number
          wins: number
          draws: number
          losses: number
          goals_for: number
          goals_against: number
          goal_difference: number
          bonus_points: number
          prize_position: number | null
          prize_amount: number | null
          last_updated: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sweepstake_id: string
          participant_id: string
          team_id: string
          total_points?: number
          matches_played?: number
          wins?: number
          draws?: number
          losses?: number
          goals_for?: number
          goals_against?: number
          goal_difference?: number
          bonus_points?: number
          prize_position?: number | null
          prize_amount?: number | null
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sweepstake_id?: string
          participant_id?: string
          team_id?: string
          total_points?: number
          matches_played?: number
          wins?: number
          draws?: number
          losses?: number
          goals_for?: number
          goals_against?: number
          goal_difference?: number
          bonus_points?: number
          prize_position?: number | null
          prize_amount?: number | null
          last_updated?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboards_sweepstake_id_fkey"
            columns: ["sweepstake_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboards_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboards_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'sweepstake_invite' | 'draw_complete' | 'match_update' | 'prize_won' | 'general'
          title: string
          message: string
          data: Record<string, any> | null
          read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'sweepstake_invite' | 'draw_complete' | 'match_update' | 'prize_won' | 'general'
          title: string
          message: string
          data?: Record<string, any> | null
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'sweepstake_invite' | 'draw_complete' | 'match_update' | 'prize_won' | 'general'
          title?: string
          message?: string
          data?: Record<string, any> | null
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      invitations: {
        Row: {
          id: string
          sweepstake_id: string
          email: string
          invited_by: string
          status: 'pending' | 'accepted' | 'declined' | 'expired'
          token: string
          expires_at: string
          accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sweepstake_id: string
          email: string
          invited_by: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          token: string
          expires_at: string
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sweepstake_id?: string
          email?: string
          invited_by?: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          token?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_sweepstake_id_fkey"
            columns: ["sweepstake_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      tournament_status: 'upcoming' | 'active' | 'completed'
      sweepstake_type: 'random_draw' | 'draft' | 'auction'
      sweepstake_status: 'draft' | 'open' | 'full' | 'active' | 'completed'
      participant_status: 'invited' | 'joined' | 'withdrawn'
      match_type: 'group' | 'round_16' | 'quarter_final' | 'semi_final' | 'third_place' | 'final'
      match_status: 'scheduled' | 'live' | 'completed' | 'postponed' | 'cancelled'
      assignment_method: 'random' | 'draft' | 'auction'
      notification_type: 'sweepstake_invite' | 'draw_complete' | 'match_update' | 'prize_won' | 'general'
      invitation_status: 'pending' | 'accepted' | 'declined' | 'expired'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Utility types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Common entity types
export type User = Tables<'users'>
export type Team = Tables<'teams'>
export type Tournament = Tables<'tournaments'>
export type Sweepstake = Tables<'sweepstakes'>
export type Participant = Tables<'participants'>
export type TeamAssignment = Tables<'team_assignments'>
export type Match = Tables<'matches'>
export type Leaderboard = Tables<'leaderboards'>
export type Notification = Tables<'notifications'>
export type Invitation = Tables<'invitations'>

// Insert types
export type UserInsert = TablesInsert<'users'>
export type TeamInsert = TablesInsert<'teams'>
export type TournamentInsert = TablesInsert<'tournaments'>
export type SweepstakeInsert = TablesInsert<'sweepstakes'>
export type ParticipantInsert = TablesInsert<'participants'>
export type TeamAssignmentInsert = TablesInsert<'team_assignments'>
export type MatchInsert = TablesInsert<'matches'>
export type LeaderboardInsert = TablesInsert<'leaderboards'>
export type NotificationInsert = TablesInsert<'notifications'>
export type InvitationInsert = TablesInsert<'invitations'>

// Update types
export type UserUpdate = TablesUpdate<'users'>
export type TeamUpdate = TablesUpdate<'teams'>
export type TournamentUpdate = TablesUpdate<'tournaments'>
export type SweepstakeUpdate = TablesUpdate<'sweepstakes'>
export type ParticipantUpdate = TablesUpdate<'participants'>
export type TeamAssignmentUpdate = TablesUpdate<'team_assignments'>
export type MatchUpdate = TablesUpdate<'matches'>
export type LeaderboardUpdate = TablesUpdate<'leaderboards'>
export type NotificationUpdate = TablesUpdate<'notifications'>
export type InvitationUpdate = TablesUpdate<'invitations'>

// Enum types
export type TournamentStatus = Enums<'tournament_status'>
export type SweepstakeType = Enums<'sweepstake_type'>
export type SweepstakeStatus = Enums<'sweepstake_status'>
export type ParticipantStatus = Enums<'participant_status'>
export type MatchType = Enums<'match_type'>
export type MatchStatus = Enums<'match_status'>
export type AssignmentMethod = Enums<'assignment_method'>
export type NotificationType = Enums<'notification_type'>
export type InvitationStatus = Enums<'invitation_status'>

// Extended types with relations
export interface SweepstakeWithDetails extends Sweepstake {
  tournament: Tournament
  creator: User
  participants: (Participant & {
    user: User
    team_assignment?: TeamAssignment & {
      team: Team
    }
  })[]
  leaderboard: (Leaderboard & {
    participant: Participant & {
      user: User
    }
    team: Team
  })[]
}

export interface MatchWithTeams extends Match {
  home_team: Team
  away_team: Team
  winner?: Team
  tournament: Tournament
}

export interface LeaderboardWithDetails extends Leaderboard {
  participant: Participant & {
    user: User
  }
  team: Team
  sweepstake: Sweepstake
}

export interface ParticipantWithDetails extends Participant {
  user: User
  sweepstake: Sweepstake
  team_assignment?: TeamAssignment & {
    team: Team
  }
  leaderboard?: Leaderboard
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form types for creating/updating entities
export interface CreateSweepstakeForm {
  name: string
  description?: string
  tournament_id: string
  type: SweepstakeType
  max_participants: number
  entry_fee?: number
  prize_structure?: Record<string, any>
  draw_date?: string
}

export interface UpdateSweepstakeForm {
  name?: string
  description?: string
  max_participants?: number
  entry_fee?: number
  prize_structure?: Record<string, any>
  draw_date?: string
  status?: SweepstakeStatus
}

export interface CreateTournamentForm {
  name: string
  description?: string
  start_date: string
  end_date: string
  max_participants?: number
  entry_fee?: number
  prize_pool?: number
}

export interface InviteParticipantForm {
  sweepstake_id: string
  email: string
}

// Scoring and points calculation types
export interface ScoringRules {
  win: number
  draw: number
  loss: number
  goal: number
  clean_sheet: number
  progression_bonus: {
    round_16: number
    quarter_final: number
    semi_final: number
    final: number
    winner: number
  }
}

export interface PointsCalculation {
  base_points: number
  goal_points: number
  clean_sheet_points: number
  progression_points: number
  bonus_points: number
  total_points: number
}

// Real-time subscription types
export interface MatchUpdate {
  match_id: string
  status: MatchStatus
  home_score?: number
  away_score?: number
  match_minute?: number
  winner_id?: string
}

export interface LeaderboardUpdate {
  sweepstake_id: string
  participant_id: string
  previous_position: number
  new_position: number
  points_change: number
}