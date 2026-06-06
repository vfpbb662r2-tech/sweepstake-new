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
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sweepstakes: {
        Row: {
          id: string
          title: string
          description: string | null
          organizer_id: string
          start_date: string
          end_date: string
          max_entries: number | null
          entry_fee: number | null
          status: 'draft' | 'active' | 'completed' | 'cancelled'
          rules: Json | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          organizer_id: string
          start_date: string
          end_date: string
          max_entries?: number | null
          entry_fee?: number | null
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          rules?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          organizer_id?: string
          start_date?: string
          end_date?: string
          max_entries?: number | null
          entry_fee?: number | null
          status?: 'draft' | 'active' | 'completed' | 'cancelled'
          rules?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sweepstakes_organizer_id_fkey"
            columns: ["organizer_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      prizes: {
        Row: {
          id: string
          sweepstake_id: string
          title: string
          description: string | null
          value: number | null
          quantity: number
          position: number
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sweepstake_id: string
          title: string
          description?: string | null
          value?: number | null
          quantity?: number
          position?: number
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sweepstake_id?: string
          title?: string
          description?: string | null
          value?: number | null
          quantity?: number
          position?: number
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prizes_sweepstake_id_fkey"
            columns: ["sweepstake_id"]
            referencedRelation: "sweepstakes"
            referencedColumns: ["id"]
          }
        ]
      }
      participants: {
        Row: {
          id: string
          sweepstake_id: string
          user_id: string
          entry_count: number
          total_spent: number
          joined_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          sweepstake_id: string
          user_id: string
          entry_count?: number
          total_spent?: number
          joined_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          sweepstake_id?: string
          user_id?: string
          entry_count?: number
          total_spent?: number
          joined_at?: string
          metadata?: Json | null
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
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      entries: {
        Row: {
          id: string
          participant_id: string
          entry_number: string
          created_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          participant_id: string
          entry_number: string
          created_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          participant_id?: string
          entry_number?: string
          created_at?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "entries_participant_id_fkey"
            columns: ["participant_id"]
            referencedRelation: "participants"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'sweepstake_started' | 'sweepstake_ending' | 'winner_announced' | 'entry_confirmed' | 'general'
          title: string
          message: string
          read: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'sweepstake_started' | 'sweepstake_ending' | 'winner_announced' | 'entry_confirmed' | 'general'
          title: string
          message: string
          read?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'sweepstake_started' | 'sweepstake_ending' | 'winner_announced' | 'entry_confirmed' | 'general'
          title?: string
          message?: string
          read?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      rate_limits: {
        Row: {
          id: string
          key: string
          count: number
          window_start: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          count?: number
          window_start: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          count?: number
          window_start?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      sweepstake_status: 'draft' | 'active' | 'completed' | 'cancelled'
      notification_type: 'sweepstake_started' | 'sweepstake_ending' | 'winner_announced' | 'entry_confirmed' | 'general'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}