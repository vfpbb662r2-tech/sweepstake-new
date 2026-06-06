// Competition and tournament constants
export const TOURNAMENT_TYPES = {
  WORLD_CUP: 'world_cup',
  EUROS: 'euros',
  COPA_AMERICA: 'copa_america',
  NATIONS_LEAGUE: 'nations_league',
  CUSTOM: 'custom'
} as const;

export type TournamentType = typeof TOURNAMENT_TYPES[keyof typeof TOURNAMENT_TYPES];

// Team progression stages
export const TEAM_STAGES = {
  GROUP: 'group',
  ROUND_16: 'round_16',
  QUARTER_FINAL: 'quarter_final',
  SEMI_FINAL: 'semi_final',
  FINAL: 'final',
  WINNER: 'winner',
  ELIMINATED: 'eliminated'
} as const;

export type TeamStage = typeof TEAM_STAGES[keyof typeof TEAM_STAGES];

// Points system for default scoring
export const DEFAULT_POINTS = {
  GROUP_STAGE_WIN: 3,
  GROUP_STAGE_DRAW: 1,
  KNOCKOUT_WIN: 5,
  QUARTER_FINAL_REACH: 10,
  SEMI_FINAL_REACH: 15,
  FINAL_REACH: 25,
  TOURNAMENT_WIN: 50,
  PARTICIPATION: 1
} as const;

// Entry fee limits and defaults
export const ENTRY_FEES = {
  MIN: 1,
  MAX: 1000,
  DEFAULT: 10,
  CURRENCY: 'USD'
} as const;

// Participant limits
export const PARTICIPANT_LIMITS = {
  MIN: 2,
  MAX: 100,
  RECOMMENDED: 32
} as const;

// Validation constraints
export const VALIDATION_LIMITS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  EMAIL_MAX_LENGTH: 254,
  TOURNAMENT_NAME_MAX_LENGTH: 200
} as const;

// Date and time constants
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  DATETIME: 'yyyy-MM-dd HH:mm:ss',
  TIME: 'HH:mm'
} as const;

// API response codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// Error codes for business logic
export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Sweepstake errors
  SWEEPSTAKE_NOT_FOUND: 'SWEEPSTAKE_NOT_FOUND',
  ALREADY_JOINED: 'ALREADY_JOINED',
  SWEEPSTAKE_FULL: 'SWEEPSTAKE_FULL',
  INSUFFICIENT_TEAMS: 'INSUFFICIENT_TEAMS',
  DRAW_ALREADY_COMPLETED: 'DRAW_ALREADY_COMPLETED',
  
  // Permission errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  NOT_ORGANIZER: 'NOT_ORGANIZER',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Success messages
export const SUCCESS_MESSAGES = {
  SWEEPSTAKE_CREATED: 'Sweepstake created successfully',
  JOINED_SWEEPSTAKE: 'Successfully joined sweepstake',
  DRAW_COMPLETED: 'Team draw completed successfully',
  SETTINGS_UPDATED: 'Settings updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
} as const;

