import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
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
    control,
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
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.fieldError}>{errors.email.message}</Text>
        )}
      </View>

      {type === 'signup' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                autoCorrect={false}
              />
            )}
          />
          {errors.fullName && (
            <Text style={styles.fieldError}>{errors.fullName.message}</Text>
          )}
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.passwordInput,
                  errors.password && styles.inputError,
                ]}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.passwordToggleText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={styles.fieldError}>{errors.password.message}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          (!isValid || isLoading) && styles.buttonDisabled,
        ]}
        onPress={handleSubmit(onSubmitForm)}
        disabled={!isValid || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>
            {type === 'signup' ? 'Create Account' : 'Sign In'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordToggle: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  passwordToggleText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  fieldError: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
})