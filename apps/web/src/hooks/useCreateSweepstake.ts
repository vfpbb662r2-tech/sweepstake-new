import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createSweepstakeApi, getTournamentsApi } from '@/lib/api/sweepstakes';
import type { Tournament, CreateSweepstakeData } from '@/types/sweepstake';

export interface CreateSweepstakeFormData {
  name: string;
  description: string;
  tournamentId: string;
  maxParticipants: number;
  isPublic: boolean;
  entryFee?: number;
  prizeStructure?: {
    first: number;
    second: number;
    third: number;
  };
}

export interface ValidationErrors {
  name?: string;
  description?: string;
  tournamentId?: string;
  maxParticipants?: string;
  entryFee?: string;
  prizeStructure?: {
    first?: string;
    second?: string;
    third?: string;
  };
}

interface UseCreateSweepstakeReturn {
  // Form state
  formData: CreateSweepstakeFormData;
  setFormData: (data: Partial<CreateSweepstakeFormData>) => void;
  
  // Validation
  errors: ValidationErrors;
  isValid: boolean;
  validateField: (field: keyof CreateSweepstakeFormData, value: any) => string | undefined;
  validateForm: () => boolean;
  
  // Tournaments
  tournaments: Tournament[];
  tournamentsLoading: boolean;
  tournamentsError: string | null;
  
  // Create mutation
  createSweepstake: (data: CreateSweepstakeFormData) => Promise<void>;
  isCreating: boolean;
  createError: string | null;
  
  // Progress
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isStepValid: (step: number) => boolean;
}

const initialFormData: CreateSweepstakeFormData = {
  name: '',
  description: '',
  tournamentId: '',
  maxParticipants: 32,
  isPublic: true,
  entryFee: undefined,
  prizeStructure: undefined,
};

export const useCreateSweepstake = (): UseCreateSweepstakeReturn => {
  const router = useRouter();
  const [formData, setFormDataState] = useState<CreateSweepstakeFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [currentStep, setCurrentStep] = useState(0);

  // Fetch tournaments
  const {
    data: tournaments = [],
    isLoading: tournamentsLoading,
    error: tournamentsQueryError,
  } = useQuery({
    queryKey: ['tournaments'],
    queryFn: getTournamentsApi,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const tournamentsError = tournamentsQueryError ? 
    'Failed to load tournaments. Please try again.' : null;

  // Create sweepstake mutation
  const createMutation = useMutation({
    mutationFn: createSweepstakeApi,
    onSuccess: (sweepstake) => {
      router.push(`/sweepstakes/${sweepstake.id}`);
    },
  });

  const setFormData = (data: Partial<CreateSweepstakeFormData>) => {
    setFormDataState(prev => ({ ...prev, ...data }));
    
    // Clear errors for updated fields
    const updatedErrors = { ...errors };
    Object.keys(data).forEach(key => {
      delete updatedErrors[key as keyof ValidationErrors];
    });
    setErrors(updatedErrors);
  };

  const validateField = (field: keyof CreateSweepstakeFormData, value: any): string | undefined => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length === 0) {
          return 'Sweepstake name is required';
        }
        if (value.trim().length < 3) {
          return 'Sweepstake name must be at least 3 characters';
        }
        if (value.trim().length > 100) {
          return 'Sweepstake name must be less than 100 characters';
        }
        break;

      case 'description':
        if (!value || value.trim().length === 0) {
          return 'Description is required';
        }
        if (value.trim().length < 10) {
          return 'Description must be at least 10 characters';
        }
        if (value.trim().length > 500) {
          return 'Description must be less than 500 characters';
        }
        break;

      case 'tournamentId':
        if (!value || value.trim().length === 0) {
          return 'Please select a tournament';
        }
        if (!tournaments.find(t => t.id === value)) {
          return 'Please select a valid tournament';
        }
        break;

      case 'maxParticipants':
        if (!value || value < 2) {
          return 'At least 2 participants required';
        }
        if (value > 1000) {
          return 'Maximum 1000 participants allowed';
        }
        break;

      case 'entryFee':
        if (value !== undefined && value !== null) {
          if (value < 0) {
            return 'Entry fee cannot be negative';
          }
          if (value > 10000) {
            return 'Entry fee cannot exceed $10,000';
          }
        }
        break;

      default:
        break;
    }

    return undefined;
  };

  const validatePrizeStructure = (prizeStructure: CreateSweepstakeFormData['prizeStructure']): ValidationErrors['prizeStructure'] => {
    if (!prizeStructure) return undefined;

    const errors: NonNullable<ValidationErrors['prizeStructure']> = {};

    if (prizeStructure.first !== undefined) {
      if (prizeStructure.first < 0 || prizeStructure.first > 100) {
        errors.first = 'First place must be between 0-100%';
      }
    }

    if (prizeStructure.second !== undefined) {
      if (prizeStructure.second < 0 || prizeStructure.second > 100) {
        errors.second = 'Second place must be between 0-100%';
      }
    }

    if (prizeStructure.third !== undefined) {
      if (prizeStructure.third < 0 || prizeStructure.third > 100) {
        errors.third = 'Third place must be between 0-100%';
      }
    }

    const total = (prizeStructure.first || 0) + (prizeStructure.second || 0) + (prizeStructure.third || 0);
    if (total > 100) {
      errors.first = 'Total prize distribution cannot exceed 100%';
    }

    return Object.keys(errors).length > 0 ? errors : undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate all fields
    Object.keys(formData).forEach(key => {
      const field = key as keyof CreateSweepstakeFormData;
      if (field === 'prizeStructure') {
        newErrors.prizeStructure = validatePrizeStructure(formData.prizeStructure);
      } else {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    // Additional validation for prize structure
    if (formData.entryFee && formData.entryFee > 0 && !formData.prizeStructure) {
      newErrors.prizeStructure = { first: 'Prize structure required when entry fee is set' };
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0 && 
           !newErrors.prizeStructure;
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Basic info
        return !validateField('name', formData.name) &&
               !validateField('description', formData.description) &&
               !validateField('tournamentId', formData.tournamentId);
      
      case 1: // Settings
        return !validateField('maxParticipants', formData.maxParticipants) &&
               !validateField('entryFee', formData.entryFee);
      
      case 2: // Prize structure (optional)
        return !validatePrizeStructure(formData.prizeStructure);
      
      default:
        return false;
    }
  };

  const isValid = isStepValid(0) && isStepValid(1) && isStepValid(2);

  const createSweepstake = async (data: CreateSweepstakeFormData): Promise<void> => {
    if (!validateForm()) {
      throw new Error('Please correct the form errors before submitting');
    }

    const createData: CreateSweepstakeData = {
      name: data.name.trim(),
      description: data.description.trim(),
      tournamentId: data.tournamentId,
      maxParticipants: data.maxParticipants,
      isPublic: data.isPublic,
      ...(data.entryFee && { entryFee: data.entryFee }),
      ...(data.prizeStructure && { prizeStructure: data.prizeStructure }),
    };

    await createMutation.mutateAsync(createData);
  };

  return {
    // Form state
    formData,
    setFormData,
    
    // Validation
    errors,
    isValid,
    validateField,
    validateForm,
    
    // Tournaments
    tournaments,
    tournamentsLoading,
    tournamentsError,
    
    // Create mutation
    createSweepstake,
    isCreating: createMutation.isPending,
    createError: createMutation.error?.message || null,
    
    // Progress
    currentStep,
    setCurrentStep,
    isStepValid,
  };
};