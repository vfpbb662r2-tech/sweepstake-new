import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

export interface AuthContext {
  user: {
    id: string
    email?: string
    role?: string
  }
  supabase: ReturnType<typeof createClient>
}

export async function authenticateUser(req: Request): Promise<AuthContext | null> {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          persistSession: false,
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error('Authentication error:', error)
      return null
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      supabase,
    }
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  }
}

export function requireAuth(authContext: AuthContext | null): AuthContext {
  if (!authContext) {
    throw new Error('Authentication required')
  }
  return authContext
}

export async function requireAuthWithProfile(authContext: AuthContext): Promise<{
  user: AuthContext['user']
  profile: any
  supabase: AuthContext['supabase']
}> {
  const { data: profile, error } = await authContext.supabase
    .from('profiles')
    .select('*')
    .eq('id', authContext.user.id)
    .single()

  if (error || !profile) {
    throw new Error('User profile not found')
  }

  return {
    user: authContext.user,
    profile,
    supabase: authContext.supabase,
  }
}

// Utility function to check if user is admin
export function isAdmin(user: AuthContext['user']): boolean {
  return user.role === 'admin' || user.role === 'service_role'
}

// Utility function to validate request body
export async function validateRequestBody<T>(
  req: Request,
  requiredFields: (keyof T)[]
): Promise<T> {
  let body: any
  
  try {
    body = await req.json()
  } catch (error) {
    throw new Error('Invalid JSON in request body')
  }

  if (!body || typeof body !== 'object') {
    throw new Error('Request body must be an object')
  }

  const missingFields = requiredFields.filter(field => 
    body[field] === undefined || body[field] === null
  )

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }

  return body as T
}

// Utility function to sanitize user input
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string')
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

// Utility function to validate UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Utility function to check sweepstake access
export async function checkSweepstakeAccess(
  supabase: AuthContext['supabase'],
  sweepstakeId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('can_access_sweepstake', {
      sweepstake_id: sweepstakeId,
      user_id: userId
    })

  if (error) {
    console.error('Error checking sweepstake access:', error)
    return false
  }

  return data === true
}

// Utility function to check if user is sweepstake creator
export async function isSweepstakeCreator(
  supabase: AuthContext['supabase'],
  sweepstakeId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('sweepstakes')
    .select('created_by')
    .eq('id', sweepstakeId)
    .single()

  if (error || !data) {
    return false
  }

  return data.created_by === userId
}

// Security headers for enhanced protection
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
}

// Utility to add security headers to response
export function addSecurityHeaders(headers: Record<string, string>): Record<string, string> {
  return {
    ...headers,
    ...securityHeaders,
  }
}