import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  validateData,
  isValidEmail,
  isValidPassword,
  isValidUUID,
  isValidUrl,
  sanitizeString,
  isValidISODate,
  isFutureDate,
  isPastDate,
  isValidDateRange,
  isInRange,
  isAlphanumeric,
  isValidJoinCode,
} from '../validation';

describe('validation utilities', () => {
  describe('validateData', () => {
    const testSchema = z.object({
      name: z.string().min(2),
      age: z.number().min(0),
    });

    it('should validate correct data', () => {
      const result = validateData(testSchema, { name: 'John', age: 25 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'John', age: 25 });
      }
    });

    it('should return errors for invalid data', () => {
      const result = validateData(testSchema, { name: 'A', age: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveLength(2);
      }
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should validate strong passwords', () => {
      const result = isValidPassword('StrongPass123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = isValidPassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://invalid')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should trim and normalize whitespace', () => {
      expect(sanitizeString('  hello   world  ')).toBe('hello world');
      expect(sanitizeString('multiple    spaces')).toBe('multiple spaces');
    });
  });

  describe('isValidISODate', () => {
    it('should validate ISO date strings', () => {
      expect(isValidISODate('2023-12-25T10:30:00.000Z')).toBe(true);
    });

    it('should reject invalid date strings', () => {
      expect(isValidISODate('2023-12-25')).toBe(false);
      expect(isValidISODate('invalid-date')).toBe(false);
    });
  });

  describe('isFutureDate', () => {
    it('should identify future dates', () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      expect(isFutureDate(futureDate)).toBe(true);
    });

    it('should identify past dates', () => {
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      expect(isFutureDate(pastDate)).toBe(false);
    });
  });

  describe('isPastDate', () => {
    it('should identify past dates', () => {
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      expect(isPastDate(pastDate)).toBe(true);
    });

    it('should identify future dates', () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      expect(isPastDate(futureDate)).toBe(false);
    });
  });

  describe('isValidDateRange', () => {
    it('should validate correct date ranges', () => {
      const start = new Date('2023-01-01');
      const end = new Date('2023-12-31');
      expect(isValidDateRange(start, end)).toBe(true);
    });

    it('should reject invalid date ranges', () => {
      const start = new Date('2023-12-31');
      const end = new Date('2023-01-01');
      expect(isValidDateRange(start, end)).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should validate numbers in range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
    });

    it('should reject numbers out of range', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
    });
  });

  describe('isAlphanumeric', () => {
    it('should validate alphanumeric strings', () => {
      expect(isAlphanumeric('ABC123')).toBe(true);
      expect(isAlphanumeric('test')).toBe(true);
    });

    it('should reject non-alphanumeric strings', () => {
      expect(isAlphanumeric('test!')).toBe(false);
      expect(isAlphanumeric('hello world')).toBe(false);
    });
  });

  describe('isValidJoinCode', () => {
    it('should validate correct join codes', () => {
      expect(isValidJoinCode('ABC123')).toBe(true);
      expect(isValidJoinCode('XYZ789')).toBe(true);
    });

    it('should reject invalid join codes', () => {
      expect(isValidJoinCode('abc123')).toBe(false); // Lowercase
      expect(isValidJoinCode('AB123')).toBe(false); // Too short
      expect(isValidJoinCode('ABC1234')).toBe(false); // Too long
    });
  });
});