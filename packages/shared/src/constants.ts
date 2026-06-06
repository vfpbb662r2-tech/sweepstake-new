/**
 * Shared constants across the monorepo
 */

export const APP_CONFIG = {
  APP_NAME: 'Sweepstake',
  VERSION: '0.1.0',
  SUPPORT_EMAIL: 'support@sweepstake.app',
} as const;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
  },
  TOURNAMENTS: {
    LIST: '/api/tournaments',
    DETAILS: (id: string) => `/api/tournaments/${id}`,
    TEAMS: (id: string) => `/api/tournaments/${id}/teams`,
  },
  SWEEPSTAKES: {
    LIST: '/api/sweepstakes',
    CREATE: '/api/sweepstakes',
    DETAILS: (id: string) => `/api/sweepstakes/${id}`,
    JOIN: (id: string) => `/api/sweepstakes/${id}/join`,
    LEAVE: (id: string) => `/api/sweepstakes/${id}/leave`,
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
  },
} as const;

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 500,
  JOIN_CODE_LENGTH: 6,
  MAX_SWEEPSTAKE_PARTICIPANTS: 1000,
} as const;

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_FAILED: 'Validation failed. Please check your input.',
  EMAIL_INVALID: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long.`,
  NAME_REQUIRED: 'Name is required.',
  SWEEPSTAKE_FULL: 'This sweepstake is full.',
  ALREADY_JOINED: 'You have already joined this sweepstake.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Successfully logged out!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SWEEPSTAKE_CREATED: 'Sweepstake created successfully!',
  SWEEPSTAKE_JOINED: 'Successfully joined the sweepstake!',
  SWEEPSTAKE_LEFT: 'Successfully left the sweepstake!',
} as const;