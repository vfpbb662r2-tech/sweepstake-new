import { z } from 'zod';

// Base schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Auth schemas
export const signUpSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string(),
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name is too long'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: strongPasswordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: strongPasswordSchema,
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

// Profile schemas
export const updateProfileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name is too long'),
  phone: z.string().regex(/^[+]?[\d\s\-()]+$/, 'Invalid phone number format').optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  timezone: z.string().optional().or(z.literal('')),
});

export const updateAvatarSchema = z.object({
  avatar_url: z.string().url('Invalid URL format'),
});

// Preferences schemas
export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  sweepstake_invites: z.boolean(),
  match_results: z.boolean(),
  draw_results: z.boolean(),
  payment_reminders: z.boolean(),
});

export const privacyPreferencesSchema = z.object({
  profile_visible: z.boolean(),
  show_statistics: z.boolean(),
});

export const displayPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string().min(2).max(5),
  currency: z.string().length(3),
  timezone: z.string(),
});

export const userPreferencesSchema = z.object({
  notifications: notificationPreferencesSchema,
  privacy: privacyPreferencesSchema,
  display: displayPreferencesSchema,
});

export const updatePreferencesSchema = z.object({
  preferences: userPreferencesSchema.partial(),
});

// Validation schemas for client-side
export const emailValidationSchema = z.object({
  email: emailSchema,
});

export const passwordValidationSchema = z.object({
  password: passwordSchema,
});

export const strongPasswordValidationSchema = z.object({
  password: strongPasswordSchema,
});

// OAuth schemas
export const oauthCallbackSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

// Verification schemas
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

// Account deletion schema
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.string().refine(val => val === 'DELETE', {
    message: 'Please type DELETE to confirm',
  }),
});

// Session validation
export const sessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  expires_at: z.number().optional(),
  token_type: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: emailSchema,
    email_confirmed_at: z.string().optional(),
    last_sign_in_at: z.string().optional(),
    user_metadata: z.record(z.any()).optional(),
    app_metadata: z.record(z.any()).optional(),
  }),
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateAvatarInput = z.infer<typeof updateAvatarSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type SessionData = z.infer<typeof sessionSchema>;