import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface JoinSweepstakeResponse {
  success: boolean;
  participantId?: string;
  message?: string;
}

interface JoinSweepstakeError {
  message: string;
  code?: string;
}

export function useJoinSweepstake() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const joinSweepstake = async (sweepstakeId: string, inviteCode?: string): Promise<JoinSweepstakeResponse> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate various error conditions for testing
      if (sweepstakeId === 'full') {
        throw new Error('This sweepstake is full and no longer accepting participants');
      }
      
      if (sweepstakeId === 'closed') {
        throw new Error('This sweepstake has already started and is closed to new participants');
      }

      if (sweepstakeId === 'already_joined') {
        throw new Error('You have already joined this sweepstake');
      }

      if (sweepstakeId === 'payment_required') {
        throw new Error('Payment is required to join this sweepstake');
      }

      if (inviteCode === 'expired') {
        throw new Error('This invite code has expired');
      }

      // Simulate successful join
      const mockResponse: JoinSweepstakeResponse = {
        success: true,
        participantId: `participant_${Date.now()}`,
        message: 'Successfully joined sweepstake'
      };

      setSuccess(true);

      // Auto-redirect after success (optional)
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

      return mockResponse;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join sweepstake';
      setError(errorMessage);
      
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearSuccess = () => {
    setSuccess(false);
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    joinSweepstake,
    loading,
    error,
    success,
    clearError,
    clearSuccess,
    reset
  };
}

// Alternative hook for batch operations (joining multiple sweepstakes)
export function useBatchJoinSweepstakes() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successes, setSuccesses] = useState<string[]>([]);

  const joinMultipleSweepstakes = async (
    sweepstakes: Array<{ id: string; inviteCode?: string }>
  ) => {
    setLoading(true);
    setErrors({});
    setSuccesses([]);

    const results = await Promise.allSettled(
      sweepstakes.map(async ({ id, inviteCode }) => {
        // Simulate individual API calls
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        if (Math.random() > 0.7) {
          throw new Error(`Failed to join sweepstake ${id}`);
        }
        
        return { id, success: true };
      })
    );

    const newErrors: Record<string, string> = {};
    const newSuccesses: string[] = [];

    results.forEach((result, index) => {
      const sweepstakeId = sweepstakes[index].id;
      
      if (result.status === 'fulfilled') {
        newSuccesses.push(sweepstakeId);
      } else {
        newErrors[sweepstakeId] = result.reason?.message || 'Unknown error';
      }
    });

    setErrors(newErrors);
    setSuccesses(newSuccesses);
    setLoading(false);

    return {
      successes: newSuccesses,
      errors: newErrors,
      totalAttempted: sweepstakes.length
    };
  };

  return {
    joinMultipleSweepstakes,
    loading,
    errors,
    successes,
    reset: () => {
      setLoading(false);
      setErrors({});
      setSuccesses([]);
    }
  };
}

// Hook for checking join eligibility without actually joining
export function useCheckJoinEligibility() {
  const [loading, setLoading] = useState(false);
  const [eligibility, setEligibility] = useState<{
    canJoin: boolean;
    reason?: string;
    requirements?: string[];
  } | null>(null);

  const checkEligibility = async (sweepstakeId: string, userId?: string) => {
    setLoading(true);
    
    try {
      // Simulate API call to check eligibility
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulate various eligibility scenarios
      const scenarios = [
        { canJoin: true },
        { 
          canJoin: false, 
          reason: 'Sweepstake is full',
          requirements: ['Wait for someone to leave', 'Check for similar sweepstakes']
        },
        { 
          canJoin: false, 
          reason: 'Already a participant',
          requirements: ['You can only join each sweepstake once']
        },
        { 
          canJoin: false, 
          reason: 'Minimum age requirement not met',
          requirements: ['Must be 18 or older to participate']
        },
        { 
          canJoin: true,
          requirements: ['Payment of entry fee required', 'Accept terms and conditions']
        }
      ];
      
      const result = scenarios[Math.floor(Math.random() * scenarios.length)];
      setEligibility(result);
      
      return result;
      
    } catch (err) {
      const errorResult = {
        canJoin: false,
        reason: 'Unable to check eligibility at this time'
      };
      setEligibility(errorResult);
      return errorResult;
      
    } finally {
      setLoading(false);
    }
  };

  return {
    checkEligibility,
    loading,
    eligibility,
    clearEligibility: () => setEligibility(null)
  };
}