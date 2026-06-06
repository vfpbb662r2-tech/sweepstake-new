import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Types
interface SweepstakeCreateRequest {
  name: string;
  description?: string;
  max_participants: number;
  entry_fee?: number;
  prize_structure?: {
    first?: number;
    second?: number;
    third?: number;
  };
  tournament_type: 'world_cup' | 'euros' | 'premier_league' | 'custom';
  tournament_year: number;
  start_date?: string;
  end_date?: string;
  is_private: boolean;
  invite_code?: string;
}

interface SweepstakeUpdateRequest {
  name?: string;
  description?: string;
  max_participants?: number;
  entry_fee?: number;
  prize_structure?: {
    first?: number;
    second?: number;
    third?: number;
  };
  start_date?: string;
  end_date?: string;
  is_private?: boolean;
}

interface SweepstakeResponse {
  id: string;
  name: string;
  description: string | null;
  max_participants: number;
  current_participants: number;
  entry_fee: number | null;
  prize_structure: any;
  tournament_type: string;
  tournament_year: number;
  start_date: string | null;
  end_date: string | null;
  is_private: boolean;
  invite_code: string | null;
  status: 'draft' | 'open' | 'full' | 'started' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  created_by: string;
  created_by_name: string | null;
}

// Validation functions
function validateSweepstakeCreate(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  } else if (data.name.trim().length > 100) {
    errors.push('Name must be 100 characters or less');
  }

  if (!data.max_participants || typeof data.max_participants !== 'number') {
    errors.push('Max participants is required and must be a number');
  } else if (data.max_participants < 2) {
    errors.push('Max participants must be at least 2');
  } else if (data.max_participants > 1000) {
    errors.push('Max participants cannot exceed 1000');
  }

  if (!data.tournament_type || typeof data.tournament_type !== 'string') {
    errors.push('Tournament type is required');
  } else if (!['world_cup', 'euros', 'premier_league', 'custom'].includes(data.tournament_type)) {
    errors.push('Invalid tournament type');
  }

  if (!data.tournament_year || typeof data.tournament_year !== 'number') {
    errors.push('Tournament year is required and must be a number');
  } else if (data.tournament_year < 2020 || data.tournament_year > 2030) {
    errors.push('Tournament year must be between 2020 and 2030');
  }

  if (typeof data.is_private !== 'boolean') {
    errors.push('is_private must be a boolean');
  }

  // Optional fields validation
  if (data.description && (typeof data.description !== 'string' || data.description.length > 500)) {
    errors.push('Description must be a string with 500 characters or less');
  }

  if (data.entry_fee !== undefined && (typeof data.entry_fee !== 'number' || data.entry_fee < 0)) {
    errors.push('Entry fee must be a non-negative number');
  }

  if (data.prize_structure) {
    if (typeof data.prize_structure !== 'object') {
      errors.push('Prize structure must be an object');
    } else {
      const { first, second, third } = data.prize_structure;
      if (first !== undefined && (typeof first !== 'number' || first < 0)) {
        errors.push('First place prize must be a non-negative number');
      }
      if (second !== undefined && (typeof second !== 'number' || second < 0)) {
        errors.push('Second place prize must be a non-negative number');
      }
      if (third !== undefined && (typeof third !== 'number' || third < 0)) {
        errors.push('Third place prize must be a non-negative number');
      }
    }
  }

  if (data.start_date && !isValidDateString(data.start_date)) {
    errors.push('Start date must be a valid ISO date string');
  }

  if (data.end_date && !isValidDateString(data.end_date)) {
    errors.push('End date must be a valid ISO date string');
  }

  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }
  }

  if (data.invite_code && (typeof data.invite_code !== 'string' || data.invite_code.length < 6 || data.invite_code.length > 20)) {
    errors.push('Invite code must be between 6 and 20 characters');
  }

  return { isValid: errors.length === 0, errors };
}

