import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handleCors } from '../shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    const { type, table, record, old_record } = body

    console.log('Auth webhook received:', { type, table, record })

    switch (type) {
      case 'INSERT':
        if (table === 'auth.users') {
          await handleUserSignup(supabase, record)
        }
        break
      case 'UPDATE':
        if (table === 'auth.users') {
          await handleUserUpdate(supabase, record, old_record)
        }
        break
      case 'DELETE':
        if (table === 'auth.users') {
          await handleUserDelete(supabase, old_record)
        }
        break
    }

    return new Response(
      JSON.stringify({ message: 'Webhook processed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleUserSignup(supabase: any, user: any) {
  // Create profile for new user
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
      full_name: user.user_metadata?.full_name || '',
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error creating profile:', error)
    throw error
  }

  // Send welcome notification
  await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      title: 'Welcome to SweepEase!',
      message: 'Your account has been created successfully. Start exploring sweepstakes or create your own!',
      type: 'welcome',
      read: false,
      created_at: new Date().toISOString()
    })

  console.log('Profile created for user:', user.id)
}

async function handleUserUpdate(supabase: any, user: any, oldUser: any) {
  // Update profile when user metadata changes
  const updates: any = {
    updated_at: new Date().toISOString()
  }

  if (user.email !== oldUser.email) {
    updates.email = user.email
  }

  if (user.user_metadata?.username !== oldUser.user_metadata?.username) {
    updates.username = user.user_metadata?.username
  }

  if (user.user_metadata?.full_name !== oldUser.user_metadata?.full_name) {
    updates.full_name = user.user_metadata?.full_name
  }

  if (user.user_metadata?.avatar_url !== oldUser.user_metadata?.avatar_url) {
    updates.avatar_url = user.user_metadata?.avatar_url
  }

  if (Object.keys(updates).length > 1) { // More than just updated_at
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      throw error
    }

    console.log('Profile updated for user:', user.id)
  }
}

async function handleUserDelete(supabase: any, user: any) {
  // Clean up user data
  const userId = user.id

  // Delete audit logs
  await supabase
    .from('audit_logs')
    .delete()
    .eq('user_id', userId)

  // Delete notifications
  await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)

  // Delete entries
  await supabase
    .from('entries')
    .delete()
    .eq('user_id', userId)

  // Delete sweepstakes created by user (cascade will handle related data)
  await supabase
    .from('sweepstakes')
    .delete()
    .eq('creator_id', userId)

  // Delete profile (should be last)
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) {
    console.error('Error deleting profile:', error)
    throw error
  }

  console.log('User data cleaned up for:', userId)
}