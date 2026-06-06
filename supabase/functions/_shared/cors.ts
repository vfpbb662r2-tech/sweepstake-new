const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
}

export function handleCors(req: Request): Response | null {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200,
    })
  }

  return null
}

export function createCorsResponse(
  data: any,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json',
    ...additionalHeaders,
  }

  return new Response(
    JSON.stringify(data),
    {
      status,
      headers,
    }
  )
}

export function createErrorResponse(
  error: string,
  status: number = 400,
  additionalHeaders: Record<string, string> = {}
): Response {
  return createCorsResponse(
    { error },
    status,
    additionalHeaders
  )
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 60 // Max requests per window

interface RateLimitEntry {
  count: number
  resetTime: number
}

// Simple in-memory rate limiting (for Edge Functions)
const rateLimitMap = new Map<string, RateLimitEntry>()

export function checkRateLimit(identifier: string): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetTime) {
    // New window or expired entry
    const resetTime = now + RATE_LIMIT_WINDOW
    rateLimitMap.set(identifier, { count: 1, resetTime })
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime,
    }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  entry.count++
  rateLimitMap.set(identifier, entry)

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - entry.count,
    resetTime: entry.resetTime,
  }
}

export function createRateLimitResponse(resetTime: number): Response {
  return createErrorResponse(
    'Rate limit exceeded',
    429,
    {
      'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
      'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
    }
  )
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, RATE_LIMIT_WINDOW)