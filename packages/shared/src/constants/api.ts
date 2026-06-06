/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * HTTP methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

/**
 * Content types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // User endpoints
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/change-password',
  
  // Tournament endpoints
  TOURNAMENTS: '/tournaments',
  TOURNAMENT_DETAIL: '/tournaments/:id',
  TOURNAMENT_TEAMS: '/tournaments/:id/teams',
  TOURNAMENT_MATCHES: '/tournaments/:id/matches',
  
  // Sweepstake endpoints
  SWEEPSTAKES: '/sweepstakes',
  SWEEPSTAKE_DETAIL: '/sweepstakes/:id',
  CREATE_SWEEPSTAKE: '/sweepstakes',
  JOIN_SWEEPSTAKE: '/sweepstakes/:id/join',
  LEAVE_SWEEPSTAKE: '/sweepstakes/:id/leave',
  SWEEPSTAKE_PARTICIPANTS: '/sweepstakes/:id/participants',
  SWEEPSTAKE_ENTRIES: '/sweepstakes/:id/entries',
  DRAW_TEAMS: '/sweepstakes/:id/draw',
  SWEEPSTAKE_LEADERBOARD: '/sweepstakes/:id/leaderboard',
  
  // Invite endpoints
  SEND_INVITES: '/invites',
  ACCEPT_INVITE: '/invites/:id/accept',
  DECLINE_INVITE: '/invites/:id/decline',
  
  // Upload endpoints
  UPLOAD_AVATAR: '/upload/avatar',
  UPLOAD_TOURNAMENT_LOGO: '/upload/tournament-logo',
} as const;

/**
 * Request timeout values (in milliseconds)
 */
export const REQUEST_TIMEOUT = {
  DEFAULT: 10000,
  UPLOAD: 30000,
  DOWNLOAD: 60000,
} as const;

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  DELAY_MS: 1000,
  BACKOFF_FACTOR: 2,
} as const;

/**
 * Rate limiting
 */
export const RATE_LIMITS = {
  AUTH_ATTEMPTS: 5,
  API_REQUESTS_PER_MINUTE: 100,
  EMAIL_SENDS_PER_HOUR: 10,
} as const;

/**
 * Cache duration (in milliseconds)
 */
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Business logic errors
  SWEEPSTAKE_FULL: 'SWEEPSTAKE_FULL',
  ALREADY_JOINED: 'ALREADY_JOINED',
  TOURNAMENT_STARTED: 'TOURNAMENT_STARTED',
  DRAW_ALREADY_COMPLETED: 'DRAW_ALREADY_COMPLETED',
  
  // System errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;