import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  formatCurrency,
  generateRandomString,
  generateInviteCode,
  capitalize,
  toTitleCase,
  truncateText,
  calculateMatchPoints,
  sortLeaderboard,
  isValidEmail,
  isValidInviteCode,
  debounce,
  delay,
  safeJsonParse,
  getInitials,
  calculatePercentage,
  removeEmpty,
  groupBy,
  unique,
  shuffle,
  cn,
} from '../src/utils';

describe('Date and Time Utilities', () => {
  const testDate = '2024-03-15T14:30:00.000Z';
  const testDateObj = new Date(testDate);

  beforeEach(() => {
    // Mock Date.now() to return a consistent timestamp
    vi.setSystemTime(new Date('2024-03-15T15:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should format date correctly', () => {
    const formatted = formatDate(testDate);
    expect(formatted).toBe('Mar 15, 2024');
  });

  it('should format time correctly', () => {
    const formatted = formatTime(testDate);
    expect(formatted).toBe('2:30 PM');
  });

  it('should format datetime correctly', () => {
    const formatted = formatDateTime(testDate);
    expect(formatted).toBe('Mar 15, 2024, 2:30 PM');
  });

  it('should get relative time correctly', () => {
    const pastDate = new Date('2024-03-15T14:00:00.000Z');
    const relative = getRelativeTime(pastDate);
    expect(relative).toBe('1 hour ago');
  });

  it('should handle date objects in addition to strings', () => {
    const formatted = formatDate(testDateObj);
    expect(formatted).toBe('Mar 15, 2024');
  });
});

describe('String Utilities', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(100)).toBe('$100.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(100, 'EUR')).toBe('€100.00');
  });

  it('should generate random string of specified length', () => {
    const randomStr = generateRandomString(10);
    expect(randomStr).toHaveLength(10);
    expect(randomStr).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('should generate valid invite code', () => {
    const inviteCode = generateInviteCode();
    expect(inviteCode).toHaveLength(8);
    expect(inviteCode).toMatch(/^[A-Z0-9]{8}$/);
  });

  it('should capitalize string correctly', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('WORLD');
    expect(capitalize('')).toBe('');
  });

  it('should convert to title case correctly', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
    expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
    expect(toTitleCase('hello-world')).toBe('Hello-World');
  });

  it('should truncate text correctly', () => {
    const longText = 'This is a very long text that should be truncated';
    expect(truncateText(longText, 20)).toBe('This is a very long ...');
    expect(truncateText('Short text', 20)).toBe('Short text');
  });

  it('should get initials correctly', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Jane Smith Johnson')).toBe('JS');
    expect(getInitials('Single')).toBe('S');
  });
});

describe('Match and Points Utilities', () => {
  it('should calculate match points correctly', () => {
    // Win for home team
    expect(calculateMatchPoints(2, 1, true)).toBe(3);
    // Win for away team  
    expect(calculateMatchPoints(1, 2, false)).toBe(3);
    // Loss
    expect(calculateMatchPoints(1, 2, true)).toBe(0);
    // Draw
    expect(calculateMatchPoints(1, 1, true)).toBe(1);
    expect(calculateMatchPoints(1, 1, false)).toBe(1);
  });

  it('should sort leaderboard correctly', () => {
    const entries = [
      { points: 6, goal_difference: 2, goals_for: 4 },
      { points: 9, goal_difference: 1, goals_for: 3 },
      { points: 6, goal_difference: 3, goals_for: 5 },
      { points: 6, goal_difference: 2, goals_for: 6 },
    ];

    const sorted = sortLeaderboard(entries);
    
    expect(sorted[0].points).toBe(9); // Highest points first
    expect(sorted[1].goal_difference).toBe(3); // Better goal difference
    expect(sorted[3].goals_for).toBe(4); // Lowest goals for last
  });
});

describe('Validation Utilities', () => {
  it('should validate email correctly', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
  });

  it('should validate invite code correctly', () => {
    expect(isValidInviteCode('ABCD1234')).toBe(true);
    expect(isValidInviteCode('12345678')).toBe(true);
    expect(isValidInviteCode('abcd1234')).toBe(false); // lowercase
    expect(isValidInviteCode('ABCD123')).toBe(false);  // too short
    expect(isValidInviteCode('ABCD12345')).toBe(false); // too long
  });
});

describe('Utility Functions', () => {
  it('should debounce function calls', async () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1');
    debouncedFn('arg2');
    debouncedFn('arg3');

    expect(fn).not.toHaveBeenCalled();

    await delay(150);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('arg3');
  });

  it('should create delay promise', async () => {
    const start = Date.now();
    await delay(100);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(90); // Allow some timing variance
  });

  it('should safely parse JSON', () => {
    const validJson = '{"test": "value"}';
    const invalidJson = '{"invalid": json}';
    const fallback = { default: true };

    expect(safeJsonParse(validJson, fallback)).toEqual({ test: 'value' });
    expect(safeJsonParse(invalidJson, fallback)).toEqual(fallback);
  });

  it('should calculate percentage correctly', () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(1, 3)).toBe(33);
    expect(calculatePercentage(5, 0)).toBe(0);
  });

  it('should remove empty values from object', () => {
    const obj = {
      name: 'Test',
      description: '',
      count: 0,
      value: null,
      active: true,
      data: undefined,
    };

    const cleaned = removeEmpty(obj);
    expect(cleaned).toEqual({
      name: 'Test',
      count: 0,
      active: true,
    });
  });

  it('should group array by key', () => {
    const items = [
      { category: 'A', value: 1 },
      { category: 'B', value: 2 },
      { category: 'A', value: 3 },
    ];

    const grouped = groupBy(items, 'category');
    expect(grouped.A).toHaveLength(2);
    expect(grouped.B).toHaveLength(1);
  });

  it('should create unique array', () => {
    const items = [1, 2, 2, 3, 3, 3, 4];
    const uniqueItems = unique(items);
    expect(uniqueItems).toEqual([1, 2, 3, 4]);
  });

  it('should shuffle array', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    
    expect(shuffled).toHaveLength(5);
    expect(shuffled).toEqual(expect.arrayContaining(original));
    expect(original).toEqual([1, 2, 3, 4, 5]); // Original unchanged
  });

  it('should combine classes correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
    expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500'); // Tailwind merge
  });
});