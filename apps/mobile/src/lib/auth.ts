import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import * as LocalAuthentication from 'expo-local-authentication'
import type { Database } from '@sweepstake/shared'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Custom storage adapter for Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Auth functions
export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Store credentials for biometric login if successful
  if (data.user) {
    await SecureStore.setItemAsync('biometric_email', email)
    await SecureStore.setItemAsync('biometric_password', password)
  }

  return data
}

export async function signOut() {
  // Clear biometric credentials on sign out
  await SecureStore.deleteItemAsync('biometric_email')
  await SecureStore.deleteItemAsync('biometric_password')
  
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'com.sweepstake.app://reset-password',
  })

  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}

export async function signInWithBiometrics() {
  // Check if biometric authentication is available
  const hasHardware = await LocalAuthentication.hasHardwareAsync()
  if (!hasHardware) {
    throw new Error('Biometric authentication is not available on this device')
  }

  const isEnrolled = await LocalAuthentication.isEnrolledAsync()
  if (!isEnrolled) {
    throw new Error('No biometric credentials are enrolled on this device')
  }

  // Get stored credentials
  const email = await SecureStore.getItemAsync('biometric_email')
  const password = await SecureStore.getItemAsync('biometric_password')

  if (!email || !password) {
    throw new Error('No biometric credentials stored. Please sign in with email and password first.')
  }

  // Authenticate with biometrics
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to access your account',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  })

  if (!result.success) {
    throw new Error('Biometric authentication failed')
  }

  // Sign in with stored credentials
  return await signIn(email, password)
}

export function getCurrentUser() {
  return supabase.auth.getUser()
}

export function getCurrentSession() {
  return supabase.auth.getSession()
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

// Profile functions
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: {
  full_name?: string
  avatar_url?: string
}) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function uploadAvatar(userId: string, file: any) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      upsert: true,
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  return data.publicUrl
}