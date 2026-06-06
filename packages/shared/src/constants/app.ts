// Application constants
export const APP_NAME = 'Sweepstake' as const;
export const APP_DESCRIPTION = 'Modern tournament sweepstakes for friends and communities' as const;
export const APP_VERSION = '1.0.0' as const;

// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api' as const;
export const API_TIMEOUT = 30000 as const; // 30 seconds

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20 as const;
export const MAX_PAGE_SIZE = 100 as const;
export const MIN_PAGE_SIZE = 5 as const;

// File upload limits
export const MAX_FILE_SIZE = 5 * 1024 * 1024 as const; // 5MB
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024 as const; // 2MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 as const; // 10MB

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

// Validation limits
export const VALIDATION_LIMITS = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  JOIN_CODE_LENGTH: 6,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  
  // Sweepstake limits
  MIN_PARTICIPANTS: 2,
  MAX_PARTICIPANTS: 1000,
  MIN_ENTRY_FEE: 0,
  MAX_ENTRY_FEE: 10000,
  
  // Tournament limits
  MAX_TEAMS_PER_TOURNAMENT: 1000,
  MAX_MATCHES_PER_TOURNAMENT: 10000,
  
  // Bulk operation limits
  MAX_BULK_TEAMS: 100,
  MAX_BULK_MATCHES: 1000,
  MAX_BULK_INVITES: 50,
} as const;

// Time constants
export const TIME_CONSTANTS = {
  SECONDS_IN_MINUTE: 60,
  MINUTES_IN_HOUR: 60,
  HOURS_IN_DAY: 24,
  DAYS_IN_WEEK: 7,
  DAYS_IN_MONTH: 30,
  DAYS_IN_YEAR: 365,
  
  // Session durations
  SESSION_DURATION: 30 * 24 * 60 * 60, // 30 days in seconds
  REFRESH_TOKEN_DURATION: 90 * 24 * 60 * 60, // 90 days in seconds
  
  // Cache durations
  CACHE_SHORT: 5 * 60, // 5 minutes
  CACHE_MEDIUM: 30 * 60, // 30 minutes
  CACHE_LONG: 24 * 60 * 60, // 24 hours
  
  // API timeouts
  REQUEST_TIMEOUT: 30000, // 30 seconds
  UPLOAD_TIMEOUT: 120000, // 2 minutes
} as const;

// Status constants
export const SWEEPSTAKE_STATUS = {
  DRAFT: 'draft',
  OPEN: 'open',
  FULL: 'full',
  DRAWN: 'drawn',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const INVITE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
} as const;

export const NOTIFICATION_TYPE = {
  SWEEPSTAKE_INVITE: 'sweepstake_invite',
  SWEEPSTAKE_DRAW: 'sweepstake_draw',
  MATCH_RESULT: 'match_result',
  SWEEPSTAKE_COMPLETE: 'sweepstake_complete',
  PAYMENT_REMINDER: 'payment_reminder',
  GENERAL: 'general',
} as const;

// UI constants
export const THEME_MODE = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const BREAKPOINTS = {
  XS: '0px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

// Error codes
export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Authorization errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  
  // Business logic errors
  SWEEPSTAKE_FULL: 'SWEEPSTAKE_FULL',
  SWEEPSTAKE_CLOSED: 'SWEEPSTAKE_CLOSED',
  ALREADY_PARTICIPANT: 'ALREADY_PARTICIPANT',
  INVALID_JOIN_CODE: 'INVALID_JOIN_CODE',
  DRAW_ALREADY_PERFORMED: 'DRAW_ALREADY_PERFORMED',
  INSUFFICIENT_PARTICIPANTS: 'INSUFFICIENT_PARTICIPANTS',
  
  // System errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: 'Account created successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_RESET: 'Password reset link sent',
  PASSWORD_UPDATED: 'Password updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PREFERENCES_UPDATED: 'Preferences updated successfully',
  
  SWEEPSTAKE_CREATED: 'Sweepstake created successfully',
  SWEEPSTAKE_UPDATED: 'Sweepstake updated successfully',
  SWEEPSTAKE_DELETED: 'Sweepstake deleted successfully',
  SWEEPSTAKE_JOINED: 'Joined sweepstake successfully',
  SWEEPSTAKE_LEFT: 'Left sweepstake successfully',
  
  INVITE_SENT: 'Invitation sent successfully',
  INVITE_ACCEPTED: 'Invitation accepted',
  INVITE_DECLINED: 'Invitation declined',
  
  DRAW_PERFORMED: 'Draw performed successfully',
  TEAMS_ALLOCATED: 'Teams allocated successfully',
  
  FILE_UPLOADED: 'File uploaded successfully',
  CHANGES_SAVED: 'Changes saved successfully',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
  
  SWEEPSTAKES: '/sweepstakes',
  SWEEPSTAKE_CREATE: '/sweepstakes/create',
  SWEEPSTAKE_DETAIL: (id: string) => `/sweepstakes/${id}`,
  SWEEPSTAKE_EDIT: (id: string) => `/sweepstakes/${id}/edit`,
  SWEEPSTAKE_JOIN: '/sweepstakes/join',
  
  TOURNAMENTS: '/tournaments',
  TOURNAMENT_DETAIL: (id: string) => `/tournaments/${id}`,
  
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_PREFERENCES: '/settings/preferences',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  
  HELP: '/help',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  CONTACT: '/contact',
} as const;

// Feature flags
export const FEATURES = {
  OAUTH_LOGIN: true,
  PUSH_NOTIFICATIONS: true,
  PAYMENT_INTEGRATION: false,
  TOURNAMENT_MANAGEMENT: true,
  BULK_OPERATIONS: true,
  REAL_TIME_UPDATES: true,
  ANALYTICS: true,
  DARK_MODE: true,
  MOBILE_APP: true,
} as const;

// Environment variables
export const ENV_VARS = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;