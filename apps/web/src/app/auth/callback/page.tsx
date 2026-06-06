'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/auth'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from URL parameters
        const code = searchParams.get('code')
        const error_code = searchParams.get('error')
        const error_description = searchParams.get('error_description')

        // Handle OAuth errors
        if (error_code) {
          console.error('OAuth error:', error_code, error_description)
          setError(error_description || 'Authentication failed')
          setLoading(false)
          return
        }

        if (!code) {
          setError('No authorization code received')
          setLoading(false)
          return
        }

        // Exchange the code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('Code exchange error:', exchangeError)
          setError(exchangeError.message)
          setLoading(false)
          return
        }

        if (!data.session) {
          setError('No session created')
          setLoading(false)
          return
        }

        // Check if user profile exists, create if not
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // User profile doesn't exist, create it
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email!,
              avatar_url: data.user.user_metadata?.avatar_url,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (createError) {
            console.error('Failed to create user profile:', createError)
          }
        }

        // Get redirect URL from state or default to dashboard
        const redirectTo = searchParams.get('redirectTo') || '/dashboard'
        
        // Successful authentication
        router.push(redirectTo)
        
      } catch (err) {
        console.error('Callback handling error:', err)
        setError('An unexpected error occurred during authentication')
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            Completing sign in...
          </h2>
          <p className="mt-2 text-gray-600">
            Please wait while we complete your authentication.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="block w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}