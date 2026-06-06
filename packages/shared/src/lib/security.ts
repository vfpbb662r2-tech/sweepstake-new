// Security utilities and constants

export const SECURITY_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL_CHAR: false,
  },
  SESSION: {
    EXPIRES_IN: 3600, // 1 hour in seconds
    REFRESH_THRESHOLD: 300, // Refresh when 5 minutes remaining
  },
  RATE_LIMITING: {
    LOGIN_ATTEMPTS: 5,
    LOGIN_WINDOW: 900, // 15 minutes
    API_REQUESTS: 100,
    API_WINDOW: 60, // 1 minute
  },
  INVITE_CODE: {
    LENGTH: 8,
    EXPIRES_IN: 604800, // 7 days
  },
} as const

export const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'key',
  'auth',
  'credential',
] as const

export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
] as const

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/sweepstakes',
  '/profile',
  '/settings',
] as const

// Password validation
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < SECURITY_RULES.PASSWORD.MIN_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_RULES.PASSWORD.MIN_LENGTH} characters long`)
  }

  if (SECURITY_RULES.PASSWORD.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (SECURITY_RULES.PASSWORD.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (SECURITY_RULES.PASSWORD.REQUIRE_NUMBER && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (SECURITY_RULES.PASSWORD.REQUIRE_SPECIAL_CHAR && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
}

// Validate file uploads
export interface FileValidationOptions {
  maxSize: number // in bytes
  allowedTypes: string[]
  allowedExtensions: string[]
}

export function validateFile(
  file: File,
  options: FileValidationOptions
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check file size
  if (file.size > options.maxSize) {
    const maxSizeMB = Math.round(options.maxSize / (1024 * 1024))
    errors.push(`File size must be less than ${maxSizeMB}MB`)
  }

  // Check file type
  if (options.allowedTypes.length > 0 && !options.allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`)
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (extension && options.allowedExtensions.length > 0) {
    if (!options.allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Generate secure tokens
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  // Use crypto.getRandomValues if available (browser environment)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length)
    window.crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
  } else {
    // Fallback to Math.random (less secure, but works in all environments)
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }
  
  return result
}

// Check if route is public
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === path) return true
    if (route.endsWith('*')) {
      return path.startsWith(route.slice(0, -1))
    }
    return false
  })
}

// Check if route requires authentication
export function requiresAuth(path: string): boolean {
  if (isPublicRoute(path)) return false
  
  return PROTECTED_ROUTES.some(route => {
    if (route === path) return true
    if (route.endsWith('*')) {
      return path.startsWith(route.slice(0, -1))
    }
    return false
  })
}

// Remove sensitive fields from objects
export function removeSensitiveFields<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned = { ...obj }
  
  for (const key in cleaned) {
    const lowerKey = key.toLowerCase()
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      delete cleaned[key]
    }
  }
  
  return cleaned
}

// Validate email domain (basic implementation)
export function isValidEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]
  if (!domain) return false
  
  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/
  return domainRegex.test(domain)
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return generateSecureToken(32)
}

// Validate CSRF token (basic implementation)
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false
  return token === expectedToken
}

// Rate limiting utilities
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetTime) {
    // First request or window has expired
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, newEntry)
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime,
    }
  }
  
  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }
  
  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

// Clean up expired rate limit entries
export function cleanupRateLimit(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}