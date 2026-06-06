import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function for merging Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate random sweepstake join code
export function generateSweepstakeCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Format date utilities
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// Relative time formatting
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return formatDate(date);
  }
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generate avatar URL from name
export function generateAvatarUrl(name: string): string {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random`;
}

// Shuffle array (Fisher-Yates algorithm)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Calculate team points based on tournament rules
export function calculateTeamPoints(
  wins: number,
  draws: number,
  losses: number
): number {
  return wins * 3 + draws * 1 + losses * 0;
}

// Sort teams for group standings
export function sortTeamsByStanding(teams: any[]): any[] {
  return teams.sort((a, b) => {
    // First by points
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    
    // Then by goal difference
    if (a.goalDifference !== b.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    
    // Then by goals scored
    if (a.goalsFor !== b.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }
    
    // Finally alphabetically by team name
    return a.team.name.localeCompare(b.team.name);
  });
}

// Format score display
export function formatScore(homeScore?: number, awayScore?: number): string {
  if (homeScore !== undefined && awayScore !== undefined) {
    return `${homeScore} - ${awayScore}`;
  }
  return 'vs';
}

// Get match stage display name
export function getMatchStageDisplayName(stage: string): string {
  const stageNames: Record<string, string> = {
    'GROUP_STAGE': 'Group Stage',
    'ROUND_OF_16': 'Round of 16',
    'QUARTER_FINAL': 'Quarter Final',
    'SEMI_FINAL': 'Semi Final',
    'THIRD_PLACE': '3rd Place Play-off',
    'FINAL': 'Final',
  };
  
  return stageNames[stage] || stage;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

// Check if date is today
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Check if date is tomorrow
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

// Format currency (for future prize pools)
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Sleep utility for async operations
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Safe JSON parse
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// Storage utilities for cross-platform use
export const storage = {
  get: async (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined') {
      // Web environment
      return localStorage.getItem(key);
    }
    // Mobile environment - will be implemented by platform-specific code
    return null;
  },
  
  set: async (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined') {
      // Web environment
      localStorage.setItem(key, value);
    }
    // Mobile environment - will be implemented by platform-specific code
  },
  
  remove: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined') {
      // Web environment
      localStorage.removeItem(key);
    }
    // Mobile environment - will be implemented by platform-specific code
  },
};

// Constants
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sweepstake_auth_token',
  USER_DATA: 'sweepstake_user_data',
  THEME: 'sweepstake_theme',
  ONBOARDING_COMPLETED: 'sweepstake_onboarding_completed',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  SWEEPSTAKES: {
    CREATE: '/sweepstakes',
    JOIN: '/sweepstakes/join',
    LEAVE: '/sweepstakes/:id/leave',
    DRAW: '/sweepstakes/:id/draw',
    LIST: '/sweepstakes',
    DETAIL: '/sweepstakes/:id',
  },
  TEAMS: {
    LIST: '/teams',
    DETAIL: '/teams/:id',
  },
  MATCHES: {
    LIST: '/matches',
    DETAIL: '/matches/:id',
    UPDATE_SCORE: '/matches/:id/score',
  },
} as const;