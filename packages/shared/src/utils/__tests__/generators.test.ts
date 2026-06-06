import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateJoinCode,
  generateUUID,
  generateSlug,
  generateRandomColor,
  generateInitials,
  generateAvatarUrl,
  generatePassword,
  generateRandomInt,
  generateRandomFloat,
  generateRandomBoolean,
  generateRandomDate,
  generateRandomChoice,
  generateRandomChoices,
  generateSecureToken,
  generateTimestampId,
} from '../generators';

describe('generator utilities', () => {
  describe('generateJoinCode', () => {
    it('should generate 6-character join codes', () => {
      const code = generateJoinCode();
      expect(code).toHaveLength(6);
      expect(/^[A-Z0-9]+$/.test(code)).toBe(true);
    });

    it('should generate different codes each time', () => {
      const codes = Array.from({ length: 10 }, () => generateJoinCode());
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBeGreaterThan(1);
    });
  });

  describe('generateUUID', () => {
    it('should generate valid UUID format', () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(uuid)).toBe(true);
    });

    it('should generate unique UUIDs', () => {
      const uuids = Array.from({ length: 10 }, () => generateUUID());
      const uniqueUUIDs = new Set(uuids);
      expect(uniqueUUIDs.size).toBe(10);
    });
  });

  describe('generateSlug', () => {
    it('should convert text to URL-friendly slug', () => {
      expect(generateSlug('Hello World!')).toBe('hello-world');
      expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(generateSlug('Special@Characters#Here')).toBe('specialcharactershere');
    });
  });

  describe('generateRandomColor', () => {
    it('should generate valid hex color codes', () => {
      const color = generateRandomColor();
      expect(/^#[0-9A-F]{6}$/i.test(color)).toBe(true);
    });
  });

  describe('generateInitials', () => {
    it('should generate initials from names', () => {
      expect(generateInitials('John Doe')).toBe('JD');
      expect(generateInitials('Mary Jane Watson')).toBe('MJ');
      expect(generateInitials('SingleName')).toBe('S');
    });
  });

  describe('generateAvatarUrl', () => {
    it('should generate avatar URL with seed', () => {
      const url = generateAvatarUrl('test');
      expect(url).toContain('dicebear.com');
      expect(url).toContain('seed=test');
    });
  });

  describe('generatePassword', () => {
    it('should generate password of specified length', () => {
      const password = generatePassword(16);
      expect(password).toHaveLength(16);
    });

    it('should contain all character types', () => {
      const password = generatePassword(12);
      expect(/[a-z]/.test(password)).toBe(true);
      expect(/[A-Z]/.test(password)).toBe(true);
      expect(/[0-9]/.test(password)).toBe(true);
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)).toBe(true);
    });
  });

  describe('generateRandomInt', () => {
    it('should generate integer within range', () => {
      const result = generateRandomInt(1, 10);
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    });
  });

  describe('generateRandomFloat', () => {
    it('should generate float within range', () => {
      const result = generateRandomFloat(1.0, 2.0, 2);
      expect(result).toBeGreaterThanOrEqual(1.0);
      expect(result).toBeLessThanOrEqual(2.0);
      expect(result.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });

  describe('generateRandomBoolean', () => {
    it('should generate boolean values', () => {
      const results = Array.from({ length: 10 }, () => generateRandomBoolean());
      expect(results.every(r => typeof r === 'boolean')).toBe(true);
    });
  });

  describe('generateRandomDate', () => {
    it('should generate date within range', () => {
      const start = new Date('2023-01-01');
      const end = new Date('2023-12-31');
      const result = generateRandomDate(start, end);
      
      expect(result.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(result.getTime()).toBeLessThanOrEqual(end.getTime());
    });
  });

  describe('generateRandomChoice', () => {
    it('should pick element from array', () => {
      const array = ['a', 'b', 'c', 'd'];
      const choice = generateRandomChoice(array);
      expect(array).toContain(choice);
    });
  });

  describe('generateRandomChoices', () => {
    it('should pick multiple elements without duplicates', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      const choices = generateRandomChoices(array, 3);
      
      expect(choices).toHaveLength(3);
      expect(new Set(choices).size).toBe(3); // No duplicates
      choices.forEach(choice => expect(array).toContain(choice));
    });

    it('should return full array if count exceeds array length', () => {
      const array = ['a', 'b'];
      const choices = generateRandomChoices(array, 5);
      expect(choices).toHaveLength(2);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate token of specified length', () => {
      const token = generateSecureToken(16);
      expect(token).toHaveLength(16);
    });

    it('should use crypto.getRandomValues when available', () => {
      // Mock crypto.getRandomValues
      const mockGetRandomValues = vi.fn((array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      });

      global.crypto = { getRandomValues: mockGetRandomValues } as any;

      const token = generateSecureToken(8);
      expect(token).toHaveLength(8);
      expect(mockGetRandomValues).toHaveBeenCalled();

      // Clean up
      delete (global as any).crypto;
    });
  });

  describe('generateTimestampId', () => {
    it('should generate timestamp-based ID', () => {
      const id = generateTimestampId();
      expect(id).toMatch(/^[a-z0-9]+_[a-z0-9]+$/);
    });

    it('should generate unique IDs', () => {
      const ids = Array.from({ length: 5 }, () => generateTimestampId());
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });
  });
});