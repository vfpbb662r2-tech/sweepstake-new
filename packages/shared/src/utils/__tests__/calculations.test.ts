import { describe, it, expect } from 'vitest';
import {
  calculatePrizeDistribution,
  calculateTotalPot,
  calculateTeamScore,
  calculateStandings,
  calculateWinProbability,
  calculateExpectedGoals,
  calculateTournamentProgress,
  calculateParticipantPayout,
  calculatePercentile,
  calculateTimeUntil,
  calculateMatchImportance,
  calculateROI,
  calculateCompoundProbability,
  calculateWeightedAverage,
} from '../calculations';
import { TOURNAMENT_STAGES, MATCH_STATUSES } from '../../constants';

describe('calculation utilities', () => {
  describe('calculatePrizeDistribution', () => {
    it('should calculate correct prize distribution', () => {
      const result = calculatePrizeDistribution(100, 10);
      expect(result.first).toBe(50);
      expect(result.second).toBe(30);
      expect(result.third).toBe(20);
      expect(result.remaining).toBe(0);
    });

    it('should handle zero pot', () => {
      const result = calculatePrizeDistribution(0, 10);
      expect(result.first).toBe(0);
      expect(result.second).toBe(0);
      expect(result.third).toBe(0);
    });
  });

  describe('calculateTotalPot', () => {
    it('should calculate total pot correctly', () => {
      expect(calculateTotalPot(10, 8)).toBe(80);
      expect(calculateTotalPot(5, 16)).toBe(80);
    });
  });

  describe('calculateTeamScore', () => {
    it('should calculate scores for different stages', () => {
      expect(calculateTeamScore(TOURNAMENT_STAGES.GROUP)).toBe(1);
      expect(calculateTeamScore(TOURNAMENT_STAGES.ROUND_16)).toBe(2);
      expect(calculateTeamScore(TOURNAMENT_STAGES.FINAL, true)).toBe(20);
      expect(calculateTeamScore(TOURNAMENT_STAGES.FINAL, false)).toBe(16);
    });
  });

  describe('calculateStandings', () => {
    it('should calculate participant standings correctly', () => {
      const participants = [
        { id: '1', teamId: 'team1', userId: 'user1' },
        { id: '2', teamId: 'team2', userId: 'user2' },
      ];

      const matches = [
        {
          homeTeamId: 'team1',
          awayTeamId: 'team2',
          homeScore: 2,
          awayScore: 1,
          status: MATCH_STATUSES.COMPLETED,
          stage: TOURNAMENT_STAGES.GROUP,
        },
      ];

      const standings = calculateStandings(participants, matches);
      
      expect(standings).toHaveLength(2);
      expect(standings[0].position).toBe(1);
      expect(standings[1].position).toBe(2);
      expect(standings[0].score).toBeGreaterThan(standings[1].score);
    });
  });

  describe('calculateWinProbability', () => {
    it('should calculate win probabilities', () => {
      const prob = calculateWinProbability(10, 20); // Better team vs worse team
      
      expect(prob.home).toBeGreaterThan(0);
      expect(prob.draw).toBeGreaterThan(0);
      expect(prob.away).toBeGreaterThan(0);
      expect(prob.home + prob.draw + prob.away).toBeCloseTo(1, 1);
      expect(prob.home).toBeGreaterThan(prob.away); // Better ranking should have higher win chance
    });
  });

  describe('calculateExpectedGoals', () => {
    it('should calculate expected goals based on rankings', () => {
      const goals1 = calculateExpectedGoals(1, 50); // Top team vs average team
      const goals2 = calculateExpectedGoals(50, 1); // Average team vs top team
      
      expect(goals1).toBeGreaterThan(goals2);
      expect(goals1).toBeGreaterThan(0);
      expect(goals2).toBeGreaterThan(0);
    });
  });

  describe('calculateTournamentProgress', () => {
    it('should calculate correct progress percentage', () => {
      expect(calculateTournamentProgress(25, 100)).toBe(25);
      expect(calculateTournamentProgress(50, 100)).toBe(50);
      expect(calculateTournamentProgress(100, 100)).toBe(100);
      expect(calculateTournamentProgress(150, 100)).toBe(100); // Capped at 100%
    });

    it('should handle zero total matches', () => {
      expect(calculateTournamentProgress(10, 0)).toBe(0);
    });
  });

  describe('calculateParticipantPayout', () => {
    it('should calculate correct payouts by position', () => {
      const totalPot = 100;
      const participantCount = 10;

      expect(calculateParticipantPayout(1, totalPot, participantCount)).toBe(50);
      expect(calculateParticipantPayout(2, totalPot, participantCount)).toBe(30);
      expect(calculateParticipantPayout(3, totalPot, participantCount)).toBe(20);
      expect(calculateParticipantPayout(4, totalPot, participantCount)).toBe(0);
    });
  });

  describe('calculatePercentile', () => {
    it('should calculate correct percentiles', () => {
      expect(calculatePercentile(1, 10)).toBe(100); // 1st out of 10 = 100th percentile
      expect(calculatePercentile(5, 10)).toBe(60);  // 5th out of 10 = 60th percentile
      expect(calculatePercentile(10, 10)).toBe(10); // Last = 10th percentile
    });

    it('should handle edge cases', () => {
      expect(calculatePercentile(1, 1)).toBe(100);
      expect(calculatePercentile(1, 0)).toBe(100);
    });
  });

  describe('calculateTimeUntil', () => {
    it('should calculate time until future date', () => {
      const futureDate = new Date(Date.now() + 90061000); // ~25 hours and 1 minute and 1 second
      const result = calculateTimeUntil(futureDate);
      
      expect(result.days).toBe(1);
      expect(result.hours).toBe(1);
      expect(result.minutes).toBe(1);
      expect(result.seconds).toBe(1);
    });

    it('should handle past dates', () => {
      const pastDate = new Date(Date.now() - 1000);
      const result = calculateTimeUntil(pastDate);
      
      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.totalSeconds).toBe(0);
    });
  });

  describe('calculateMatchImportance', () => {
    it('should calculate importance based on stage', () => {
      const groupImportance = calculateMatchImportance(TOURNAMENT_STAGES.GROUP, false);
      const finalImportance = calculateMatchImportance(TOURNAMENT_STAGES.FINAL, false);
      
      expect(finalImportance).toBeGreaterThan(groupImportance);
    });

    it('should boost importance for elimination matches', () => {
      const normal = calculateMatchImportance(TOURNAMENT_STAGES.QUARTER_FINAL, false);
      const elimination = calculateMatchImportance(TOURNAMENT_STAGES.QUARTER_FINAL, true);
      
      expect(elimination).toBeGreaterThan(normal);
    });
  });

  describe('calculateROI', () => {
    it('should calculate ROI correctly', () => {
      expect(calculateROI(100, 150)).toBe(50); // 50% return
      expect(calculateROI(100, 50)).toBe(-50);  // 50% loss
      expect(calculateROI(100, 100)).toBe(0);   // Break even
    });

    it('should handle zero investment', () => {
      expect(calculateROI(0, 100)).toBe(Infinity);
      expect(calculateROI(0, 0)).toBe(0);
    });
  });

  describe('calculateCompoundProbability', () => {
    it('should calculate compound probability correctly', () => {
      const result = calculateCompoundProbability([0.5, 0.8, 0.9]);
      expect(result).toBeCloseTo(0.36, 2); // 0.5 * 0.8 * 0.9 = 0.36
    });

    it('should handle empty array', () => {
      expect(calculateCompoundProbability([])).toBe(1);
    });
  });

  describe('calculateWeightedAverage', () => {
    it('should calculate weighted average correctly', () => {
      const values = [10, 20, 30];
      const weights = [1, 2, 3];
      const result = calculateWeightedAverage(values, weights);
      
      // (10*1 + 20*2 + 30*3) / (1+2+3) = 140/6 ≈ 23.33
      expect(result).toBeCloseTo(23.33, 2);
    });

    it('should handle mismatched arrays', () => {
      expect(calculateWeightedAverage([1, 2], [1])).toBe(0);
      expect(calculateWeightedAverage([], [])).toBe(0);
    });

    it('should handle zero weights', () => {
      expect(calculateWeightedAverage([1, 2, 3], [0, 0, 0])).toBe(0);
    });
  });
});