import {
  generateRandomString,
  generateSlug,
  capitalize,
  camelToKebab,
  kebabToCamel,
  snakeToCamel,
  normalizeWhitespace,
  isAlphanumeric,
  extractNumbers,
  maskString,
  countWords,
  generateInviteCode,
  pluralize,
} from '../../utils/string';

describe('string utils', () => {
  describe('generateRandomString', () => {
    it('should generate random strings of correct length', () => {
      const str5 = generateRandomString(5);
      const str10 = generateRandomString(10);

      expect(str5).toHaveLength(5);
      expect(str10).toHaveLength(10);
      expect(str5).toMatch(/^[A-Za-z0-9]+$/);
      expect(str10).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate different strings', () => {
      const str1 = generateRandomString(10);
      const str2 = generateRandomString(10);
      expect(str1).not.toBe(str2);
    });
  });

  describe('generateSlug', () => {
    it('should create valid slugs', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('Hello, World!')).toBe('hello-world');
      expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(generateSlug('Special-Characters_Test')).toBe('special-characters-test');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('')).toBe('');
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('camelToKebab', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(camelToKebab('camelCase')).toBe('camel-case');
      expect(camelToKebab('thisIsATest')).toBe('this-is-a-test');
      expect(camelToKebab('HTML5Parser')).toBe('h-t-m-l5-parser');
    });
  });

  describe('kebabToCamel', () => {
    it('should convert kebab-case to camelCase', () => {
      expect(kebabToCamel('kebab-case')).toBe('kebabCase');
      expect(kebabToCamel('this-is-a-test')).toBe('thisIsATest');
      expect(kebabToCamel('single')).toBe('single');
    });
  });

  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('snake_case')).toBe('snakeCase');
      expect(snakeToCamel('this_is_a_test')).toBe('thisIsATest');
      expect(snakeToCamel('single')).toBe('single');
    });
  });

  describe('normalizeWhitespace', () => {
    it('should normalize whitespace', () => {
      expect(normalizeWhitespace('  hello   world  ')).toBe('hello world');
      expect(normalizeWhitespace('hello\n\nworld')).toBe('hello world');
      expect(normalizeWhitespace('hello\tworld')).toBe('hello world');
    });
  });

  describe('isAlphanumeric', () => {
    it('should check alphanumeric strings', () => {
      expect(isAlphanumeric('abc123')).toBe(true);
      expect(isAlphanumeric('ABC123')).toBe(true);
      expect(isAlphanumeric('abc-123')).toBe(false);
      expect(isAlphanumeric('abc 123')).toBe(false);
      expect(isAlphanumeric('abc@123')).toBe(false);
    });
  });

  describe('extractNumbers', () => {
    it('should extract numbers from strings', () => {
      expect(extractNumbers('abc123def456')).toEqual([123, 456]);
      expect(extractNumbers('no numbers here')).toEqual([]);
      expect(extractNumbers('123')).toEqual([123]);
      expect(extractNumbers('price: $19.99')).toEqual([19, 99]);
    });
  });

  describe('maskString', () => {
    it('should mask strings correctly', () => {
      expect(maskString('1234567890')).toBe('12******90');
      expect(maskString('1234567890', 3, 3)).toBe('123****890');
      expect(maskString('short', 2, 2)).toBe('short');
      expect(maskString('1234567890', 2, 2, '#')).toBe('12######90');
    });
  });

  describe('countWords', () => {
    it('should count words correctly', () => {
      expect(countWords('hello world')).toBe(2);
      expect(countWords('  hello   world  ')).toBe(2);
      expect(countWords('')).toBe(0);
      expect(countWords('single')).toBe(1);
      expect(countWords('one two three four five')).toBe(5);
    });
  });

  describe('generateInviteCode', () => {
    it('should generate invite codes', () => {
      const code = generateInviteCode(8);
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[A-Z0-9]+$/);
      
      const shortCode = generateInviteCode(4);
      expect(shortCode).toHaveLength(4);
    });
  });

  describe('pluralize', () => {
    it('should pluralize words correctly', () => {
      expect(pluralize('cat', 1)).toBe('cat');
      expect(pluralize('cat', 2)).toBe('cats');
      expect(pluralize('mouse', 2, 'mice')).toBe('mice');
      expect(pluralize('person', 1, 'people')).toBe('person');
    });
  });
});