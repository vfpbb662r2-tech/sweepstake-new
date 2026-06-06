export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
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
      sweepstakes: {
        Row: {
          id: string
          title: string
          description: string | null
          creator_id: string
          tournament_id: string
          status: 'setup' | 'open' | 'closed' | 'active' | 'completed'
          max_participants: number | null
          entry_fee: number | null
          prize_pool: number | null
          draw_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          creator_id: string
          tournament_id: string
          status?: 'setup' | 'open' | 'closed' | 'active' | 'completed'
          max_participants?: number | null
          entry_fee?: number | null
          prize_pool?: number | null
          draw_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          creator_id?: string
          tournament_id?: string
          status?: 'setup' | 'open' | 'closed' | 'active' | 'completed'
          max_participants?: number | null
          entry_fee?: number | null
          prize_pool?: number | null
          draw_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sweepstakes_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sweepstakes_tournament_id_fkey"
            columns: ["tournament_id"]
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          }
        ]
      }
      tournaments: {
        Row: {
          id: string
          name: string
          year: number
          start_date: string
          end_date: string
          status: 'upcoming' | 'active' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          year: number
          start_date: string
          end_date: string
          status?: 'upcoming' | 'active' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          year?: number
          start_date?: string
          end_date?: string
          status?: 'upcoming' | 'active' | 'completed'
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
          tournament_id: string
          group_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          flag_url?: string | null
          tournament_id: string
          group_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          flag_url?: string | null
          tournament_id?: string
          group_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_tournament_id_fkey"
            columns: ["tournament_id"]
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          }
        ]
      }
      participants: {
        Row: {
          id: string
          sweepstake_id: string
          user_id: string
          team_id: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          sweepstake_id: string
          user_id: string
          team_id?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          sweepstake_id?: string
          user_id?: string
          team_id?: string | null
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participants_sweepstake_id_fkey"
            columns: ["sweepstake_id"]
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participants_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}