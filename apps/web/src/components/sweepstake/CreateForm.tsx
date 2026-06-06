'use client'

import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField, SelectField, TextareaField, CheckboxField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const createSweepstakeSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  tournament: z.string()
    .min(1, 'Please select a tournament'),
  maxParticipants: z.number()
    .min(4, 'Minimum 4 participants required')
    .max(100, 'Maximum 100 participants allowed'),
  entryFee: z.number()
    .min(0, 'Entry fee cannot be negative')
    .max(1000, 'Entry fee cannot exceed $1000'),
  isPrivate: z.boolean().default(false),
  allowLateJoining: z.boolean().default(true),
  autoAssignTeams: z.boolean().default(true),
})

type CreateSweepstakeForm = z.infer<typeof createSweepstakeSchema>

const TOURNAMENT_OPTIONS = [
  { value: '', label: 'Select a tournament', disabled: true },
  { value: 'world-cup-2026', label: '2026 FIFA World Cup' },
  { value: 'euro-2024', label: 'UEFA Euro 2024' },
  { value: 'copa-america-2024', label: 'Copa América 2024' },
  { value: 'premier-league-2024', label: 'Premier League 2024/25' },
  { value: 'champions-league-2024', label: 'UEFA Champions League 2024/25' },
]

const MAX_PARTICIPANTS_OPTIONS = [
  { value: '', label: 'Select max participants', disabled: true },
  { value: '8', label: '8 participants' },
  { value: '16', label: '16 participants' },
  { value: '24', label: '24 participants' },
  { value: '32', label: '32 participants' },
  { value: '48', label: '48 participants' },
  { value: '64', label: '64 participants' },
  { value: '100', label: '100 participants' },
]

interface CreateFormProps {
  onSubmit?: (data: CreateSweepstakeForm) => Promise<void>
  loading?: boolean
}

export function CreateForm({ onSubmit, loading = false }: CreateFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, touchedFields },
  } = useForm<CreateSweepstakeForm>({
    resolver: zodResolver(createSweepstakeSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      tournament: '',
      maxParticipants: 16,
      entryFee: 0,
      isPrivate: false,
      allowLateJoining: true,
      autoAssignTeams: true,
    }
  })

  const watchedValues = watch()

  const handleFormSubmit = useCallback(async (data: CreateSweepstakeForm) => {
    setIsSubmitting(true)
    try {
      await onSubmit?.(data)
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit])

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedFromStep1 = watchedValues.name && 
    watchedValues.name.length >= 3 && 
    watchedValues.tournament &&
    !errors.name

  const canProceedFromStep2 = watchedValues.maxParticipants && 
    watchedValues.entryFee >= 0 &&
    !errors.maxParticipants &&
    !errors.entryFee

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium border-2",
                step === currentStep
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : step < currentStep
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-slate-800 border-slate-600 text-slate-400"
              )}
            >
              {step < currentStep ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Basic Info</span>
          <span>Settings</span>
          <span>Review</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-6 bg-slate-900 border-slate-700">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-100 mb-2">Basic Information</h2>
                <p className="text-slate-400 text-sm">Give your sweepstake a name and choose the tournament</p>
              </div>

              <FormField
                label="Sweepstake Name"
                placeholder="e.g., World Cup Office Pool 2026"
                required
                icon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 011-1.732V6a1 1 0 012 0v2.268A2 2 0 1110 10H6z" clipRule="evenodd" />
                  </svg>
                }
                {...register('name')}
                error={errors.name?.message}
                description="Choose a memorable name for your sweepstake"
              />

              <SelectField
                label="Tournament"
                required
                icon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                options={TOURNAMENT_OPTIONS}
                {...register('tournament')}
                error={errors.tournament?.message}
                description="Select which tournament this sweepstake is for"
              />

              <TextareaField
                label="Description"
                placeholder="Add details about your sweepstake rules, prizes, or anything participants should know..."
                rows={4}
                icon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                }
                {...register('description')}
                error={errors.description?.message}
                description="Optional description (max 500 characters)"
              />

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedFromStep1}
                  className="min-w-[120px]"
                >
                  Next Step
                  <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-100 mb-2">Sweepstake Settings</h2>
                <p className="text-slate-400 text-sm">Configure participant limits and entry requirements</p>
              </div>

              <SelectField
                label="Maximum Participants"
                required
                icon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                }
                options={MAX_PARTICIPANTS_OPTIONS}
                {...register('maxParticipants', { 
                  setValueAs: (value) => value ? parseInt(value, 10) : 16 
                })}
                error={errors.maxParticipants?.message}
                description="Maximum number of people who can join"
              />

              <FormField
                label="Entry Fee"
                type="number"
                placeholder="0.00"
                min="0"
                max="1000"
                step="0.01"
                icon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                }
                {...register('entryFee', { 
                  setValueAs: (value) => value ? parseFloat(value) : 0 
                })}
                error={errors.entryFee?.message}
                description="Cost for each participant to join (set to 0 for free)"
              />

              <div className="space-y-4 border border-slate-700 rounded-lg p-4 bg-slate-800">
                <h3 className="text-sm font-medium text-slate-200">Advanced Options</h3>
                
                <CheckboxField
                  label="Private Sweepstake"
                  description="Only people with the invite link can join"
                  {...register('isPrivate')}
                />

                <CheckboxField
                  label="Allow Late Joining"
                  description="Participants can join after the tournament starts (until team assignment)"
                  {...register('allowLateJoining')}
                />

                <CheckboxField
                  label="Auto-assign Teams"
                  description="Automatically assign teams when sweepstake reaches capacity or starts"
                  {...register('autoAssignTeams')}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="min-w-[120px]"
                >
                  <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedFromStep2}
                  className="min-w-[120px]"
                >
                  Review
                  <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-100 mb-2">Review & Create</h2>
                <p className="text-slate-400 text-sm">Review your sweepstake details before creating</p>
              </div>

              <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-1">Name</h3>
                    <p className="text-slate-100">{watchedValues.name || 'Untitled Sweepstake'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-1">Tournament</h3>
                    <p className="text-slate-100">
                      {TOURNAMENT_OPTIONS.find(t => t.value === watchedValues.tournament)?.label || 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-1">Max Participants</h3>
                    <p className="text-slate-100">{watchedValues.maxParticipants} people</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-1">Entry Fee</h3>
                    <p className="text-slate-100">
                      {watchedValues.entryFee === 0 ? 'Free' : `$${watchedValues.entryFee.toFixed(2)}`}
                    </p>
                  </div>
                </div>

                {watchedValues.description && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-1">Description</h3>
                    <p className="text-slate-100 text-sm">{watchedValues.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Settings</h3>
                  <div className="flex flex-wrap gap-2">
                    {watchedValues.isPrivate && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-900 text-blue-200 border border-blue-800">
                        Private
                      </span>
                    )}
                    {watchedValues.allowLateJoining && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-900 text-green-200 border border-green-800">
                        Late Joining Allowed
                      </span>
                    )}
                    {watchedValues.autoAssignTeams && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-900 text-purple-200 border border-purple-800">
                        Auto-assign Teams
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="min-w-[120px]"
                >
                  <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Previous
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid || loading || isSubmitting}
                  className="min-w-[140px]"
                >
                  {(loading || isSubmitting) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Sweepstake
                      <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Card>
    </div>
  )
}

export default CreateForm