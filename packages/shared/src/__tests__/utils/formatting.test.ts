import {
  formatCurrency,
  formatNumberWithAbbreviation,
  formatPercentage,
  formatFileSize,
  formatTitle,
  truncateText,
  formatInitials,
  formatScore,
  formatOrdinal,
} from '../../utils/formatting';

describe('formatting utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(123.45)).toBe('$123.45');
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(123.45, 'EUR', 'de-DE')).toBe('123,45\xa0€');
    });
  });

  describe('formatNumberWithAbbreviation', () => {
    it('should format numbers with abbreviations', () => {
      expect(formatNumberWithAbbreviation(500)).toBe('500');
      expect(formatNumberWithAbbreviation(1500)).toBe('1.5K');
      expect(formatNumberWithAbbreviation(1500000)).toBe('1.5M');
      expect(formatNumberWithAbbreviation(1500000000)).toBe('1.5B');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(25)).toBe('25.0%');
      expect(formatPercentage(25, 2)).toBe('25.00%');
      expect(formatPercentage(33.333, 1)).toBe('33.3%');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(1073741824)).toBe('1.0 GB');
    });
  });

  describe('formatTitle', () => {
    it('should capitalize each word', () => {
      expect(formatTitle('hello world')).toBe('Hello World');
      expect(formatTitle('UPPERCASE TEXT')).toBe('Uppercase Text');
      expect(formatTitle('mixed Case text')).toBe('Mixed Case Text');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('Hello World', 5)).toBe('He...');
      expect(truncateText('Short', 10)).toBe('Short');
      expect(truncateText('Exactly10!', 10)).toBe('Exactly10!');
    });
  });

  describe('formatInitials', () => {
    it('should format initials correctly', () => {
      expect(formatInitials('John Doe')).toBe('JD');
      expect(formatInitials('John Middle Doe', 2)).toBe('JM');
      expect(formatInitials('Single')).toBe('S');
    });
  });

  describe('formatScore', () => {
    it('should format scores correctly', () => {
      expect(formatScore(2, 1)).toBe('2 - 1');
      expect(formatScore(0, 0)).toBe('0 - 0');
      expect(formatScore()).toBe('TBD');
      expect(formatScore(2)).toBe('TBD');
    });
  });

  describe('formatOrdinal', () => {
    it('should format ordinal numbers correctly', () => {
      expect(formatOrdinal(1)).toBe('1st');
      expect(formatOrdinal(2)).toBe('2nd');
      expect(formatOrdinal(3)).toBe('3rd');
      expect(formatOrdinal(4)).toBe('4th');
      expect(formatOrdinal(21)).toBe('21st');
      expect(formatOrdinal(22)).toBe('22nd');
      expect(formatOrdinal(23)).toBe('23rd');
    });
  });
});