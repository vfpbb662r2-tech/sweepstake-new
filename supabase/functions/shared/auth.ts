import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

export function createSupabaseClient(req: Request) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  )
}

export async function validateUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

export function requireAuth(supabase: any) {
  return async (handler: (user: any, supabase: any) => Promise<Response>) => {
    try {
      const user = await validateUser(supabase)
      return await handler(user, supabase)
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}