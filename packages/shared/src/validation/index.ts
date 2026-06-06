import { z } from 'zod';
import { 
  AUTH_CONFIG, 
  VALIDATION, 
  USER_ROLES,
  THEME,
  LANGUAGES,
  PLATFORMS
} from '../constants';

// Base schemas
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// User validation schemas
export const UserRoleSchema = z.enum([USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.MODERATOR]);

export const UserSchema = BaseEntitySchema.extend({
  email: z.string().email().max(255),
  username: z.string()
    .min(AUTH_CONFIG.USERNAME_MIN_LENGTH)
    .max(AUTH_CONFIG.USERNAME_MAX_LENGTH)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  full_name: z.string().max(VALIDATION.NAME_MAX_LENGTH).nullable(),
  avatar_url: z.string().url().nullable(),
  role: UserRoleSchema,
  email_verified: z.boolean(),
  phone: z.string().regex(VALIDATION.PHONE_REGEX).nullable(),
  phone_verified: z.boolean(),
  last_sign_in_at: z.string().datetime().nullable(),
  metadata: z.record(z.any()),
});

export const UserPreferencesSchema = z.object({
  theme: z.enum([THEME.LIGHT, THEME.DARK, THEME.SYSTEM]),
  language: z.enum([LANGUAGES.EN, LANGUAGES.ES, LANGUAGES.FR, LANGUAGES.DE]),
  notifications: z.object({
    email_notifications: z.boolean(),
    push_notifications: z.boolean(),
    marketing_emails: z.boolean(),
    security_alerts: z.boolean(),
  }),
  timezone: z.string(),
});

export const PrivacySettingsSchema = z.object({
  profile_visibility: z.enum(['public', 'private', 'friends']),
  show_email: z.boolean(),
  show_phone: z.boolean(),
  allow_friend_requests: z.boolean(),
});

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  bio: z.string().max(VALIDATION.DESCRIPTION_MAX_LENGTH).nullable(),
  website: z.string().url().nullable(),
  location: z.string().max(VALIDATION.NAME_MAX_LENGTH).nullable(),
  birth_date: z.string().date().nullable(),
  preferences: UserPreferencesSchema,
  privacy_settings: PrivacySettingsSchema,
});

// Authentication schemas
export const PasswordSchema = z.string()
  .min(AUTH_CONFIG.PASSWORD_MIN_LENGTH, `Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters`)
  .max(AUTH_CONFIG.PASSWORD_MAX_LENGTH, `Password must be no more than ${AUTH_CONFIG.PASSWORD_MAX_LENGTH} characters`)
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().optional(),
});

export const RegisterCredentialsSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
  username: z.string()
    .min(AUTH_CONFIG.USERNAME_MIN_LENGTH)
    .max(AUTH_CONFIG.USERNAME_MAX_LENGTH)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  full_name: z.string().max(VALIDATION.NAME_MAX_LENGTH).optional(),
});

export const ResetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const UpdatePasswordRequestSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: PasswordSchema,
});

export const SocialAuthProviderSchema = z.object({
  provider: z.enum(['google', 'apple', 'facebook', 'github']),
  redirect_url: z.string().url().optional(),
});

// API schemas
export const PaginationParamsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(VALIDATION.MAX_LIMIT).optional().default(20),
  offset: z.number().int().min(0).optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const SearchParamsSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.any()).optional(),
  sort: z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']),
  }).optional(),
  pagination: PaginationParamsSchema.optional(),
});

// Request schemas
export const CreateUserRequestSchema = z.object({
  email: z.string().email(),
  username: z.string()
    .min(AUTH_CONFIG.USERNAME_MIN_LENGTH)
    .max(AUTH_CONFIG.USERNAME_MAX_LENGTH)
    .regex(/^[a-zA-Z0-9_-]+$/),
  password: PasswordSchema,
  full_name: z.string().max(VALIDATION.NAME_MAX_LENGTH).optional(),
});

export const UpdateUserRequestSchema = z.object({
  username: z.string()
    .min(AUTH_CONFIG.USERNAME_MIN_LENGTH)
    .max(AUTH_CONFIG.USERNAME_MAX_LENGTH)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
  full_name: z.string().max(VALIDATION.NAME_MAX_LENGTH).optional(),
  avatar_url: z.string().url().optional(),
  phone: z.string().regex(VALIDATION.PHONE_REGEX).optional(),
});

export const UpdateProfileRequestSchema = z.object({
  bio: z.string().max(VALIDATION.DESCRIPTION_MAX_LENGTH).optional(),
  website: z.string().url().optional(),
  location: z.string().max(VALIDATION.NAME_MAX_LENGTH).optional(),
  birth_date: z.string().date().optional(),
});

