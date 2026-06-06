import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';
import type { Database } from '@sweepstake/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any | null;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
}

class AuthService {
  private biometricAuthEnabled: boolean = false;
  private biometricType: LocalAuthentication.AuthenticationType | null = null;

  constructor() {
    this.initializeBiometrics();
  }

  private async initializeBiometrics() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        this.biometricType = authTypes[0] || null;
        this.biometricAuthEnabled = true;
      }
    } catch (error) {
      console.log('Biometric initialization failed:', error);
    }
  }

  async checkBiometricAvailability(): Promise<{
    available: boolean;
    type: LocalAuthentication.AuthenticationType | null;
  }> {
    return {
      available: this.biometricAuthEnabled,
      type: this.biometricType,
    };
  }

  async authenticateWithBiometrics(): Promise<boolean> {
    if (!this.biometricAuthEnabled) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your sweepstakes',
        fallbackLabel: 'Use password instead',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.log('Biometric authentication failed:', error);
      return false;
    }
  }

  async signIn(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
      });

      if (error) {
        return { success: false, error: this.getReadableError(error.message) };
      }

      if (data.user) {
        // Store credentials for biometric auth if available
        if (this.biometricAuthEnabled) {
          await this.storeBiometricCredentials(credentials);
        }
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  async signUp(credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
          },
        },
      });

      if (error) {
        return { success: false, error: this.getReadableError(error.message) };
      }

      if (data.user) {
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  async signInWithMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
      });

      if (error) {
        return { success: false, error: this.getReadableError(error.message) };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      // Clear stored biometric credentials
      await this.clearBiometricCredentials();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.log('Get user error:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.log('Get current user failed:', error);
      return null;
    }
  }

  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.log('Get session error:', error);
        return null;
      }
      
      return session;
    } catch (error) {
      console.log('Get session failed:', error);
      return null;
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: 'com.sweepstake.mobile://reset-password',
        }
      );

      if (error) {
        return { success: false, error: this.getReadableError(error.message) };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset failed' 
      };
    }
  }

  async signInWithBiometrics(): Promise<{ success: boolean; error?: string }> {
    try {
      const isAuthenticated = await this.authenticateWithBiometrics();
      
      if (!isAuthenticated) {
        return { success: false, error: 'Biometric authentication failed' };
      }

      const credentials = await this.getBiometricCredentials();
      if (!credentials) {
        return { success: false, error: 'No stored credentials found' };
      }

      return await this.signIn(credentials);
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Biometric sign in failed' 
      };
    }
  }

  private async storeBiometricCredentials(credentials: LoginCredentials): Promise<void> {
    try {
      await AsyncStorage.setItem('biometric_credentials', JSON.stringify(credentials));
    } catch (error) {
      console.log('Failed to store biometric credentials:', error);
    }
  }

  private async getBiometricCredentials(): Promise<LoginCredentials | null> {
    try {
      const stored = await AsyncStorage.getItem('biometric_credentials');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.log('Failed to get biometric credentials:', error);
      return null;
    }
  }

  private async clearBiometricCredentials(): Promise<void> {
    try {
      await AsyncStorage.removeItem('biometric_credentials');
    } catch (error) {
      console.log('Failed to clear biometric credentials:', error);
    }
  }

  private getReadableError(message: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Incorrect email or password',
      'Email not confirmed': 'Please check your email and click the confirmation link',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long',
      'Signup requires a valid password': 'Please enter a valid password',
    };

    return errorMap[message] || message;
  }
}

export const authService = new AuthService();

// Auth state observer
export const onAuthStateChange = (callback: (user: any | null) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
};
