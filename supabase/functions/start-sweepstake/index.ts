import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { 
  SweepstakeLifecycleService, 
  type Sweepstake, 
  type Participant, 
  type Tournament 
} from '../../../packages/shared/src/services/sweepstake-lifecycle.ts';
import { 
  SweepstakeStatus, 
  type StartSweepstakeRequest, 
  type StartSweepstakeResponse 
} from '../../../packages/shared/src/types/sweepstake-status.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { sweepstakeId, userId, force = false }: StartSweepstakeRequest = await req.json();

    if (!sweepstakeId || !userId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: sweepstakeId and userId' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get sweepstake with tournament data
    const { data: sweepstakeData, error: sweepstakeError } = await supabase
      .from('sweepstakes')
      .select(`
        *,
        tournaments (
          id,
          name,
          status,
          start_date,
          end_date,
          tournament_teams (
            id,
            name,
            code,
            flag,
            eliminated
          )
        )
      `)
      .eq('id', sweepstakeId)
      .single();

    if (sweepstakeError || !sweepstakeData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Sweepstake not found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get participants
    const { data: participantsData, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .eq('sweepstake_id', sweepstakeId);

    if (participantsError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch participants' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Transform data to match service interfaces
    const sweepstake: Sweepstake = {
      id: sweepstakeData.id,
      name: sweepstakeData.name,
      description: sweepstakeData.description,
      status: sweepstakeData.status as SweepstakeStatus,
      tournamentId: sweepstakeData.tournament_id,
      createdBy: sweepstakeData.created_by,
      createdAt: new Date(sweepstakeData.created_at),
      startedAt: sweepstakeData.started_at ? new Date(sweepstakeData.started_at) : undefined,
      maxParticipants: sweepstakeData.max_participants,
      entryFee: sweepstakeData.entry_fee,
      prizePool: sweepstakeData.prize_pool
    };

    const participants: Participant[] = participantsData.map(p => ({
      id: p.id,
      userId: p.user_id,
      sweepstakeId: p.sweepstake_id,
      joinedAt: new Date(p.joined_at),
      assignedTeam: p.assigned_team
    }));

    const tournament: Tournament = {
      id: sweepstakeData.tournaments.id,
      name: sweepstakeData.tournaments.name,
      status: sweepstakeData.tournaments.status,
      startDate: new Date(sweepstakeData.tournaments.start_date),
      endDate: new Date(sweepstakeData.tournaments.end_date),
      teams: sweepstakeData.tournaments.tournament_teams.map((t: any) => ({
        id: t.id,
        name: t.name,
        code: t.code,
        flag: t.flag,
        eliminated: t.eliminated
      }))
    };

    // Validate user permissions
    const permissionCheck = SweepstakeLifecycleService.validateUserPermissions(sweepstake, userId);
    if (!permissionCheck.valid && !force) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: permissionCheck.reason 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate sweepstake can be started
    const validation = SweepstakeLifecycleService.validateSweepstakeStart(
      sweepstake, 
      participants, 
      tournament
    );

    if (!validation.valid && !force) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: validation.reason 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Assign teams to participants
    const teamAssignments = SweepstakeLifecycleService.assignTeamsToParticipants(
      participants, 
      tournament.teams
    );

    // Start database transaction
    const { error: transactionError } = await supabase.rpc('start_sweepstake_transaction', {
      p_sweepstake_id: sweepstakeId,
      p_team_assignments: JSON.stringify(teamAssignments),
      p_started_by: userId
    });

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to start sweepstake' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create initial leaderboard
    const initialLeaderboard = SweepstakeLifecycleService.calculateLeaderboard(
      participants.map(p => ({
        ...p,
        assignedTeam: teamAssignments[p.userId]
      })),
      tournament.teams
    );

    // Insert leaderboard entries
    const leaderboardEntries = initialLeaderboard.map(entry => ({
      sweepstake_id: sweepstakeId,
      user_id: entry.userId,
      team_id: entry.teamId,
      points: entry.points,
      position: entry.position,
      updated_at: new Date().toISOString()
    }));

    const { error: leaderboardError } = await supabase
      .from('leaderboard')
      .insert(leaderboardEntries);

    if (leaderboardError) {
      console.error('Leaderboard creation error:', leaderboardError);
      // Non-critical error - don't fail the entire operation
    }

    // Create status transition record
    const statusTransition = SweepstakeLifecycleService.createStatusTransition(
      SweepstakeStatus.CREATED,
      SweepstakeStatus.ACTIVE,
      userId,
      'Sweepstake started by creator'
    );

    const { error: transitionError } = await supabase
      .from('sweepstake_status_transitions')
      .insert({
        sweepstake_id: sweepstakeId,
        from_status: statusTransition.from,
        to_status: statusTransition.to,
        triggered_by: statusTransition.triggeredBy,
        reason: statusTransition.reason,
        created_at: statusTransition.timestamp.toISOString()
      });

    if (transitionError) {
      console.error('Status transition logging error:', transitionError);
      // Non-critical error
    }

    const response: StartSweepstakeResponse = {
      success: true,
      sweepstakeId,
      newStatus: SweepstakeStatus.ACTIVE,
      assignedTeams: teamAssignments,
      message: `Sweepstake started successfully with ${participants.length} participants`
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    
    const response: StartSweepstakeResponse = {
      success: false,
      sweepstakeId: '',
      newStatus: SweepstakeStatus.CREATED,
      error: 'Internal server error'
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Database function for atomic sweepstake start transaction
const createStartSweepstakeFunction = `
CREATE OR REPLACE FUNCTION start_sweepstake_transaction(
  p_sweepstake_id UUID,
  p_team_assignments JSONB,
  p_started_by UUID
) RETURNS VOID AS $$
DECLARE
  assignment_key TEXT;
  assignment_value TEXT;
BEGIN
  -- Update sweepstake status
  UPDATE sweepstakes 
  SET 
    status = 'active',
    started_at = NOW(),
    updated_at = NOW()
  WHERE id = p_sweepstake_id;

  -- Update participant team assignments
  FOR assignment_key, assignment_value IN SELECT * FROM jsonb_each_text(p_team_assignments)
  LOOP
    UPDATE participants 
    SET 
      assigned_team = assignment_value::UUID,
      updated_at = NOW()
    WHERE sweepstake_id = p_sweepstake_id 
    AND user_id = assignment_key::UUID;
  END LOOP;
  
EXCEPTION 
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to start sweepstake: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
`;