/**
 * Shared validation utilities for Supabase Edge Functions
 * Provides common validation patterns and error handling
 */

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult<T = any> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
}

/**
 * Base validator class with common validation methods
 */
export class Validator {
  private errors: ValidationError[] = [];

  /**
   * Add a validation error
   */
  addError(field: string, message: string, code?: string): void {
    this.errors.push({ field, message, code });
  }

  /**
   * Check if validation has any errors
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Get all validation errors
   */
  getErrors(): ValidationError[] {
    return [...this.errors];
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Create validation result
   */
  getResult<T>(data?: T): ValidationResult<T> {
    return {
      isValid: !this.hasErrors(),
      data,
      errors: this.getErrors(),
    };
  }
}

/**
 * Validate UUID format
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate string length
 */
export function isValidLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

/**
 * Validate required string field
 */
export function isRequiredString(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate positive integer
 */
export function isPositiveInteger(value: any): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Validate non-negative integer
 */
export function isNonNegativeInteger(value: any): boolean {
  return Number.isInteger(value) && value >= 0;
}

/**
 * Validate date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime()) && dateObj > new Date();
}

/**
 * Validate sweepstake creation data
 */
export interface SweepstakeCreationData {
  name: string;
  description?: string;
  entry_fee: number;
  max_participants: number;
  tournament_id: string;
  start_date?: string;
}

export function validateSweepstakeCreation(data: any): ValidationResult<SweepstakeCreationData> {
  const validator = new Validator();

  // Validate name
  if (!isRequiredString(data.name)) {
    validator.addError('name', 'Name is required and must be a non-empty string', 'REQUIRED');
  } else if (!isValidLength(data.name.trim(), 1, 100)) {
    validator.addError('name', 'Name must be between 1 and 100 characters', 'LENGTH');
  }

  // Validate description (optional)
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      validator.addError('description', 'Description must be a string', 'TYPE');
    } else if (data.description.length > 500) {
      validator.addError('description', 'Description must not exceed 500 characters', 'LENGTH');
    }
  }

  // Validate entry fee
  if (!isNonNegativeInteger(data.entry_fee)) {
    validator.addError('entry_fee', 'Entry fee must be a non-negative integer', 'TYPE');
  }

  // Validate max participants
  if (!isPositiveInteger(data.max_participants)) {
    validator.addError('max_participants', 'Max participants must be a positive integer', 'TYPE');
  } else if (data.max_participants > 1000) {
    validator.addError('max_participants', 'Max participants cannot exceed 1000', 'MAX_VALUE');
  }

  // Validate tournament_id
  if (!isRequiredString(data.tournament_id)) {
    validator.addError('tournament_id', 'Tournament ID is required', 'REQUIRED');
  } else if (!isValidUUID(data.tournament_id)) {
    validator.addError('tournament_id', 'Tournament ID must be a valid UUID', 'FORMAT');
  }

  // Validate start_date (optional)
  if (data.start_date !== undefined && data.start_date !== null) {
    if (!isFutureDate(data.start_date)) {
      validator.addError('start_date', 'Start date must be in the future', 'FUTURE_DATE');
    }
  }

  return validator.getResult(data);
}

/**
 * Validate sweepstake join data
 */
export interface SweepstakeJoinData {
  sweepstake_id: string;
  user_id: string;
}

export function validateSweepstakeJoin(data: any): ValidationResult<SweepstakeJoinData> {
  const validator = new Validator();

  // Validate sweepstake_id
  if (!isRequiredString(data.sweepstake_id)) {
    validator.addError('sweepstake_id', 'Sweepstake ID is required', 'REQUIRED');
  } else if (!isValidUUID(data.sweepstake_id)) {
    validator.addError('sweepstake_id', 'Sweepstake ID must be a valid UUID', 'FORMAT');
  }

  // Validate user_id
  if (!isRequiredString(data.user_id)) {
    validator.addError('user_id', 'User ID is required', 'REQUIRED');
  } else if (!isValidUUID(data.user_id)) {
    validator.addError('user_id', 'User ID must be a valid UUID', 'FORMAT');
  }

  return validator.getResult(data);
}

