import { describe, it, expect } from 'vitest';
import {
  userSchema,
  updateProfileSchema,
  signUpSchema,
  signInSchema,
  createSweepstakeSchema,
  joinSweepstakeSchema,
  matchSchema,
  safeValidate,
  formatZodError,
} from '../src/schemas';
import { TournamentStatus, SweepstakeStatus, MatchStatus } from '../src/types';

describe('User Schemas', () => {
  it('should validate user schema correctly', () => {
    const validUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      display_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      created_at: '2024-03-15T14:30:00.000Z',
      updated_at: '2024-03-15T14:30:00.000Z',
    };

    const result = userSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('should reject invalid user data', () => {
    const invalidUser = {
      id: 'not-a-uuid',
      email: 'invalid-email',
      display_name: '',
    };

    const result = userSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it('should validate profile update schema', () => {
    const validUpdate = {
      display_name: 'Updated Name',
      avatar_url: 'https://example.com/new-avatar.jpg',
    };

    const result = updateProfileSchema.safeParse(validUpdate);
    expect(result.success).toBe(true);
  });

  it('should reject invalid display name', () => {
    const invalidUpdate = {
      display_name: 'x', // Too short
      avatar_url: 'not-a-url',
    };

    const result = updateProfileSchema.safeParse(invalidUpdate);
    expect(result.success).toBe(false);
  });
});

describe('Auth Schemas', () => {
  it('should validate sign up schema correctly', () => {
    const validSignUp = {
      email: 'test@example.com',
      password: 'SecurePass123',
      display_name: 'Test User',
    };

    const result = signUpSchema.safeParse(validSignUp);
    expect(result.success).toBe(true);
  });

  it('should reject weak password', () => {
    const weakPassword = {
      email: 'test@example.com',
      password: 'weak',
      display_name: 'Test User',
    };

    const result = signUpSchema.safeParse(weakPassword);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(issue => 
        issue.path.includes('password')
      )).toBe(true);
    }
  });

  it('should validate sign in schema', () => {
    const validSignIn = {
      email: 'test@example.com',
      password: 'anypassword',
    };

    const result = signInSchema.safeParse(validSignIn);
    expect(result.success).toBe(true);
  });
});

describe('Sweepstake Schemas', () => {
  it('should validate create sweepstake schema', () => {
    const validSweepstake = {
      name: 'Test Sweepstake',
      description: 'A test sweepstake',
      tournament_id: '123e4567-e89b-12d3-a456-426614174000',
      max_participants: 32,
      entry_fee: 10,
      is_public: true,
      draw_date: '2024-12-31T12:00:00.000Z',
    };

    const result = createSweepstakeSchema.safeParse(validSweepstake);
    expect(result.success).toBe(true);
  });

  it('should reject sweepstake with too few participants', () => {
    const invalidSweepstake = {
      name: 'Test Sweepstake',
      tournament_id: '123e4567-e89b-12d3-a456-426614174000',
      max_participants: 1, // Too few
      is_public: true,
    };

    const result = createSweepstakeSchema.safeParse(invalidSweepstake);
    expect(result.success).toBe(false);
  });

  it('should validate join sweepstake schema', () => {
    const validJoin = {
      invite_code: 'ABCD1234',
      display_name: 'Player Name',
    };

    const result = joinSweepstakeSchema.safeParse(validJoin);
    expect(result.success).toBe(true);
  });

  it('should reject invalid invite code', () => {
    const invalidJoin = {
      invite_code: 'invalid',
    };

    const result = joinSweepstakeSchema.safeParse(invalidJoin);
    expect(result.success).toBe(false);
  });
});

describe('Match Schema', () => {
  it('should validate match schema correctly', () => {
    const validMatch = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      tournament_id: '123e4567-e89b-12d3-a456-426614174000',
      home_team_id: '123e4567-e89b-12d3-a456-426614174000',
      away_team_id: '123e4567-e89b-12d3-a456-426614174001',
      scheduled_at: '2024-03-15T14:30:00.000Z',
      status: MatchStatus.SCHEDULED,
      home_score: 2,
      away_score: 1,
      round: 'Group A',
      group_name: 'A',
      completed_at: '2024-03-15T16:30:00.000Z',
    };

    const result = matchSchema.safeParse(validMatch);
    expect(result.success).toBe(true);
  });

  it('should reject negative scores', () => {
    const invalidMatch = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      tournament_id: '123e4567-e89b-12d3-a456-426614174000',
      home_team_id: '123e4567-e89b-12d3-a456-426614174000',
      away_team_id: '123e4567-e89b-12d3-a456-426614174001',
      scheduled_at: '2024-03-15T14:30:00.000Z',
      status: MatchStatus.COMPLETED,
      home_score: -1,
      away_score: 2,
      round: 'Group A',
    };

    const result = matchSchema.safeParse(invalidMatch);
    expect(result.success).toBe(false);
  });
});

describe('Validation Helpers', () => {
  it('should format Zod errors correctly', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'weak',
    };

    const result = signUpSchema.safeParse(invalidData);
    if (!result.success) {
      const formattedErrors = formatZodError(result.error);
      expect(formattedErrors.email).toBeDefined();
      expect(formattedErrors.password).toBeDefined();
      expect(Array.isArray(formattedErrors.email)).toBe(true);
    }
  });

  it('should safely validate data', () => {
    const validData = {
      display_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
    };

    const result = safeValidate(updateProfileSchema, validData);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validData);
  });

  it('should return errors for invalid data', () => {
    const invalidData = {
      display_name: 'x',
      avatar_url: 'not-a-url',
    };

    const result = safeValidate(updateProfileSchema, invalidData);
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });
});