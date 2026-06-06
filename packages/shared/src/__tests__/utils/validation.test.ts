import {
  validateSchema,
  isValidEmail,
  validatePassword,
  isValidUuid,
  isValidUrl,
  isValidPhoneNumber,
  sanitizeHtml,
  validateFileSize,
  isValidImageType,
} from '../../utils/validation';
import { z } from 'zod';

describe('validation utils', () => {
  describe('validateSchema', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().min(0),
    });

    it('should return success for valid data', () => {
      const data = { name: 'John', email: 'john@example.com', age: 25 };
      const result = validateSchema(testSchema, data);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(data);
      }
    });

    it('should return errors for invalid data', () => {
      const data = { name: '', email: 'invalid-email', age: -1 };
      const result = validateSchema(testSchema, data);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toMatchObject({
          name: expect.any(String),
          email: expect.any(String),
          age: expect.any(String),
        });
      }
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should require all character types', () => {
      const noLowercase = validatePassword('UPPERCASE123');
      expect(noLowercase.isValid).toBe(false);
      expect(noLowercase.errors).toContain(
        'Password must contain at least one lowercase letter'
      );

      const noUppercase = validatePassword('lowercase123');
      expect(noUppercase.isValid).toBe(false);
      expect(noUppercase.errors).toContain(
        'Password must contain at least one uppercase letter'
      );

      const noNumber = validatePassword('NoNumbers');
      expect(noNumber.isValid).toBe(false);
      expect(noNumber.errors).toContain(
        'Password must contain at least one number'
      );
    });
  });

  describe('isValidUuid', () => {
    it('should validate correct UUIDs', () => {
      expect(isValidUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(isValidUuid('invalid-uuid')).toBe(false);
      expect(isValidUuid('123e4567-e89b-12d3-a456')).toBe(false);
      expect(isValidUuid('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('https://subdomain.example.com/path')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isValidPhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(isValidPhoneNumber('+1234567890')).toBe(true);
      expect(isValidPhoneNumber('1234567890')).toBe(true);
      expect(isValidPhoneNumber('+44 20 7946 0958')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhoneNumber('abc')).toBe(false);
      expect(isValidPhoneNumber('123')).toBe(false);
      expect(isValidPhoneNumber('')).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    it('should escape HTML characters', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(sanitizeHtml('Hello & goodbye'))
        .toBe('Hello &amp; goodbye');
    });
  });

  describe('validateFileSize', () => {
    it('should validate file size correctly', () => {
      const smallFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      expect(validateFileSize(smallFile, 1)).toBe(true);

      const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB content
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });
      expect(validateFileSize(largeFile, 1)).toBe(false);
    });
  });

  describe('isValidImageType', () => {
    it('should validate image file types', () => {
      const jpegFile = new File([''], 'image.jpg', { type: 'image/jpeg' });
      const pngFile = new File([''], 'image.png', { type: 'image/png' });
      const textFile = new File([''], 'text.txt', { type: 'text/plain' });

      expect(isValidImageType(jpegFile)).toBe(true);
      expect(isValidImageType(pngFile)).toBe(true);
      expect(isValidImageType(textFile)).toBe(false);
    });
  });
});