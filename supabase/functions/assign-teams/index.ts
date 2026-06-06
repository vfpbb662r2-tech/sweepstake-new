import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { assignTeamsAlgorithm } from './algorithm.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AssignTeamsRequest {
  sweepstakeId: string
}

interface DatabaseTypes {
  public: {
    Tables: {
      sweepstakes: {
        Row: {
          id: string
          title: string
          tournament_id: string
          status: 'draft' | 'open' | 'started' | 'completed'
          created_by: string
          created_at: string
          max_participants: number | null
        }
      }
      sweepstake_participants: {
        Row: {
          id: string
          sweepstake_id: string
          user_id: string
          joined_at: string
          display_name: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          tournament_id: string
          flag_url: string | null
          group_name: string | null
        }
      }
      team_assignments: {
        Row: {
          id: string
          sweepstake_id: string
          participant_id: string
          team_id: string
          assigned_at: string
        }
        Insert: {
          id?: string
          sweepstake_id: string
          participant_id: string
          team_id: string
          assigned_at?: string
        }
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient<DatabaseTypes>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request body
    const { sweepstakeId }: AssignTeamsRequest = await req.json()

    if (!sweepstakeId) {
      return new Response(
        JSON.stringify({ error: 'Sweepstake ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get sweepstake details
    const { data: sweepstake, error: sweepstakeError } = await supabaseClient
      .from('sweepstakes')
      .select('*')
      .eq('id', sweepstakeId)
      .single()

    if (sweepstakeError || !sweepstake) {
      return new Response(
        JSON.stringify({ error: 'Sweepstake not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if sweepstake is in the correct state
    if (sweepstake.status !== 'open') {
      return new Response(
        JSON.stringify({ error: 'Sweepstake must be open to assign teams' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if teams are already assigned
    const { data: existingAssignments } = await supabaseClient
      .from('team_assignments')
      .select('id')
      .eq('sweepstake_id', sweepstakeId)
      .limit(1)

    if (existingAssignments && existingAssignments.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Teams have already been assigned to this sweepstake' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get participants
    const { data: participants, error: participantsError } = await supabaseClient
      .from('sweepstake_participants')
      .select('*')
      .eq('sweepstake_id', sweepstakeId)

    if (participantsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch participants' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!participants || participants.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No participants found for this sweepstake' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get available teams for the tournament
    const { data: teams, error: teamsError } = await supabaseClient
      .from('teams')
      .select('*')
      .eq('tournament_id', sweepstake.tournament_id)

    if (teamsError || !teams || teams.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No teams found for this tournament' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Run the assignment algorithm
    const assignments = assignTeamsAlgorithm(participants, teams)

    // Save assignments to database
    const assignmentInserts = assignments.map(assignment => ({
      sweepstake_id: sweepstakeId,
      participant_id: assignment.participantId,
      team_id: assignment.teamId,
    }))

    const { data: savedAssignments, error: assignmentError } = await supabaseClient
      .from('team_assignments')
      .insert(assignmentInserts)
      .select()

    if (assignmentError) {
      console.error('Assignment error:', assignmentError)
      return new Response(
        JSON.stringify({ error: 'Failed to save team assignments' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update sweepstake status to 'started'
    const { error: updateError } = await supabaseClient
      .from('sweepstakes')
      .update({ status: 'started' })
      .eq('id', sweepstakeId)

    if (updateError) {
      console.error('Update sweepstake error:', updateError)
      // Don't fail the request if status update fails, assignments are more critical
    }

    // Return the assignments with participant and team details
    const assignmentsWithDetails = assignments.map(assignment => {
      const participant = participants.find(p => p.id === assignment.participantId)
      const team = teams.find(t => t.id === assignment.teamId)
      return {
        participantId: assignment.participantId,
        participantName: participant?.display_name || 'Unknown',
        teamId: assignment.teamId,
        teamName: team?.name || 'Unknown',
        teamFlag: team?.flag_url,
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        assignments: assignmentsWithDetails,
        totalParticipants: participants.length,
        totalTeams: teams.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})