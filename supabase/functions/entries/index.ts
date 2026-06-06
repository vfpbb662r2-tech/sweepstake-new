import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handleCors } from '../shared/cors.ts'
import { createSupabaseClient, requireAuth } from '../shared/auth.ts'
import { handleRateLimit, rateLimiters } from '../shared/rate-limit.ts'

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  // Rate limiting
  const rateLimitResponse = handleRateLimit(req, rateLimiters.general)
  if (rateLimitResponse) return rateLimitResponse

  try {
    const supabase = createSupabaseClient(req)

    switch (req.method) {
      case 'GET':
        return await requireAuth(supabase)(handleGet)
      case 'POST':
        return await requireAuth(supabase)(handlePost)
      case 'DELETE':
        return await requireAuth(supabase)(handleDelete)
      default:
        return new Response('Method not allowed', { status: 405 })
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleGet(user: any, supabase: any) {
  const url = new URL(req.url)
  const sweepstakeId = url.searchParams.get('sweepstake_id')

  let query = supabase
    .from('entries')
    .select(`
      *,
      sweepstakes:sweepstake_id(title, status),
      profiles:user_id(username, avatar_url)
    `)

  if (sweepstakeId) {
    // Get entries for specific sweepstake (creator only)
    const { data: sweepstake, error: sweepstakeError } = await supabase
      .from('sweepstakes')
      .select('creator_id')
      .eq('id', sweepstakeId)
      .single()

    if (sweepstakeError) throw sweepstakeError

    if (sweepstake.creator_id !== user.id) {
      return new Response('Unauthorized', { status: 403 })
    }

    query = query.eq('sweepstake_id', sweepstakeId)
  } else {
    // Get user's own entries
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error

  return new Response(
    JSON.stringify({ entries: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handlePost(user: any, supabase: any) {
  const body = await req.json()
  const { sweepstake_id, entry_data } = body

  if (!sweepstake_id) {
    return new Response(
      JSON.stringify({ error: 'sweepstake_id is required' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Check sweepstake eligibility
  const { data: eligibility, error: eligibilityError } = await supabase
    .rpc('check_sweepstake_entry_eligibility', {
      sweepstake_id_param: sweepstake_id,
      user_id_param: user.id
    })

  if (eligibilityError) throw eligibilityError

  if (!eligibility) {
    return new Response(
      JSON.stringify({ error: 'Not eligible to enter this sweepstake' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Create entry
  const { data, error } = await supabase
    .from('entries')
    .insert({
      sweepstake_id,
      user_id: user.id,
      entry_data: entry_data || {}
    })
    .select()
    .single()

  if (error) throw error

  // Log audit event
  await supabase
    .from('audit_logs')
    .insert({
      user_id: user.id,
      action: 'CREATE',
      table_name: 'entries',
      record_id: data.id,
      new_values: data
    })

  return new Response(
    JSON.stringify({ entry: data }),
    {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function handleDelete(user: any, supabase: any) {
  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const entryId = segments[segments.length - 1]

  // Verify entry exists and user owns it
  const { data: entry, error: entryError } = await supabase
    .from('entries')
    .select('*, sweepstakes:sweepstake_id(status, end_date)')
    .eq('id', entryId)
    .eq('user_id', user.id)
    .single()

  if (entryError || !entry) {
    return new Response('Entry not found', { status: 404 })
  }

  // Check if sweepstake allows entry deletion
  const sweepstake = entry.sweepstakes
  if (sweepstake.status !== 'active' || new Date(sweepstake.end_date) <= new Date()) {
    return new Response(
      JSON.stringify({ error: 'Cannot delete entry for inactive or ended sweepstake' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Delete entry
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', entryId)

  if (error) throw error

  // Log audit event
  await supabase
    .from('audit_logs')
    .insert({
      user_id: user.id,
      action: 'DELETE',
      table_name: 'entries',
      record_id: entryId,
      old_values: entry
    })

  return new Response(
    JSON.stringify({ message: 'Entry deleted successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}