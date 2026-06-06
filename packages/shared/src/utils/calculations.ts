import { TOURNAMENT_STAGES, MATCH_STATUSES } from '../constants';

/**
 * Calculates sweepstake prize distribution
 */
export function calculatePrizeDistribution(
  totalPot: number,
  participantCount: number
): {
  first: number;
  second: number;
  third: number;
  remaining: number;
} {
  if (totalPot <= 0 || participantCount < 2) {
    return { first: 0, second: 0, third: 0, remaining: 0 };
  }

  // Standard distribution: 50% first, 30% second, 20% third
  const first = Math.floor(totalPot * 0.5);
  const second = Math.floor(totalPot * 0.3);
  const third = Math.floor(totalPot * 0.2);
  const remaining = totalPot - (first + second + third);

  return { first, second, third, remaining };
}

/**
 * Calculates total pot from entry fees
 */
export function calculateTotalPot(entryFee: number, participantCount: number): number {
  return entryFee * participantCount;
}

/**
 * Calculates team performance score based on tournament progress
 */
export function calculateTeamScore(stage: string, isWinner = false): number {
  const stageScores: Record<string, number> = {
    [TOURNAMENT_STAGES.GROUP]: 1,
    [TOURNAMENT_STAGES.ROUND_16]: 2,
    [TOURNAMENT_STAGES.QUARTER_FINAL]: 4,
    [TOURNAMENT_STAGES.SEMI_FINAL]: 8,
    [TOURNAMENT_STAGES.FINAL]: isWinner ? 20 : 16,
  };

  return stageScores[stage] || 0;
}

/**
 * Calculates participant standings based on team performance
 */
export function calculateStandings(
  participants: Array<{
    id: string;
    teamId: string;
    userId: string;
  }>,
  matches: Array<{
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
    stage: string;
  }>
): Array<{
  participantId: string;
  userId: string;
  teamId: string;
  score: number;
  position: number;
}> {
  // Calculate scores for each participant
  const scores = participants.map(participant => {
    let totalScore = 0;

    // Find all matches involving this participant's team
    const teamMatches = matches.filter(
      match =>
        (match.homeTeamId === participant.teamId || match.awayTeamId === participant.teamId) &&
        match.status === MATCH_STATUSES.COMPLETED
    );

    teamMatches.forEach(match => {
      const isHomeTeam = match.homeTeamId === participant.teamId;
      const teamScore = isHomeTeam ? match.homeScore : match.awayScore;
      const opponentScore = isHomeTeam ? match.awayScore : match.homeScore;

      if (teamScore !== null && opponentScore !== null) {
        // Points for progression to next stage
        totalScore += calculateTeamScore(match.stage);

        // Bonus points for wins
        if (teamScore > opponentScore) {
          totalScore += 3;
        } else if (teamScore === opponentScore) {
          totalScore += 1; // Draw
        }

        // Bonus for goals scored
        totalScore += teamScore * 0.1;
      }
    });

    return {
      participantId: participant.id,
      userId: participant.userId,
      teamId: participant.teamId,
      score: totalScore,
      position: 0, // Will be calculated after sorting
    };
  });

  // Sort by score and assign positions
  scores.sort((a, b) => b.score - a.score);
  
  scores.forEach((entry, index) => {
    entry.position = index + 1;
  });

  return scores;
}

/**
 * Calculates win probability based on FIFA rankings
 */
export function calculateWinProbability(
  homeRanking: number,
  awayRanking: number
): { home: number; draw: number; away: number } {
  // Simple Elo-based calculation
  const rankingDiff = homeRanking - awayRanking;
  const probability = 1 / (1 + Math.pow(10, rankingDiff / 600));
  
  // Adjust for home advantage (small boost)
  const homeAdvantage = 0.05;
  const homeProbability = Math.min(0.8, probability + homeAdvantage);
  const awayProbability = Math.max(0.1, 1 - homeProbability - 0.2);
  const drawProbability = 1 - homeProbability - awayProbability;

  return {
    home: Math.round(homeProbability * 100) / 100,
    draw: Math.round(drawProbability * 100) / 100,
    away: Math.round(awayProbability * 100) / 100,
  };
}

/**
 * Calculates expected goals based on team rankings
 */
export function calculateExpectedGoals(
  teamRanking: number,
  opponentRanking: number
): number {
  const rankingDiff = opponentRanking - teamRanking;
  const baseGoals = 1.5; // Average goals per team per match
  const adjustment = rankingDiff / 100; // Better ranking = more goals expected
  
  return Math.max(0.1, baseGoals + adjustment);
}

/**
 * Calculates tournament progress percentage
 */
export function calculateTournamentProgress(
  completedMatches: number,
  totalMatches: number
): number {
  if (totalMatches === 0) return 0;
  return Math.min(100, Math.round((completedMatches / totalMatches) * 100));
}

/**
 * Calculates participant payout based on final position
 */
export function calculateParticipantPayout(
  position: number,
  totalPot: number,
  participantCount: number
): number {
  const distribution = calculatePrizeDistribution(totalPot, participantCount);
  
  switch (position) {
    case 1:
      return distribution.first;
    case 2:
      return distribution.second;
    case 3:
      return distribution.third;
    default:
      return 0;
  }
}

/**
 * Calculates percentage of participants ahead
 */
export function calculatePercentile(
  position: number,
  totalParticipants: number
): number {
  if (totalParticipants <= 1) return 100;
  return Math.round(((totalParticipants - position + 1) / totalParticipants) * 100);
}

/**
 * Calculates time until event (in different units)
 */
export function calculateTimeUntil(targetDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
} {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }
  
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return { days, hours, minutes, seconds, totalSeconds };
}

/**
 * Calculates match importance score
 */
export function calculateMatchImportance(
  stage: string,
  isElimination: boolean
): number {
  const stageImportance: Record<string, number> = {
    [TOURNAMENT_STAGES.GROUP]: 1,
    [TOURNAMENT_STAGES.ROUND_16]: 3,
    [TOURNAMENT_STAGES.QUARTER_FINAL]: 5,
    [TOURNAMENT_STAGES.SEMI_FINAL]: 7,
    [TOURNAMENT_STAGES.FINAL]: 10,
  };
  
  let score = stageImportance[stage] || 1;
  
  if (isElimination) {
    score *= 1.5;
  }
  
  return score;
}

/**
 * Calculates ROI (Return on Investment) for a participant
 */
export function calculateROI(investment: number, payout: number): number {
  if (investment === 0) return payout > 0 ? Infinity : 0;
  return ((payout - investment) / investment) * 100;
}

/**
 * Calculates compound probability (for multiple events)
 */
export function calculateCompoundProbability(probabilities: number[]): number {
  return probabilities.reduce((acc, prob) => acc * prob, 1);
}

/**
 * Calculates weighted average
 */
export function calculateWeightedAverage(
  values: number[],
  weights: number[]
): number {
  if (values.length !== weights.length || values.length === 0) {
    return 0;
  }
  
  const weightedSum = values.reduce((sum, value, index) => sum + value * weights[index], 0);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  return totalWeight === 0 ? 0 : weightedSum / totalWeight;
}