/**
 * Validate team assignment data
 */
export interface TeamAssignmentData {
  sweepstake_id: string;
  algorithm?: 'random' | 'balanced';
  force_reassign?: boolean;
}

export function validateTeamAssignment(data: any): ValidationResult<TeamAssignmentData> {
  const validator = new Validator();

  // Validate sweepstake_id
  if (!isRequiredString(data.sweepstake_id)) {
    validator.addError('sweepstake_id', 'Sweepstake ID is required', 'REQUIRED');
  } else if (!isValidUUID(data.sweepstake_id)) {
    validator.addError('sweepstake_id', 'Sweepstake ID must be a valid UUID', 'FORMAT');
  }

  // Validate algorithm (optional)
  if (data.algorithm !== undefined) {
    if (!['random', 'balanced'].includes(data.algorithm)) {
      validator.addError('algorithm', 'Algorithm must be either "random" or "balanced"', 'ENUM');
    }
  }

  // Validate force_reassign (optional)
  if (data.force_reassign !== undefined && typeof data.force_reassign !== 'boolean') {
    validator.addError('force_reassign', 'Force reassign must be a boolean', 'TYPE');
  }

  return validator.getResult({
    sweepstake_id: data.sweepstake_id,
    algorithm: data.algorithm || 'random',
    force_reassign: data.force_reassign || false,
  });
}

/**
 * Validate sweepstake update data
 */
export interface SweepstakeUpdateData {
  name?: string;
  description?: string;
  entry_fee?: number;
  max_participants?: number;
  start_date?: string;
  status?: 'draft' | 'open' | 'active' | 'completed';
}

export function validateSweepstakeUpdate(data: any): ValidationResult<SweepstakeUpdateData> {
  const validator = new Validator();

  // Validate name (optional)
  if (data.name !== undefined) {
    if (!isRequiredString(data.name)) {
      validator.addError('name', 'Name must be a non-empty string', 'REQUIRED');
    } else if (!isValidLength(data.name.trim(), 1, 100)) {
      validator.addError('name', 'Name must be between 1 and 100 characters', 'LENGTH');
    }
  }

  // Validate description (optional)
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      validator.addError('description', 'Description must be a string', 'TYPE');
    } else if (data.description.length > 500) {
      validator.addError('description', 'Description must not exceed 500 characters', 'LENGTH');
    }
  }

  // Validate entry fee (optional)
  if (data.entry_fee !== undefined && !isNonNegativeInteger(data.entry_fee)) {
    validator.addError('entry_fee', 'Entry fee must be a non-negative integer', 'TYPE');
  }

  // Validate max participants (optional)
  if (data.max_participants !== undefined) {
    if (!isPositiveInteger(data.max_participants)) {
      validator.addError('max_participants', 'Max participants must be a positive integer', 'TYPE');
    } else if (data.max_participants > 1000) {
      validator.addError('max_participants', 'Max participants cannot exceed 1000', 'MAX_VALUE');
    }
  }

  // Validate start_date (optional)
  if (data.start_date !== undefined && data.start_date !== null) {
    if (!isFutureDate(data.start_date)) {
      validator.addError('start_date', 'Start date must be in the future', 'FUTURE_DATE');
    }
  }

  // Validate status (optional)
  if (data.status !== undefined) {
    const validStatuses = ['draft', 'open', 'active', 'completed'];
    if (!validStatuses.includes(data.status)) {
      validator.addError('status', `Status must be one of: ${validStatuses.join(', ')}`, 'ENUM');
    }
  }

  return validator.getResult(data);
}

/**
 * Validate participant removal data
 */
export interface ParticipantRemovalData {
  sweepstake_id: string;
  participant_id: string;
  reason?: string;
}

