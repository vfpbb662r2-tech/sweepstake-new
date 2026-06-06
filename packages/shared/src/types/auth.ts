export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: AuthUser;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  options?: {
    data?: Record<string, any>;
    captchaToken?: string;
  };
}

export interface SignInCredentials {
  email: string;
  password: string;
  options?: {
    captchaToken?: string;
  };
}

export interface ResetPasswordCredentials {
  email: string;
  options?: {
    captchaToken?: string;
  };
}

export interface UpdatePasswordCredentials {
  password: string;
}

export interface UpdateUserCredentials {
  email?: string;
  password?: string;
  data?: Record<string, any>;
}

export interface AuthResponse {
  user: AuthUser | null;
  session: AuthSession | null;
  error: AuthError | null;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
}

// OAuth providers
export type OAuthProvider = 
  | 'google'
  | 'facebook'
  | 'apple'
  | 'twitter'
  | 'github';

export interface OAuthOptions {
  provider: OAuthProvider;
  options?: {
    redirectTo?: string;
    scopes?: string;
    queryParams?: Record<string, string>;
  };
}

// Profile types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  country?: string;
  timezone?: string;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sweepstake_invites: boolean;
    match_results: boolean;
    draw_results: boolean;
    payment_reminders: boolean;
  };
  privacy: {
    profile_visible: boolean;
    show_statistics: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    timezone: string;
  };
}

export interface UpdateProfileForm {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  country?: string;
  timezone?: string;
}

export interface UpdatePreferencesForm {
  preferences: Partial<UserPreferences>;
}