// World Cup 2026 teams (example data)
export const WORLD_CUP_2026_TEAMS = [
  // AFC (Asia)
  { code: 'AUS', name: 'Australia', confederation: 'AFC' },
  { code: 'IRN', name: 'Iran', confederation: 'AFC' },
  { code: 'JPN', name: 'Japan', confederation: 'AFC' },
  { code: 'KOR', name: 'South Korea', confederation: 'AFC' },
  { code: 'KSA', name: 'Saudi Arabia', confederation: 'AFC' },
  { code: 'QAT', name: 'Qatar', confederation: 'AFC' },
  
  // CAF (Africa)
  { code: 'ALG', name: 'Algeria', confederation: 'CAF' },
  { code: 'CMR', name: 'Cameroon', confederation: 'CAF' },
  { code: 'EGY', name: 'Egypt', confederation: 'CAF' },
  { code: 'GHA', name: 'Ghana', confederation: 'CAF' },
  { code: 'MAR', name: 'Morocco', confederation: 'CAF' },
  { code: 'NGA', name: 'Nigeria', confederation: 'CAF' },
  { code: 'SEN', name: 'Senegal', confederation: 'CAF' },
  { code: 'TUN', name: 'Tunisia', confederation: 'CAF' },
  
  // CONCACAF (North/Central America & Caribbean)
  { code: 'CAN', name: 'Canada', confederation: 'CONCACAF' },
  { code: 'CRC', name: 'Costa Rica', confederation: 'CONCACAF' },
  { code: 'MEX', name: 'Mexico', confederation: 'CONCACAF' },
  { code: 'USA', name: 'United States', confederation: 'CONCACAF' },
  
  // CONMEBOL (South America)
  { code: 'ARG', name: 'Argentina', confederation: 'CONMEBOL' },
  { code: 'BOL', name: 'Bolivia', confederation: 'CONMEBOL' },
  { code: 'BRA', name: 'Brazil', confederation: 'CONMEBOL' },
  { code: 'CHI', name: 'Chile', confederation: 'CONMEBOL' },
  { code: 'COL', name: 'Colombia', confederation: 'CONMEBOL' },
  { code: 'ECU', name: 'Ecuador', confederation: 'CONMEBOL' },
  { code: 'PAR', name: 'Paraguay', confederation: 'CONMEBOL' },
  { code: 'PER', name: 'Peru', confederation: 'CONMEBOL' },
  { code: 'URU', name: 'Uruguay', confederation: 'CONMEBOL' },
  { code: 'VEN', name: 'Venezuela', confederation: 'CONMEBOL' },
  
  // UEFA (Europe)
  { code: 'AUT', name: 'Austria', confederation: 'UEFA' },
  { code: 'BEL', name: 'Belgium', confederation: 'UEFA' },
  { code: 'CRO', name: 'Croatia', confederation: 'UEFA' },
  { code: 'CZE', name: 'Czech Republic', confederation: 'UEFA' },
  { code: 'DEN', name: 'Denmark', confederation: 'UEFA' },
  { code: 'ENG', name: 'England', confederation: 'UEFA' },
  { code: 'FRA', name: 'France', confederation: 'UEFA' },
  { code: 'GER', name: 'Germany', confederation: 'UEFA' },
  { code: 'HUN', name: 'Hungary', confederation: 'UEFA' },
  { code: 'ITA', name: 'Italy', confederation: 'UEFA' },
  { code: 'NED', name: 'Netherlands', confederation: 'UEFA' },
  { code: 'NOR', name: 'Norway', confederation: 'UEFA' },
  { code: 'POL', name: 'Poland', confederation: 'UEFA' },
  { code: 'POR', name: 'Portugal', confederation: 'UEFA' },
  { code: 'RUS', name: 'Russia', confederation: 'UEFA' },
  { code: 'SRB', name: 'Serbia', confederation: 'UEFA' },
  { code: 'ESP', name: 'Spain', confederation: 'UEFA' },
  { code: 'SUI', name: 'Switzerland', confederation: 'UEFA' },
  { code: 'TUR', name: 'Turkey', confederation: 'UEFA' },
  { code: 'UKR', name: 'Ukraine', confederation: 'UEFA' },
  { code: 'WAL', name: 'Wales', confederation: 'UEFA' }
] as const;

// Confederation mappings
export const CONFEDERATIONS = {
  AFC: 'Asian Football Confederation',
  CAF: 'Confederation of African Football',
  CONCACAF: 'Confederation of North, Central America and Caribbean Association Football',
  CONMEBOL: 'South American Football Confederation',
  UEFA: 'Union of European Football Associations',
  OFC: 'Oceania Football Confederation'
} as const;

// UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 4000,
  PAGINATION_SIZE: 20,
  SEARCH_MIN_CHARS: 2
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language'
} as const;

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

export type Theme = typeof THEMES[keyof typeof THEMES];

// App configuration
export const APP_CONFIG = {
  NAME: 'Sweepstake',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@sweepstake.app',
  PRIVACY_URL: 'https://sweepstake.app/privacy',
  TERMS_URL: 'https://sweepstake.app/terms'
} as const;

// Export all types
export type {
  TournamentType,
  TeamStage,
  ErrorCode,
  Theme
};