export function validateParticipantRemoval(data: any): ValidationResult<ParticipantRemovalData> {
  const validator = new Validator();

  // Validate sweepstake_id
  if (!isRequiredString(data.sweepstake_id)) {
    validator.addError('sweepstake_id', 'Sweepstake ID is required', 'REQUIRED');
  } else if (!isValidUUID(data.sweepstake_id)) {
    validator.addError('sweepstake_id', 'Sweepstake ID must be a valid UUID', 'FORMAT');
  }

  // Validate participant_id
  if (!isRequiredString(data.participant_id)) {
    validator.addError('participant_id', 'Participant ID is required', 'REQUIRED');
  } else if (!isValidUUID(data.participant_id)) {
    validator.addError('participant_id', 'Participant ID must be a valid UUID', 'FORMAT');
  }

  // Validate reason (optional)
  if (data.reason !== undefined && data.reason !== null) {
    if (typeof data.reason !== 'string') {
      validator.addError('reason', 'Reason must be a string', 'TYPE');
    } else if (data.reason.length > 200) {
      validator.addError('reason', 'Reason must not exceed 200 characters', 'LENGTH');
    }
  }

  return validator.getResult(data);
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  message: string,
  errors: ValidationError[] = [],
  status: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details: errors,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    }
  );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    }
  );
}

/**
 * Extract and validate authorization header
 */
export function extractAuthHeader(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Validate request content type
 */
export function validateContentType(request: Request): boolean {
  const contentType = request.headers.get('content-type');
  return contentType?.includes('application/json') ?? false;
}

/**
 * Parse and validate JSON body
 */
export async function parseJsonBody<T = any>(request: Request): Promise<T | null> {
  try {
    if (!validateContentType(request)) {
      return null;
    }
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Rate limiting validator
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private requests = new Map<string, number[]>();

  constructor(private config: RateLimitConfig) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Get existing requests for this identifier
    const userRequests = this.requests.get(identifier) || [];
    
    // Filter out old requests
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    // Check if under limit
    if (recentRequests.length >= this.config.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.config.maxRequests - recentRequests.length);
  }

  getResetTime(identifier: string): number {
    const userRequests = this.requests.get(identifier) || [];
    if (userRequests.length === 0) {
      return Date.now();
    }
    
    const oldestRequest = Math.min(...userRequests);
    return oldestRequest + this.config.windowMs;
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potential XSS characters
    .substring(0, 1000); // Limit length
}

/**
 * Validate tournament exists and is active
 */
export async function validateTournamentExists(
  supabase: any,
  tournamentId: string
): Promise<{ isValid: boolean; tournament?: any; error?: string }> {
  try {
    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select('id, name, status, start_date, end_date')
      .eq('id', tournamentId)
      .single();

    if (error || !tournament) {
      return {
        isValid: false,
        error: 'Tournament not found',
      };
    }

    if (tournament.status !== 'active') {
      return {
        isValid: false,
        error: 'Tournament is not active',
      };
    }

    return {
      isValid: true,
      tournament,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate tournament',
    };
  }
}

/**
 * Validate user permissions for sweepstake
 */
export async function validateUserPermissions(
  supabase: any,
  userId: string,
  sweepstakeId: string,
  requiredRole: 'owner' | 'participant' = 'participant'
): Promise<{ isValid: boolean; error?: string; participant?: any }> {
  try {
    const { data: participant, error } = await supabase
      .from('sweepstake_participants')
      .select('id, user_id, role, joined_at')
      .eq('sweepstake_id', sweepstakeId)
      .eq('user_id', userId)
      .single();

    if (error || !participant) {
      return {
        isValid: false,
        error: 'User is not a participant in this sweepstake',
      };
    }

    if (requiredRole === 'owner' && participant.role !== 'owner') {
      return {
        isValid: false,
        error: 'User does not have owner permissions for this sweepstake',
      };
    }

    return {
      isValid: true,
      participant,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate user permissions',
    };
  }
}