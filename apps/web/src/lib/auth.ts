import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { type User } from '@supabase/supabase-js'

export type AuthUser = User

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'AuthError'
  }
}

class AuthService {
  private supabase = createClientComponentClient()

  async signUp(email: string, password: string, fullName?: string) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        throw new AuthError(error.message, error.message)
      }

      return data
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('An unexpected error occurred during sign up')
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new AuthError(error.message, error.message)
      }

      return data
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('An unexpected error occurred during sign in')
    }
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw new AuthError(error.message, error.message)
      }

      return data
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('An unexpected error occurred during Google sign in')
    }
  }

  async signInWithApple() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw new AuthError(error.message, error.message)
      }

      return data
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('An unexpected error occurred during Apple sign in')
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      
      if (error) {
        throw new AuthError(error.message, error.message)
      }
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('An unexpected error occurred during sign out')
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error) {
        throw new AuthError(error.message, error.message)
      }

      return user
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('An unexpected error occurred while fetching user')
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found
          return null
        }
        throw new AuthError(error.message, error.code)
      }

      return data
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('An unexpected error occurred while fetching user profile')
    }
  }

  async createUserProfile(user: AuthUser): Promise<UserProfile> {
    try {
      const profile = {
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      }

      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert(profile)
        .select()
        .single()

      if (error) {
        throw new AuthError(error.message, error.code)
      }

      return data
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('An unexpected error occurred while creating user profile')
    }
  }

  async updateUserProfile(userId: string, updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw new AuthError(error.message, error.code)
      }

      return data
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('An unexpected error occurred while updating user profile')
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null)
    })
  }

  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw new AuthError(error.message, error.message)
      }
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('An unexpected error occurred while sending reset email')
    }
  }

  async updatePassword(newPassword: string) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        throw new AuthError(error.message, error.message)
      }
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('An unexpected error occurred while updating password')
    }
  }
}

export const authService = new AuthService()

// Utility functions for route protection
export function isAuthenticated(user: AuthUser | null): user is AuthUser {
  return user !== null
}

export function requireAuth(user: AuthUser | null): AuthUser {
  if (!isAuthenticated(user)) {
    throw new AuthError('Authentication required', 'UNAUTHENTICATED')
  }
  return user
}

// Session helpers
export async function getSession() {
  const supabase = createClientComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser(): Promise<AuthUser | null> {
  try {
    return await authService.getCurrentUser()
  } catch {
    return null
  }
}