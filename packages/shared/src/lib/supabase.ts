import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'sweepstakes-app'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
})

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName
      }
    }
  })
  if (error) throw error
  return data
}

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window?.location?.origin || 'sweepstakes://auth'}/auth/reset-password`
  })
  if (error) throw error
}

// Database query helpers with RLS enforcement
export const getUserSweepstakes = async () => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('sweepstakes')
    .select(`
      *,
      sweepstake_participants!inner (
        id,
        joined_at,
        user_id
      )
    `)
    .eq('sweepstake_participants.user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getSweepstakeDetails = async (sweepstakeId: string) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('sweepstakes')
    .select(`
      *,
      sweepstake_participants (
        id,
        user_id,
        team_id,
        joined_at,
        users (
          id,
          email,
          display_name
        ),
        teams (
          id,
          name,
          flag_url,
          group_name
        )
      )
    `)
    .eq('id', sweepstakeId)
    .single()

  if (error) throw error
  
  // Additional RLS check - user must be participant or creator
  const isParticipant = data.sweepstake_participants.some(p => p.user_id === user.id)
  const isCreator = data.created_by === user.id
  
  if (!isParticipant && !isCreator) {
    throw new Error('Access denied to this sweepstake')
  }

  return data
}

export const createSweepstake = async (sweepstakeData: {
  name: string
  description?: string
  max_participants?: number
  entry_fee?: number
  prize_structure?: Record<string, any>
}) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('sweepstakes')
    .insert({
      ...sweepstakeData,
      created_by: user.id,
      status: 'active'
    })
    .select()
    .single()

  if (error) throw error

  // Automatically add creator as participant
  const { error: participantError } = await supabase
    .from('sweepstake_participants')
    .insert({
      sweepstake_id: data.id,
      user_id: user.id
    })

  if (participantError) throw participantError

  return data
}

export const joinSweepstake = async (sweepstakeId: string, inviteCode?: string) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  // Check if sweepstake exists and is joinable
  const { data: sweepstake, error: sweepstakeError } = await supabase
    .from('sweepstakes')
    .select('*')
    .eq('id', sweepstakeId)
    .eq('status', 'active')
    .single()

  if (sweepstakeError) throw sweepstakeError
  
  if (sweepstake.invite_code && sweepstake.invite_code !== inviteCode) {
    throw new Error('Invalid invite code')
  }

  // Check if already a participant
  const { data: existingParticipant } = await supabase
    .from('sweepstake_participants')
    .select('id')
    .eq('sweepstake_id', sweepstakeId)
    .eq('user_id', user.id)
    .single()

  if (existingParticipant) {
    throw new Error('Already a participant in this sweepstake')
  }

  // Check max participants
  if (sweepstake.max_participants) {
    const { count } = await supabase
      .from('sweepstake_participants')
      .select('*', { count: 'exact', head: true })
      .eq('sweepstake_id', sweepstakeId)

    if (count && count >= sweepstake.max_participants) {
      throw new Error('Sweepstake is full')
    }
  }

  const { data, error } = await supabase
    .from('sweepstake_participants')
    .insert({
      sweepstake_id: sweepstakeId,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const selectTeam = async (sweepstakeId: string, teamId: string) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  // Verify user is participant
  const { data: participant, error: participantError } = await supabase
    .from('sweepstake_participants')
    .select('id')
    .eq('sweepstake_id', sweepstakeId)
    .eq('user_id', user.id)
    .single()

  if (participantError) throw participantError

  // Check if team is already taken
  const { data: existingSelection } = await supabase
    .from('sweepstake_participants')
    .select('id')
    .eq('sweepstake_id', sweepstakeId)
    .eq('team_id', teamId)
    .single()

  if (existingSelection) {
    throw new Error('Team already selected by another participant')
  }

  const { data, error } = await supabase
    .from('sweepstake_participants')
    .update({ team_id: teamId })
    .eq('id', participant.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getAvailableTeams = async (sweepstakeId: string) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  // Verify user has access to this sweepstake
  const { data: participant } = await supabase
    .from('sweepstake_participants')
    .select('id')
    .eq('sweepstake_id', sweepstakeId)
    .eq('user_id', user.id)
    .single()

  if (!participant) {
    throw new Error('Access denied to this sweepstake')
  }

  // Get all teams not yet selected in this sweepstake
  const { data: takenTeams } = await supabase
    .from('sweepstake_participants')
    .select('team_id')
    .eq('sweepstake_id', sweepstakeId)
    .not('team_id', 'is', null)

  const takenTeamIds = takenTeams?.map(p => p.team_id) || []

  const { data: availableTeams, error } = await supabase
    .from('teams')
    .select('*')
    .not('id', 'in', `(${takenTeamIds.join(',') || 'null'})`)
    .order('group_name', { ascending: true })

  if (error) throw error
  return availableTeams
}

// Realtime subscriptions
export const subscribeToSweepstakeUpdates = (sweepstakeId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`sweepstake_${sweepstakeId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sweepstake_participants',
        filter: `sweepstake_id=eq.${sweepstakeId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sweepstakes',
        filter: `id=eq.${sweepstakeId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToMatchUpdates = (callback: (payload: any) => void) => {
  return supabase
    .channel('matches')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches'
      },
      callback
    )
    .subscribe()
}

