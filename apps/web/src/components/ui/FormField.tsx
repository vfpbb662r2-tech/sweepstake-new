'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  description?: string
  required?: boolean
  icon?: React.ReactNode
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, label, error, description, required, icon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
          {icon && <span className="text-slate-400">{icon}</span>}
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
        
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md",
              "text-slate-100 placeholder-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
              "transition-colors duration-200",
              error && "border-red-400 focus:ring-red-400",
              className
            )}
            {...props}
          />
        </div>
        
        {description && !error && (
          <p className="text-xs text-slate-400">{description}</p>
        )}
        
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = "FormField"

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  description?: string
  required?: boolean
  icon?: React.ReactNode
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className, label, error, description, required, icon, options, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
          {icon && <span className="text-slate-400">{icon}</span>}
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
        
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md",
              "text-slate-100",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
              "transition-colors duration-200",
              "appearance-none cursor-pointer",
              error && "border-red-400 focus:ring-red-400",
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
                className="bg-slate-800 text-slate-100"
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {description && !error && (
          <p className="text-xs text-slate-400">{description}</p>
        )}
        
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)

SelectField.displayName = "SelectField"

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  description?: string
  required?: boolean
  icon?: React.ReactNode
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ className, label, error, description, required, icon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
          {icon && <span className="text-slate-400">{icon}</span>}
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
        
        <div className="relative">
          <textarea
            ref={ref}
            className={cn(
              "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md",
              "text-slate-100 placeholder-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
              "transition-colors duration-200 resize-vertical",
              error && "border-red-400 focus:ring-red-400",
              className
            )}
            {...props}
          />
        </div>
        
        {description && !error && (
          <p className="text-xs text-slate-400">{description}</p>
        )}
        
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)

TextareaField.displayName = "TextareaField"

export interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <div className="flex items-start space-x-3">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            "h-4 w-4 mt-0.5 rounded border border-slate-700 bg-slate-800",
            "text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0",
            "transition-colors duration-200",
            className
          )}
          {...props}
        />
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-200 cursor-pointer">
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
      </div>
    )
  }
)

CheckboxField.displayName = "CheckboxField"