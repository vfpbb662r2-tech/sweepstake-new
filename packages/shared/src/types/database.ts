export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invite_token: string
          invited_by: string
          invited_email: string
          invited_user_id: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          sweepstake_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_by: string
          invited_email: string
          invited_user_id?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          sweepstake_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_by?: string
          invited_email?: string
          invited_user_id?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          sweepstake_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_sweepstake_id_fkey"
            columns: ["sweepstake_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboards: {
        Row: {
          draws: number
          goal_difference: number | null
          goals_against: number
          goals_for: number
          id: string
          last_calculated_at: string
          losses: number
          participant_id: string
          points: number
          position: number | null
          sweepstake_id: string
          team_id: string | null
          wins: number
        }
        Insert: {
          draws?: number
          goals_against?: number
          goals_for?: number
          id?: string
          last_calculated_at?: string
          losses?: number
          participant_id: string
          points?: number
          position?: number | null
          sweepstake_id: string
          team_id?: string | null
          wins?: number
        }
        Update: {
          draws?: number
          goals_against?: number
          goals_for?: number
          id?: string
          last_calculated_at?: string
          losses?: number
          participant_id?: string
          points?: number
          position?: number | null
          sweepstake_id?: string
          team_id?: string | null
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "leaderboards_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: true
            referencedRelation: "sweepstake_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboards_sweepstake_id_fkey"
            columns: ["sweepstake_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboards_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: string | null
          created_at: string
          group_name: string | null
          home_score: number | null
          home_team_id: string | null
          id: string
          is_active: boolean
          match_number: number | null
          penalties_away: number | null
          penalties_home: number | null
          scheduled_at: string
          stage: Database["public"]["Enums"]["match_stage"]
          status: Database["public"]["Enums"]["match_status"]
          tournament_id: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string
          group_name?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          is_active?: boolean
          match_number?: number | null
          penalties_away?: number | null
          penalties_home?: number | null
          scheduled_at: string
          stage: Database["public"]["Enums"]["match_stage"]
          status?: Database["public"]["Enums"]["match_status"]
          tournament_id: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: string | null
          created_at?: string
          group_name?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          is_active?: boolean
          match_number?: number | null
          penalties_away?: number | null
          penalties_home?: number | null
          scheduled_at?: string
          stage?: Database["public"]["Enums"]["match_stage"]
          status?: Database["public"]["Enums"]["match_status"]
          tournament_id?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
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
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sweepstake_participants: {
        Row: {
          id: string
          is_active: boolean
          joined_at: string
          sweepstake_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          joined_at?: string
          sweepstake_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_active?: boolean
          joined_at?: string
          sweepstake_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sweepstake_participants_sweepstake_id_fkey"
            columns: ["sweepstake_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sweepstake_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sweepstakes: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          currency: string
          description: string | null
          draw_date: string | null
          entry_fee: number
          id: string
          invite_code: string | null
          is_active: boolean
          is_private: boolean
          max_participants: number | null
          name: string
          prize_structure: Json | null
          rules_text: string | null
          status: Database["public"]["Enums"]["sweepstake_status"]
          tournament_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          currency?: string
          description?: string | null
          draw_date?: string | null
          entry_fee?: number
          id?: string
          invite_code?: string | null
          is_active?: boolean
          is_private?: boolean
          max_participants?: number | null
          name: string
          prize_structure?: Json | null
          rules_text?: string | null
          status?: Database["public"]["Enums"]["sweepstake_status"]
          tournament_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          description?: string | null
          draw_date?: string | null
          entry_fee?: number
          id?: string
          invite_code?: string | null
          is_active?: boolean
          is_private?: boolean
          max_participants?: number | null
          name?: string
          prize_structure?: Json | null
          rules_text?: string | null
          status?: Database["public"]["Enums"]["sweepstake_status"]
          tournament_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sweepstakes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sweepstakes_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      team_allocations: {
        Row: {
          allocated_at: string
          id: string
          is_active: boolean
          participant_id: string
          sweepstake_id: string
          team_id: string
        }
        Insert: {
          allocated_at?: string
          id?: string
          is_active?: boolean
          participant_id: string
          sweepstake_id: string
          team_id: string
        }
        Update: {
          allocated_at?: string
          id?: string
          is_active?: boolean
          participant_id?: string
          sweepstake_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_allocations_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "sweepstake_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_allocations_sweepstake_id_fkey"
            columns: ["sweepstake_id"]
            isOneToOne: false
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_allocations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          country_code: string | null
          created_at: string
          flag_url: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          short_name: string
          tournament_id: string | null
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          flag_url?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          short_name: string
          tournament_id?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          flag_url?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          short_name?: string
          tournament_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          start_date: string
          status: Database["public"]["Enums"]["tournament_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["tournament_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["tournament_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          is_active: boolean
          last_seen_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          is_active?: boolean
          last_seen_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          is_active?: boolean
          last_seen_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_leaderboard_positions: {
        Args: {
          sweepstake_uuid: string
        }
        Returns: undefined
      }
      create_demo_sweepstake: {
        Args: {
          tournament_uuid: string
          sweepstake_name?: string
          num_participants?: number
        }
        Returns: string
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      invitation_status: "pending" | "accepted" | "declined" | "expired"
      match_stage:
        | "group_stage"
        | "round_of_16"
        | "quarter_final"
        | "semi_final"
        | "third_place"
        | "final"
      match_status:
        | "scheduled"
        | "live"
        | "completed"
        | "postponed"
        | "cancelled"
      notification_type:
        | "sweepstake_invite"
        | "team_drawn"
        | "match_update"
        | "sweepstake_complete"
      sweepstake_status:
        | "draft"
        | "open"
        | "closed"
        | "active"
        | "completed"
        | "cancelled"
      tournament_status: "upcoming" | "active" | "completed" | "cancelled"
      user_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

// Convenience type aliases for common operations
export type User = Tables<"users">
export type UserInsert = TablesInsert<"users">
export type UserUpdate = TablesUpdate<"users">

export type Tournament = Tables<"tournaments">
export type TournamentInsert = TablesInsert<"tournaments">
export type TournamentUpdate = TablesUpdate<"tournaments">

export type Team = Tables<"teams">
export type TeamInsert = TablesInsert<"teams">
export type TeamUpdate = TablesUpdate<"teams">

export type Match = Tables<"matches">
export type MatchInsert = TablesInsert<"matches">
export type MatchUpdate = TablesUpdate<"matches">

export type Sweepstake = Tables<"sweepstakes">
export type SweepstakeInsert = TablesInsert<"sweepstakes">
export type SweepstakeUpdate = TablesUpdate<"sweepstakes">

export type SweepstakeParticipant = Tables<"sweepstake_participants">
export type SweepstakeParticipantInsert = TablesInsert<"sweepstake_participants">
export type SweepstakeParticipantUpdate = TablesUpdate<"sweepstake_participants">

export type TeamAllocation = Tables<"team_allocations">
export type TeamAllocationInsert = TablesInsert<"team_allocations">
export type TeamAllocationUpdate = TablesUpdate<"team_allocations">

export type Invitation = Tables<"invitations">
export type InvitationInsert = TablesInsert<"invitations">
export type InvitationUpdate = TablesUpdate<"invitations">

export type Notification = Tables<"notifications">
export type NotificationInsert = TablesInsert<"notifications">
export type NotificationUpdate = TablesUpdate<"notifications">

export type Leaderboard = Tables<"leaderboards">
export type LeaderboardInsert = TablesInsert<"leaderboards">
export type LeaderboardUpdate = TablesUpdate<"leaderboards">

// Enum type aliases
export type UserRole = Enums<"user_role">
export type TournamentStatus = Enums<"tournament_status">
export type SweepstakeStatus = Enums<"sweepstake_status">
export type MatchStatus = Enums<"match_status">
export type MatchStage = Enums<"match_stage">
export type InvitationStatus = Enums<"invitation_status">
export type NotificationType = Enums<"notification_type">

// Extended types with relationships
export type SweepstakeWithDetails = Sweepstake & {
  tournament: Tournament
  created_by_user: User
  participants: (SweepstakeParticipant & {
    user: User
    team_allocation?: TeamAllocation & {
      team: Team
    }
  })[]
  leaderboard?: (Leaderboard & {
    participant: SweepstakeParticipant & {
      user: User
    }
    team?: Team
  })[]
}

export type MatchWithTeams = Match & {
  home_team?: Team
  away_team?: Team
  tournament: Tournament
}

export type LeaderboardWithDetails = Leaderboard & {
  participant: SweepstakeParticipant & {
    user: User
  }
  team?: Team
  sweepstake: Sweepstake
}

export type InvitationWithDetails = Invitation & {
  sweepstake: Sweepstake & {
    tournament: Tournament
  }
  invited_by_user: User
  invited_user?: User
}

export type NotificationWithDetails = Notification & {
  user: User
}