// Admin functions (for sweepstake creators)
export const updateSweepstakeSettings = async (sweepstakeId: string, updates: {
  name?: string
  description?: string
  max_participants?: number
  entry_fee?: number
  prize_structure?: Record<string, any>
  status?: 'active' | 'completed' | 'cancelled'
}) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  // Verify user is the creator
  const { data: sweepstake, error: sweepstakeError } = await supabase
    .from('sweepstakes')
    .select('created_by')
    .eq('id', sweepstakeId)
    .single()

  if (sweepstakeError) throw sweepstakeError
  
  if (sweepstake.created_by !== user.id) {
    throw new Error('Only the creator can update sweepstake settings')
  }

  const { data, error } = await supabase
    .from('sweepstakes')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', sweepstakeId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const removeParticipant = async (sweepstakeId: string, participantUserId: string) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('User not authenticated')

  // Verify user is the creator
  const { data: sweepstake, error: sweepstakeError } = await supabase
    .from('sweepstakes')
    .select('created_by')
    .eq('id', sweepstakeId)
    .single()

  if (sweepstakeError) throw sweepstakeError
  
  if (sweepstake.created_by !== user.id) {
    throw new Error('Only the creator can remove participants')
  }

  const { error } = await supabase
    .from('sweepstake_participants')
    .delete()
    .eq('sweepstake_id', sweepstakeId)
    .eq('user_id', participantUserId)

  if (error) throw error
}

// Error handling helper
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  // Map common error codes to user-friendly messages
  switch (error.code) {
    case 'PGRST116':
      return 'Resource not found or access denied'
    case 'PGRST301':
      return 'Multiple resources found when expecting one'
    case '23505':
      return 'This action would create a duplicate entry'
    case '23503':
      return 'Referenced resource does not exist'
    case 'PGRST204':
      return 'No matching records found'
    default:
      return error.message || 'An unexpected error occurred'
  }
}

// Type-safe query builders
export const queryBuilder = {
  sweepstakes: () => supabase.from('sweepstakes'),
  participants: () => supabase.from('sweepstake_participants'),
  teams: () => supabase.from('teams'),
  matches: () => supabase.from('matches'),
  users: () => supabase.from('users')
}

// Batch operations
export const batchOperations = {
  createSweepstakeWithTeams: async (sweepstakeData: any, teamIds: string[]) => {
    const user = await getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data: sweepstake, error: sweepstakeError } = await supabase
      .from('sweepstakes')
      .insert({
        ...sweepstakeData,
        created_by: user.id,
        status: 'active'
      })
      .select()
      .single()

    if (sweepstakeError) throw sweepstakeError

    // Add creator as participant
    const { error: participantError } = await supabase
      .from('sweepstake_participants')
      .insert({
        sweepstake_id: sweepstake.id,
        user_id: user.id
      })

    if (participantError) throw participantError

    return sweepstake
  }
}

export default supabase