interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RequestInfo {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RequestInfo>();

export function createRateLimiter(config: RateLimitConfig) {
  return (identifier: string): { allowed: boolean; resetTime: number; remaining: number } => {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Clean expired entries
    for (const [key, info] of rateLimitStore.entries()) {
      if (info.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
    
    const existing = rateLimitStore.get(identifier);
    
    if (!existing || existing.resetTime < now) {
      // New window
      const resetTime = now + config.windowMs;
      rateLimitStore.set(identifier, { count: 1, resetTime });
      return {
        allowed: true,
        resetTime,
        remaining: config.maxRequests - 1
      };
    }
    
    if (existing.count >= config.maxRequests) {
      return {
        allowed: false,
        resetTime: existing.resetTime,
        remaining: 0
      };
    }
    
    existing.count++;
    rateLimitStore.set(identifier, existing);
    
    return {
      allowed: true,
      resetTime: existing.resetTime,
      remaining: config.maxRequests - existing.count
    };
  };
}

// Pre-configured rate limiters
export const rateLimiters = {
  // General API: 100 requests per minute
  general: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  }),
  
  // Authentication: 5 requests per minute
  auth: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5
  }),
  
  // File upload: 10 requests per minute
  upload: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
  }),
  
  // Email sending: 3 requests per minute
  email: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 3
  })
};

export function getRateLimitHeaders(result: ReturnType<ReturnType<typeof createRateLimiter>>) {
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
  };
}

export function handleRateLimit(
  req: Request,
  rateLimiter: ReturnType<typeof createRateLimiter>
): Response | null {
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const identifier = `${clientIP}:${userAgent}`;
  
  const result = rateLimiter(identifier);
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        resetTime: result.resetTime
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...getRateLimitHeaders(result)
        }
      }
    );
  }
  
  return null;
}