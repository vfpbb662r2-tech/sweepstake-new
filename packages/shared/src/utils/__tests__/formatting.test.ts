import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  formatTime,
  formatScore,
  formatPercentage,
  formatFileSize,
  truncateText,
  toTitleCase,
  camelCaseToReadable,
  formatTournamentStage,
  formatMatchStatus,
  formatSweepstakeStatus,
  formatOrdinal,
  formatDuration,
} from '../formatting';

describe('formatting utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(10)).toBe('£10');
      expect(formatCurrency(10.50)).toBe('£10.50');
      expect(formatCurrency(1000)).toBe('£1,000');
    });

    it('should handle different currencies', () => {
      expect(formatCurrency(10, 'USD', 'en-US')).toBe('$10');
      expect(formatCurrency(10, 'EUR', 'en-GB')).toBe('€10');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('25');
      expect(formatted).toContain('December');
      expect(formatted).toContain('2023');
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime correctly', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatDateTime(date);
      expect(formatted).toContain('25');
      expect(formatted).toContain('December');
      expect(formatted).toContain('2023');
      expect(formatted).toMatch(/\d{2}:\d{2}/); // Time format
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      const formatted = formatTime(date);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatScore', () => {
    it('should format match scores', () => {
      expect(formatScore(2, 1)).toBe('2 - 1');
      expect(formatScore(0, 0)).toBe('0 - 0');
    });

    it('should handle null scores', () => {
      expect(formatScore(null, null)).toBe('-');
      expect(formatScore(1, null)).toBe('-');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(0.5)).toBe('50.0%');
      expect(formatPercentage(0.333, 2)).toBe('33.30%');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1048576)).toBe('1.00 MB');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is...');
    });

    it('should not truncate short text', () => {
      expect(truncateText('Short', 10)).toBe('Short');
    });
  });

  describe('toTitleCase', () => {
    it('should convert to title case', () => {
      expect(toTitleCase('hello world')).toBe('Hello World');
      expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
    });
  });

  describe('camelCaseToReadable', () => {
    it('should convert camelCase to readable format', () => {
      expect(camelCaseToReadable('firstName')).toBe('First Name');
      expect(camelCaseToReadable('tournamentStartDate')).toBe('Tournament Start Date');
    });
  });

  describe('formatTournamentStage', () => {
    it('should format tournament stages', () => {
      expect(formatTournamentStage('group')).toBe('Group Stage');
      expect(formatTournamentStage('round_16')).toBe('Round of 16');
      expect(formatTournamentStage('final')).toBe('Final');
    });
  });

  describe('formatMatchStatus', () => {
    it('should format match statuses', () => {
      expect(formatMatchStatus('scheduled')).toBe('Scheduled');
      expect(formatMatchStatus('live')).toBe('Live');
      expect(formatMatchStatus('completed')).toBe('Full Time');
    });
  });

  describe('formatSweepstakeStatus', () => {
    it('should format sweepstake statuses', () => {
      expect(formatSweepstakeStatus('open')).toBe('Open for Joining');
      expect(formatSweepstakeStatus('active')).toBe('Active');
      expect(formatSweepstakeStatus('completed')).toBe('Completed');
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

  describe('formatDuration', () => {
    it('should format duration correctly', () => {
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(3661)).toBe('1:01:01');
      expect(formatDuration(30)).toBe('0:30');
    });
  });
});