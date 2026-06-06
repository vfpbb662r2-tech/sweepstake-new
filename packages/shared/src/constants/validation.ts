/**
 * Validation constants and limits
 */
export const VALIDATION_LIMITS = {
  // User fields
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  
  // Sweepstake fields
  SWEEPSTAKE_NAME_MIN_LENGTH: 1,
  SWEEPSTAKE_NAME_MAX_LENGTH: 100,
  SWEEPSTAKE_DESCRIPTION_MAX_LENGTH: 500,
  MAX_PARTICIPANTS_MIN: 2,
  MAX_PARTICIPANTS_MAX: 1000,
  ENTRY_FEE_MIN: 0,
  ENTRY_FEE_MAX: 10000,
  
  // Tournament fields
  TOURNAMENT_NAME_MIN_LENGTH: 1,
  TOURNAMENT_NAME_MAX_LENGTH: 100,
  TOURNAMENT_DESCRIPTION_MAX_LENGTH: 500,
  TEAM_NAME_MIN_LENGTH: 1,
  TEAM_NAME_MAX_LENGTH: 50,
  VENUE_MAX_LENGTH: 100,
  
  // General
  SEARCH_QUERY_MIN_LENGTH: 1,
  SEARCH_QUERY_MAX_LENGTH: 100,
  PAGINATION_LIMIT_MIN: 1,
  PAGINATION_LIMIT_MAX: 100,
  PAGINATION_LIMIT_DEFAULT: 20,
  
  // File uploads
  AVATAR_MAX_SIZE_MB: 5,
  LOGO_MAX_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Regular expressions for validation
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  COLOR_HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  COUNTRY_CODE: /^[A-Z]{2}$/,
} as const;

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  // Required fields
  REQUIRED: 'This field is required',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  NAME_REQUIRED: 'Name is required',
  
  // Format validation
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_WEAK: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  URL_INVALID: 'Please enter a valid URL',
  PHONE_INVALID: 'Please enter a valid phone number',
  
  // Length validation
  NAME_TOO_SHORT: 'Name is too short',
  NAME_TOO_LONG: 'Name is too long',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN_LENGTH} characters`,
  PASSWORD_TOO_LONG: 'Password is too long',
  EMAIL_TOO_LONG: 'Email is too long',
  
  // Numeric validation
  NUMBER_MIN: 'Value is too small',
  NUMBER_MAX: 'Value is too large',
  NUMBER_INVALID: 'Please enter a valid number',
  
  // Confirmation validation
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  EMAIL_CONFIRMATION_MISMATCH: 'Email addresses do not match',
  
  // File validation
  FILE_TOO_LARGE: 'File is too large',
  INVALID_FILE_TYPE: 'Invalid file type',
  
  // Business logic validation
  DATE_IN_PAST: 'Date cannot be in the past',
  END_DATE_BEFORE_START: 'End date must be after start date',
  PERCENTAGE_INVALID: 'Percentage must be between 0 and 100',
  PRIZE_DISTRIBUTION_TOTAL: 'Prize distribution must total 100%',
} as const;

/**
 * Allowed file types
 */
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
} as const;

/**
 * Common validation rules
 */
export const VALIDATION_RULES = {
  EMAIL: {
    required: true,
    pattern: REGEX_PATTERNS.EMAIL,
    maxLength: VALIDATION_LIMITS.EMAIL_MAX_LENGTH,
  },
  PASSWORD: {
    required: true,
    minLength: VALIDATION_LIMITS.PASSWORD_MIN_LENGTH,
    maxLength: VALIDATION_LIMITS.PASSWORD_MAX_LENGTH,
    pattern: REGEX_PATTERNS.PASSWORD,
  },
  NAME: {
    required: true,
    minLength: VALIDATION_LIMITS.NAME_MIN_LENGTH,
    maxLength: VALIDATION_LIMITS.NAME_MAX_LENGTH,
  },
  PHONE: {
    pattern: REGEX_PATTERNS.PHONE,
  },
  URL: {
    pattern: REGEX_PATTERNS.URL,
  },
} as const;