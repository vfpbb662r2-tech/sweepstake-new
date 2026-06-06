import { useEffect, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Linking } from 'react-native';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initializing: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData?: { full_name?: string }) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  enableBiometrics: () => Promise<boolean>;
  signInWithBiometrics: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
}

const BIOMETRIC_KEY = 'biometric_enabled';
const REFRESH_TOKEN_KEY = 'supabase_refresh_token';

export function useAuth(): AuthState & AuthActions {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: false,
    initializing: true,
  });

  // Initialize auth state and set up listeners
  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            session,
            user: session?.user ?? null,
            initializing: false,
          }));
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            initializing: false,
          }));
        }
      }
    }

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (mounted) {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));

        // Store refresh token securely for biometric auth
        if (session?.refresh_token) {
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refresh_token);
        } else {
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        }
      }
    });

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Handle deep links for magic link authentication
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (url.includes('#access_token=') || url.includes('?access_token=')) {
        try {
          const { data, error } = await supabase.auth.getSessionFromUrl({ url });
          if (error) {
            Alert.alert('Authentication Error', error.message);
          }
        } catch (error) {
          console.error('Error handling deep link:', error);
          Alert.alert('Error', 'Failed to process authentication link');
        }
      }
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle deep links when app is already running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    userData?: { full_name?: string }
  ) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: userData,
        },
      });

      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      await supabase.auth.signOut();
      
      // Clear biometric settings and stored tokens
      await AsyncStorage.removeItem(BIOMETRIC_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${Linking.createURL('')}reset-password`,
      });

      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const enableBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      // Check if biometrics are available
      const biometricType = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (biometricType.length === 0) {
        Alert.alert('Unavailable', 'Biometric authentication is not available on this device.');
        return false;
      }

      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert(
          'Not Set Up', 
          'Please set up biometric authentication in your device settings first.'
        );
        return false;
      }

      // Authenticate to enable biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric authentication',
        disableDeviceFallback: true,
      });

      if (result.success) {
        await AsyncStorage.setItem(BIOMETRIC_KEY, 'true');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Enable biometrics error:', error);
      Alert.alert('Error', 'Failed to enable biometric authentication');
      return false;
    }
  }, []);

  const signInWithBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      // Check if biometrics are enabled
      const biometricEnabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
      if (biometricEnabled !== 'true') {
        return false;
      }

      // Check if we have a stored refresh token
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return false;
      }

      // Authenticate with biometrics
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to sign in',
        disableDeviceFallback: true,
      });

      if (!authResult.success) {
        return false;
      }

      // Use refresh token to sign in
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.setSession({
        access_token: '',
        refresh_token: refreshToken,
      });

      if (error) {
        console.error('Biometric sign in error:', error);
        // Clear invalid refresh token
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        await AsyncStorage.removeItem(BIOMETRIC_KEY);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
      }
    } catch (error) {
      console.error('Refresh session error:', error);
    }
  }, []);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    enableBiometrics,
    signInWithBiometrics,
    refreshSession,
  };
}