function validateSweepstakeUpdate(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    } else if (data.name.trim().length > 100) {
      errors.push('Name must be 100 characters or less');
    }
  }

  if (data.max_participants !== undefined) {
    if (typeof data.max_participants !== 'number') {
      errors.push('Max participants must be a number');
    } else if (data.max_participants < 2) {
      errors.push('Max participants must be at least 2');
    } else if (data.max_participants > 1000) {
      errors.push('Max participants cannot exceed 1000');
    }
  }

  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string' || data.description.length > 500) {
      errors.push('Description must be a string with 500 characters or less');
    }
  }

  if (data.entry_fee !== undefined && data.entry_fee !== null) {
    if (typeof data.entry_fee !== 'number' || data.entry_fee < 0) {
      errors.push('Entry fee must be a non-negative number');
    }
  }

  if (data.prize_structure !== undefined) {
    if (data.prize_structure !== null && typeof data.prize_structure !== 'object') {
      errors.push('Prize structure must be an object or null');
    } else if (data.prize_structure) {
      const { first, second, third } = data.prize_structure;
      if (first !== undefined && (typeof first !== 'number' || first < 0)) {
        errors.push('First place prize must be a non-negative number');
      }
      if (second !== undefined && (typeof second !== 'number' || second < 0)) {
        errors.push('Second place prize must be a non-negative number');
      }
      if (third !== undefined && (typeof third !== 'number' || third < 0)) {
        errors.push('Third place prize must be a non-negative number');
      }
    }
  }

  if (data.start_date !== undefined && data.start_date !== null && !isValidDateString(data.start_date)) {
    errors.push('Start date must be a valid ISO date string');
  }

  if (data.end_date !== undefined && data.end_date !== null && !isValidDateString(data.end_date)) {
    errors.push('End date must be a valid ISO date string');
  }

  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }
  }

  if (data.is_private !== undefined && typeof data.is_private !== 'boolean') {
    errors.push('is_private must be a boolean');
  }

  return { isValid: errors.length === 0, errors };
}

function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === date.toISOString();
}

function validateStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    'draft': ['open', 'cancelled'],
    'open': ['full', 'started', 'cancelled'],
    'full': ['started', 'cancelled'],
    'started': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': []
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function createSweepstake(supabase: any, userId: string, data: SweepstakeCreateRequest): Promise<SweepstakeResponse> {
  const validation = validateSweepstakeCreate(data);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Generate invite code if private and not provided
  let inviteCode = data.invite_code;
  if (data.is_private && !inviteCode) {
    inviteCode = generateInviteCode();
    
    // Ensure invite code is unique
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('sweepstakes')
        .select('id')
        .eq('invite_code', inviteCode)
        .single();
      
      if (!existing) break;
      
      inviteCode = generateInviteCode();
      attempts++;
    }
    
    if (attempts >= 10) {
      throw new Error('Failed to generate unique invite code');
    }
  }

  const sweepstakeData = {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    max_participants: data.max_participants,
    entry_fee: data.entry_fee || null,
    prize_structure: data.prize_structure || null,
    tournament_type: data.tournament_type,
    tournament_year: data.tournament_year,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    is_private: data.is_private,
    invite_code: inviteCode,
    status: 'draft',
    created_by: userId
  };

  const { data: sweepstake, error } = await supabase
    .from('sweepstakes')
    .insert([sweepstakeData])
    .select(`
      *,
      profiles:created_by (
        full_name
      )
    `)
    .single();

  if (error) {
    console.error('Database error creating sweepstake:', error);
    throw new Error('Failed to create sweepstake');
  }

  // Get participant count
  const { count } = await supabase
    .from('sweepstake_participants')
    .select('*', { count: 'exact', head: true })
    .eq('sweepstake_id', sweepstake.id);

  return {
    id: sweepstake.id,
    name: sweepstake.name,
    description: sweepstake.description,
    max_participants: sweepstake.max_participants,
    current_participants: count || 0,
    entry_fee: sweepstake.entry_fee,
    prize_structure: sweepstake.prize_structure,
    tournament_type: sweepstake.tournament_type,
    tournament_year: sweepstake.tournament_year,
    start_date: sweepstake.start_date,
    end_date: sweepstake.end_date,
    is_private: sweepstake.is_private,
    invite_code: sweepstake.invite_code,
    status: sweepstake.status,
    created_at: sweepstake.created_at,
    updated_at: sweepstake.updated_at,
    created_by: sweepstake.created_by,
    created_by_name: sweepstake.profiles?.full_name || null
  };
}

