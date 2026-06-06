/**
 * Formats currency amounts with proper locale-specific formatting
 */
export function formatCurrency(amount: number, currency = 'GBP', locale = 'en-GB'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

/**
 * Formats numbers with locale-specific thousands separators
 */
export function formatNumber(num: number, locale = 'en-GB'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Formats dates in a user-friendly format
 */
export function formatDate(date: Date | string, locale = 'en-GB'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats datetime in a user-friendly format
 */
export function formatDateTime(date: Date | string, locale = 'en-GB'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats time only
 */
export function formatTime(date: Date | string, locale = 'en-GB'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date | string, locale = 'en-GB'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const intervals = [
    { unit: 'year' as const, seconds: 31536000 },
    { unit: 'month' as const, seconds: 2592000 },
    { unit: 'week' as const, seconds: 604800 },
    { unit: 'day' as const, seconds: 86400 },
    { unit: 'hour' as const, seconds: 3600 },
    { unit: 'minute' as const, seconds: 60 },
  ];
  
  for (const { unit, seconds } of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / seconds);
    if (count >= 1) {
      return rtf.format(diffInSeconds < 0 ? -count : count, unit);
    }
  }
  
  return rtf.format(0, 'second');
}

/**
 * Formats match score display
 */
export function formatScore(homeScore: number | null, awayScore: number | null): string {
  if (homeScore === null || awayScore === null) {
    return '-';
  }
  return `${homeScore} - ${awayScore}`;
}

/**
 * Formats percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(2)} ${sizes[i]}`;
}

/**
 * Truncates text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}

/**
 * Capitalizes first letter of each word
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

/**
 * Converts camelCase to readable format
 */
export function camelCaseToReadable(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

/**
 * Formats tournament stage for display
 */
export function formatTournamentStage(stage: string): string {
  const stageMap: Record<string, string> = {
    group: 'Group Stage',
    round_16: 'Round of 16',
    quarter_final: 'Quarter Final',
    semi_final: 'Semi Final',
    final: 'Final',
  };
  
  return stageMap[stage] || toTitleCase(stage.replace('_', ' '));
}

/**
 * Formats match status for display
 */
export function formatMatchStatus(status: string): string {
  const statusMap: Record<string, string> = {
    scheduled: 'Scheduled',
    live: 'Live',
    completed: 'Full Time',
    postponed: 'Postponed',
  };
  
  return statusMap[status] || toTitleCase(status);
}

/**
 * Formats sweepstake status for display
 */
export function formatSweepstakeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Draft',
    open: 'Open for Joining',
    full: 'Full',
    active: 'Active',
    completed: 'Completed',
  };
  
  return statusMap[status] || toTitleCase(status);
}

/**
 * Formats ordinal numbers (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = n % 100;
  const suffix = suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
  return `${n}${suffix}`;
}

/**
 * Formats phone number (basic international format)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as international number if it looks like a valid format
  if (cleaned.length >= 10) {
    const match = cleaned.match(/^(\d{1,3})(\d{3,4})(\d{3,4})(\d{0,4})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]}`.trim();
    }
  }
  
  return phone;
}

/**
 * Formats duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}