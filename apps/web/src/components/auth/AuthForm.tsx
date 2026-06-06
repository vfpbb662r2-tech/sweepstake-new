'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userCreateSchema, userLoginSchema } from '@sweepstake/shared'
import type { UserCreate, UserLogin } from '@sweepstake/shared'

interface AuthFormProps {
  type: 'login' | 'signup'
  onSubmit: (data: UserCreate | UserLogin) => Promise<void>
  isLoading?: boolean
  error?: string
}

export function AuthForm({ type, onSubmit, isLoading = false, error }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  
  const schema = type === 'signup' ? userCreateSchema : userLoginSchema
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  const onSubmitForm = async (data: any) => {
    await onSubmit(data)
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmitForm)}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {type === 'signup' && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              {...register('fullName')}
              type="text"
              autoComplete="name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete={type === 'signup' ? 'new-password' : 'current-password'}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              <span className="text-sm text-gray-500">
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            type === 'signup' ? 'Create account' : 'Sign in'
          )}
        </button>
      </div>
    </form>
  )
}