async function getSweepstakes(supabase: any, userId: string, page: number = 1, limit: number = 20): Promise<{ sweepstakes: SweepstakeResponse[]; total: number; hasMore: boolean }> {
  const offset = (page - 1) * limit;

  // Get sweepstakes where user is creator or participant
  const { data: sweepstakes, error, count } = await supabase
    .from('sweepstakes')
    .select(`
      *,
      profiles:created_by (
        full_name
      ),
      sweepstake_participants!inner (
        user_id
      )
    `, { count: 'exact' })
    .or(`created_by.eq.${userId},sweepstake_participants.user_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Database error fetching sweepstakes:', error);
    throw new Error('Failed to fetch sweepstakes');
  }

  // Get participant counts for each sweepstake
  const sweepstakeIds = sweepstakes.map(s => s.id);
  const participantCounts = new Map();

  if (sweepstakeIds.length > 0) {
    const { data: participantData } = await supabase
      .from('sweepstake_participants')
      .select('sweepstake_id')
      .in('sweepstake_id', sweepstakeIds);

    if (participantData) {
      participantData.forEach((p: any) => {
        const currentCount = participantCounts.get(p.sweepstake_id) || 0;
        participantCounts.set(p.sweepstake_id, currentCount + 1);
      });
    }
  }

  const formattedSweepstakes: SweepstakeResponse[] = sweepstakes.map(sweepstake => ({
    id: sweepstake.id,
    name: sweepstake.name,
    description: sweepstake.description,
    max_participants: sweepstake.max_participants,
    current_participants: participantCounts.get(sweepstake.id) || 0,
    entry_fee: sweepstake.entry_fee,
    prize_structure: sweepstake.prize_structure,
    tournament_type: sweepstake.tournament_type,
    tournament_year: sweepstake.tournament_year,
    start_date: sweepstake.start_date,
    end_date: sweepstake.end_date,
    is_private: sweepstake.is_private,
    invite_code: sweepstake.invite_code,
    status: sweepstake.status,
    created_at: sweepstake.created_at,
    updated_at: sweepstake.updated_at,
    created_by: sweepstake.created_by,
    created_by_name: sweepstake.profiles?.full_name || null
  }));

  return {
    sweepstakes: formattedSweepstakes,
    total: count || 0,
    hasMore: (count || 0) > offset + limit
  };
}

async function getSweepstake(supabase: any, id: string, userId: string): Promise<SweepstakeResponse> {
  const { data: sweepstake, error } = await supabase
    .from('sweepstakes')
    .select(`
      *,
      profiles:created_by (
        full_name
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Database error fetching sweepstake:', error);
    if (error.code === 'PGRST116') {
      throw new Error('Sweepstake not found');
    }
    throw new Error('Failed to fetch sweepstake');
  }

  // Check if user has access (creator, participant, or public sweepstake)
  if (sweepstake.is_private && sweepstake.created_by !== userId) {
    const { data: participant } = await supabase
      .from('sweepstake_participants')
      .select('id')
      .eq('sweepstake_id', id)
      .eq('user_id', userId)
      .single();

    if (!participant) {
      throw new Error('Access denied');
    }
  }

  // Get participant count
  const { count } = await supabase
    .from('sweepstake_participants')
    .select('*', { count: 'exact', head: true })
    .eq('sweepstake_id', id);

  return {
    id: sweepstake.id,
    name: sweepstake.name,
    description: sweepstake.description,
    max_participants: sweepstake.max_participants,
    current_participants: count || 0,
    entry_fee: sweepstake.entry_fee,
    prize_structure: sweepstake.prize_structure,
    tournament_type: sweepstake.tournament_type,
    tournament_year: sweepstake.tournament_year,
    start_date: sweepstake.start_date,
    end_date: sweepstake.end_date,
    is_private: sweepstake.is_private,
    invite_code: sweepstake.invite_code,
    status: sweepstake.status,
    created_at: sweepstake.created_at,
    updated_at: sweepstake.updated_at,
    created_by: sweepstake.created_by,
    created_by_name: sweepstake.profiles?.full_name || null
  };
}

async function updateSweepstake(supabase: any, id: string, userId: string, data: SweepstakeUpdateRequest): Promise<SweepstakeResponse> {
  const validation = validateSweepstakeUpdate(data);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Check if user is the creator
  const { data: existing, error: fetchError } = await supabase
    .from('sweepstakes')
    .select('created_by, status, max_participants')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Database error fetching sweepstake for update:', fetchError);
    if (fetchError.code === 'PGRST116') {
      throw new Error('Sweepstake not found');
    }
    throw new Error('Failed to fetch sweepstake');
  }

  if (existing.created_by !== userId) {
    throw new Error('Only the creator can update this sweepstake');
  }

  // Don't allow certain updates after sweepstake has started
  if (['started', 'completed'].includes(existing.status)) {
    const restrictedFields = ['max_participants', 'tournament_type', 'tournament_year', 'is_private'];
    const hasRestrictedUpdate = restrictedFields.some(field => data.hasOwnProperty(field));
    if (hasRestrictedUpdate) {
      throw new Error('Cannot modify core settings after sweepstake has started');
    }
  }

  // If reducing max_participants, check it's not below current participant count
  if (data.max_participants !== undefined && data.max_participants < existing.max_participants) {
    const { count } = await supabase
      .from('sweepstake_participants')
      .select('*', { count: 'exact', head: true })
      .eq('sweepstake_id', id);

    if (data.max_participants < (count || 0)) {
      throw new Error('Cannot reduce max participants below current participant count');
    }
  }

  const updateData = {
    ...data,
    updated_at: new Date().toISOString()
  };

  // Clean undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  const { data: sweepstake, error } = await supabase
    .from('sweepstakes')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      profiles:created_by (
        full_name
      )
    `)
    .single();

  if (error) {
    console.error('Database error updating sweepstake:', error);
    throw new Error('Failed to update sweepstake');
  }

  // Get participant count
  const { count } = await supabase
    .from('sweepstake_participants')
    .select('*', { count: 'exact', head: true })
    .eq('sweepstake_id', id);

  return {
    id: sweepstake.id,
    name: sweepstake.name,
    description: sweepstake.description,
    max_participants: sweepstake.max_participants,
    current_participants: count || 0,
    entry_fee: sweepstake.entry_fee,
    prize_structure: sweepstake.prize_structure,
    tournament_type: sweepstake.tournament_type,
    tournament_year: sweepstake.tournament_year,
    start_date: sweepstake.start_date,
    end_date: sweepstake.end_date,
    is_private: sweepstake.is_private,
    invite_code: sweepstake.invite_code,
    status: sweepstake.status,
    created_at: sweepstake.created_at,
    updated_at: sweepstake.updated_at,
    created_by: sweepstake.created_by,
    created_by_name: sweepstake.profiles?.full_name || null
  };
}

async function deleteSweepstake(supabase: any, id: string, userId: string): Promise<void> {
  // Check if user is the creator
  const { data: existing, error: fetchError } = await supabase
    .from('sweepstakes')
    .select('created_by, status')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Database error fetching sweepstake for deletion:', fetchError);
    if (fetchError.code === 'PGRST116') {
      throw new Error('Sweepstake not found');
    }
    throw new Error('Failed to fetch sweepstake');
  }

  if (existing.created_by !== userId) {
    throw new Error('Only the creator can delete this sweepstake');
  }

  // Don't allow deletion if sweepstake has started
  if (['started', 'completed'].includes(existing.status)) {
    throw new Error('Cannot delete sweepstake after it has started');
  }

  // Check if there are participants
  const { count } = await supabase
    .from('sweepstake_participants')
    .select('*', { count: 'exact', head: true })
    .eq('sweepstake_id', id);

  if ((count || 0) > 1) { // More than just the creator
    throw new Error('Cannot delete sweepstake with participants');
  }

  // Delete the sweepstake (cascade will handle participants and team assignments)
  const { error } = await supabase
    .from('sweepstakes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Database error deleting sweepstake:', error);
    throw new Error('Failed to delete sweepstake');
  }
}

async function updateSweepstakeStatus(supabase: any, id: string, userId: string, newStatus: string): Promise<SweepstakeResponse> {
  if (!['draft', 'open', 'full', 'started', 'completed', 'cancelled'].includes(newStatus)) {
    throw new Error('Invalid status');
  }

  // Check if user is the creator
  const { data: existing, error: fetchError } = await supabase
    .from('sweepstakes')
    .select('created_by, status')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Database error fetching sweepstake for status update:', fetchError);
    if (fetchError.code === 'PGRST116') {
      throw new Error('Sweepstake not found');
    }
    throw new Error('Failed to fetch sweepstake');
  }

  if (existing.created_by !== userId) {
    throw new Error('Only the creator can update sweepstake status');
  }

  if (!validateStatusTransition(existing.status, newStatus)) {
    throw new Error(`Invalid status transition from ${existing.status} to ${newStatus}`);
  }

  const { data: sweepstake, error } = await supabase
    .from('sweepstakes')
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select(`
      *,
      profiles:created_by (
        full_name
      )
    `)
    .single();

  if (error) {
    console.error('Database error updating sweepstake status:', error);
    throw new Error('Failed to update sweepstake status');
  }

  // Get participant count
  const { count } = await supabase
    .from('sweepstake_participants')
    .select('*', { count: 'exact', head: true })
    .eq('sweepstake_id', id);

  return {
    id: sweepstake.id,
    name: sweepstake.name,
    description: sweepstake.description,
    max_participants: sweepstake.max_participants,
    current_participants: count || 0,
    entry_fee: sweepstake.entry_fee,
    prize_structure: sweepstake.prize_structure,
    tournament_type: sweepstake.tournament_type,
    tournament_year: sweepstake.tournament_year,
    start_date: sweepstake.start_date,
    end_date: sweepstake.end_date,
    is_private: sweepstake.is_private,
    invite_code: sweepstake.invite_code,
    status: sweepstake.status,
    created_at: sweepstake.created_at,
    updated_at: sweepstake.updated_at,
    created_by: sweepstake.created_by,
    created_by_name: sweepstake.profiles?.full_name || null
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const sweepstakeId = pathParts[pathParts.length - 1]

    switch (req.method) {
      case 'POST': {
        if (pathParts.length === 2 && pathParts[1] === 'sweepstakes') {
          // Create sweepstake
          const body = await req.json()
          const result = await createSweepstake(supabase, user.id, body)
          return new Response(
            JSON.stringify({ data: result }),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else if (pathParts.length === 4 && pathParts[3] === 'status') {
          // Update status
          const body = await req.json()
          const result = await updateSweepstakeStatus(supabase, sweepstakeId, user.id, body.status)
          return new Response(
            JSON.stringify({ data: result }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }

      case 'GET': {
        if (pathParts.length === 2 && pathParts[1] === 'sweepstakes') {
          // List sweepstakes
          const page = parseInt(url.searchParams.get('page') || '1')
          const limit = parseInt(url.searchParams.get('limit') || '20')
          const result = await getSweepstakes(supabase, user.id, page, limit)
          return new Response(
            JSON.stringify({ data: result }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else if (pathParts.length === 3) {
          // Get single sweepstake
          const result = await getSweepstake(supabase, sweepstakeId, user.id)
          return new Response(
            JSON.stringify({ data: result }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }

      case 'PUT': {
        if (pathParts.length === 3) {
          // Update sweepstake
          const body = await req.json()
          const result = await updateSweepstake(supabase, sweepstakeId, user.id, body)
          return new Response(
            JSON.stringify({ data: result }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }

      case 'DELETE': {
        if (pathParts.length === 3) {
          // Delete sweepstake
          await deleteSweepstake(supabase, sweepstakeId, user.id)
          return new Response(
            JSON.stringify({ message: 'Sweepstake deleted successfully' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
      }
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})