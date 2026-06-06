import { SWEEPSTAKE_LIMITS } from '../constants';

/**
 * Generates a random join code for sweepstakes
 */
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789'; // Excludes O, 0, 1, I for clarity
  let result = '';
  
  for (let i = 0; i < SWEEPSTAKE_LIMITS.JOIN_CODE_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Generates a random UUID (v4)
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a slug from a string (URL-friendly)
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generates a random color hex code
 */
export function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#8395A7', '#222F3E', '#EE5A6F', '#0ABDE3', '#10AC84',
    '#F79F1F', '#A3CB38', '#FDA7DF', '#D63031', '#74B9FF'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Generates initials from a name
 */
export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Generates a random avatar URL using a service like DiceBear
 */
export function generateAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

/**
 * Generates a random password with specified criteria
 */
export function generatePassword(length = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  // Ensure at least one character from each category
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Generates a random integer between min and max (inclusive)
 */
export function generateRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max
 */
export function generateRandomFloat(min: number, max: number, decimals = 2): number {
  const random = Math.random() * (max - min) + min;
  return parseFloat(random.toFixed(decimals));
}

/**
 * Generates a random boolean
 */
export function generateRandomBoolean(): boolean {
  return Math.random() < 0.5;
}

/**
 * Generates a random date within a range
 */
export function generateRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generates a random element from an array
 */
export function generateRandomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generates multiple random elements from an array (without duplicates)
 */
export function generateRandomChoices<T>(array: T[], count: number): T[] {
  if (count >= array.length) return [...array];
  
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Generates a random team allocation for sweepstakes
 */
export function generateRandomTeamAllocation<T>(teams: T[], participants: string[]): Map<string, T> {
  if (teams.length < participants.length) {
    throw new Error('Not enough teams for all participants');
  }
  
  const shuffledTeams = generateRandomChoices(teams, participants.length);
  const allocation = new Map<string, T>();
  
  participants.forEach((participantId, index) => {
    allocation.set(participantId, shuffledTeams[index]);
  });
  
  return allocation;
}

/**
 * Generates a secure random token
 */
export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues if available (browser/Node.js with crypto)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
}

/**
 * Generates a timestamp-based ID
 */
export function generateTimestampId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${randomPart}`;
}