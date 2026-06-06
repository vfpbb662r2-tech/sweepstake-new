import { format, formatDistanceToNow, isAfter, isBefore, parseISO, addDays, differenceInDays } from 'date-fns';

/**
 * Formats a date string for display
 */
export function formatDate(
  date: string | Date,
  formatString: string = 'MMM dd, yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
}

/**
 * Formats a date string for datetime-local input
 */
export function formatDateTimeLocal(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Formats a date as time ago (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Formats match date and time
 */
export function formatMatchDateTime(date: string | Date): {
  date: string;
  time: string;
  relative: string;
} {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  return {
    date: format(dateObj, 'MMM dd, yyyy'),
    time: format(dateObj, 'HH:mm'),
    relative: formatDistanceToNow(dateObj, { addSuffix: true }),
  };
}

/**
 * Checks if a date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isAfter(dateObj, new Date());
}

/**
 * Checks if a date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isBefore(dateObj, new Date());
}

/**
 * Gets days until a future date
 */
export function getDaysUntil(date: string | Date): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return Math.max(0, differenceInDays(dateObj, new Date()));
}

/**
 * Gets days since a past date
 */
export function getDaysSince(date: string | Date): number {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return Math.max(0, differenceInDays(new Date(), dateObj));
}

/**
 * Checks if a date is today
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Gets tournament status based on dates
 */
export function getTournamentStatus(
  startDate: string | Date,
  endDate: string | Date
): 'upcoming' | 'active' | 'completed' {
  const now = new Date();
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (isBefore(now, start)) {
    return 'upcoming';
  } else if (isAfter(now, end)) {
    return 'completed';
  } else {
    return 'active';
  }
}

/**
 * Adds days to a date
 */
export function addDaysToDate(date: string | Date, days: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
}

/**
 * Creates a date range for filtering
 */
export function createDateRange(days: number): {
  start: Date;
  end: Date;
} {
  const end = new Date();
  const start = addDays(end, -days);
  
  return { start, end };
}