// File upload schemas
export const FileUploadSchema = z.object({
  file: z.any(), // File/Blob object
  path: z.string(),
  content_type: z.string(),
  size: z.number().max(VALIDATION.MAX_FILE_SIZE),
});

export const UploadedFileSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  path: z.string(),
  name: z.string(),
  size: z.number(),
  content_type: z.string(),
  uploaded_at: z.string().datetime(),
});

// Device and session schemas
export const DeviceInfoSchema = z.object({
  platform: z.enum([PLATFORMS.WEB, PLATFORMS.IOS, PLATFORMS.ANDROID]),
  device_id: z.string(),
  device_name: z.string(),
  os_version: z.string(),
  app_version: z.string(),
  push_token: z.string().optional(),
});

export const UserSessionSchema = BaseEntitySchema.extend({
  user_id: z.string().uuid(),
  device_info: DeviceInfoSchema,
  ip_address: z.string().ip(),
  user_agent: z.string(),
  is_active: z.boolean(),
  last_activity_at: z.string().datetime(),
  expires_at: z.string().datetime(),
});

// Notification schemas
export const NotificationTypeSchema = z.enum(['info', 'success', 'warning', 'error', 'system', 'social']);

export const NotificationSchema = BaseEntitySchema.extend({
  user_id: z.string().uuid(),
  title: z.string().max(VALIDATION.TITLE_MAX_LENGTH),
  message: z.string().max(VALIDATION.DESCRIPTION_MAX_LENGTH),
  type: NotificationTypeSchema,
  read: z.boolean(),
  data: z.record(z.any()).optional(),
});

// Analytics schemas
export const AnalyticsEventSchema = z.object({
  name: z.string(),
  properties: z.record(z.any()).optional(),
  user_id: z.string().uuid().optional(),
  session_id: z.string().uuid().optional(),
  timestamp: z.string().datetime(),
});

// Webhook schemas
export const WebhookPayloadSchema = z.object({
  event: z.string(),
  data: z.any(),
  timestamp: z.string().datetime(),
  signature: z.string(),
});

// Configuration validation
export const DatabaseConfigSchema = z.object({
  url: z.string().url(),
  connection_pool_size: z.number().int().min(1).max(100),
  timeout: z.number().int().min(1000),
  ssl: z.boolean(),
});

export const CacheConfigSchema = z.object({
  enabled: z.boolean(),
  ttl: z.number().int().min(60),
  max_size: z.number().int().min(100),
});

export const AppConfigSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']),
  database: DatabaseConfigSchema,
  cache: CacheConfigSchema,
  auth: z.object({
    jwt_secret: z.string().min(32),
    token_expiry: z.number().int().min(300),
    refresh_token_expiry: z.number().int().min(86400),
  }),
  features: z.record(z.boolean()),
});

// Validation utility functions
export function validateEmail(email: string): boolean {
  return VALIDATION.EMAIL_REGEX.test(email);
}

export function validatePhone(phone: string): boolean {
  return VALIDATION.PHONE_REGEX.test(phone);
}

export function validateUrl(url: string): boolean {
  return VALIDATION.URL_REGEX.test(url);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters`);
  }
  
  if (password.length > AUTH_CONFIG.PASSWORD_MAX_LENGTH) {
    errors.push(`Password must be no more than ${AUTH_CONFIG.PASSWORD_MAX_LENGTH} characters`);
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateFileSize(size: number): boolean {
  return size <= VALIDATION.MAX_FILE_SIZE;
}

export function validateImageType(contentType: string): boolean {
  return VALIDATION.ALLOWED_IMAGE_TYPES.includes(contentType);
}

export function validateDocumentType(contentType: string): boolean {
  return VALIDATION.ALLOWED_DOCUMENT_TYPES.includes(contentType);
}

// Schema type exports for TypeScript inference
export type UserSchemaType = z.infer<typeof UserSchema>;
export type LoginCredentialsType = z.infer<typeof LoginCredentialsSchema>;
export type RegisterCredentialsType = z.infer<typeof RegisterCredentialsSchema>;
export type CreateUserRequestType = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequestType = z.infer<typeof UpdateUserRequestSchema>;
export type UpdateProfileRequestType = z.infer<typeof UpdateProfileRequestSchema>;
export type PaginationParamsType = z.infer<typeof PaginationParamsSchema>;
export type SearchParamsType = z.infer<typeof SearchParamsSchema>;
export type DeviceInfoType = z.infer<typeof DeviceInfoSchema>;
export type NotificationType = z.infer<typeof NotificationSchema>;
export type AnalyticsEventType = z.infer<typeof AnalyticsEventSchema>;

// Export all schemas and utilities
export {
  BaseEntitySchema,
  UserSchema,
  UserPreferencesSchema,
  PrivacySettingsSchema,
  UserProfileSchema,
  PasswordSchema,
};