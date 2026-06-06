import { SweepstakeStatus, VALID_STATUS_TRANSITIONS, MINIMUM_PARTICIPANTS } from '../types/sweepstake-status';

export interface Participant {
  id: string;
  userId: string;
  sweepstakeId: string;
  joinedAt: Date;
  assignedTeam?: string;
}

export interface Tournament {
  id: string;
  name: string;
  status: 'upcoming' | 'active' | 'completed';
  startDate: Date;
  endDate: Date;
  teams: TournamentTeam[];
}

export interface TournamentTeam {
  id: string;
  name: string;
  code: string;
  flag?: string;
  eliminated?: boolean;
}

export interface Sweepstake {
  id: string;
  name: string;
  description?: string;
  status: SweepstakeStatus;
  tournamentId: string;
  createdBy: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  maxParticipants?: number;
  entryFee?: number;
  prizePool?: number;
  participants?: Participant[];
  tournament?: Tournament;
}

export class SweepstakeLifecycleService {
  /**
   * Validates if a sweepstake can transition to a new status
   */
  static validateStatusTransition(
    currentStatus: SweepstakeStatus, 
    newStatus: SweepstakeStatus
  ): { valid: boolean; reason?: string } {
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
    
    if (!validTransitions.includes(newStatus)) {
      return {
        valid: false,
        reason: `Cannot transition from ${currentStatus} to ${newStatus}`
      };
    }

    return { valid: true };
  }

  /**
   * Validates if a sweepstake can be started
   */
  static validateSweepstakeStart(
    sweepstake: Sweepstake,
    participants: Participant[],
    tournament: Tournament
  ): { valid: boolean; reason?: string } {
    // Check current status
    if (sweepstake.status !== SweepstakeStatus.CREATED) {
      return {
        valid: false,
        reason: `Sweepstake is already ${sweepstake.status}`
      };
    }

    // Check minimum participants
    if (participants.length < MINIMUM_PARTICIPANTS) {
      return {
        valid: false,
        reason: `Minimum ${MINIMUM_PARTICIPANTS} participants required. Current: ${participants.length}`
      };
    }

    // Check maximum participants if set
    if (sweepstake.maxParticipants && participants.length > sweepstake.maxParticipants) {
      return {
        valid: false,
        reason: `Maximum ${sweepstake.maxParticipants} participants allowed. Current: ${participants.length}`
      };
    }

    // Check tournament readiness
    if (!tournament) {
      return {
        valid: false,
        reason: 'Tournament not found'
      };
    }

    if (tournament.status === 'completed') {
      return {
        valid: false,
        reason: 'Tournament has already completed'
      };
    }

    // Check if tournament has enough teams for participants
    const availableTeams = tournament.teams.filter(team => !team.eliminated);
    if (availableTeams.length < participants.length) {
      return {
        valid: false,
        reason: `Not enough teams available. Teams: ${availableTeams.length}, Participants: ${participants.length}`
      };
    }

    return { valid: true };
  }

  /**
   * Assigns teams to participants randomly
   */
  static assignTeamsToParticipants(
    participants: Participant[],
    tournamentTeams: TournamentTeam[]
  ): Record<string, string> {
    const availableTeams = tournamentTeams.filter(team => !team.eliminated);
    const shuffledTeams = [...availableTeams].sort(() => Math.random() - 0.5);
    
    const assignments: Record<string, string> = {};
    
    participants.forEach((participant, index) => {
      if (index < shuffledTeams.length) {
        assignments[participant.userId] = shuffledTeams[index].id;
      }
    });

    return assignments;
  }

  /**
   * Creates a status transition record
   */
  static createStatusTransition(
    from: SweepstakeStatus,
    to: SweepstakeStatus,
    triggeredBy: string,
    reason?: string
  ): SweepstakeStatusTransition {
    return {
      from,
      to,
      timestamp: new Date(),
      triggeredBy,
      reason
    };
  }

  /**
   * Calculates leaderboard positions based on team performance
   */
  static calculateLeaderboard(
    participants: Participant[],
    tournamentTeams: TournamentTeam[]
  ): Array<{ userId: string; teamId: string; points: number; position: number }> {
    const leaderboard = participants.map(participant => {
      const team = tournamentTeams.find(t => t.id === participant.assignedTeam);
      let points = 0;
      
      // Basic scoring system - can be enhanced based on tournament rules
      if (team) {
        if (!team.eliminated) {
          points += 10; // Still in tournament
        }
        // Additional points can be added based on tournament progress
      }

      return {
        userId: participant.userId,
        teamId: participant.assignedTeam || '',
        points,
        position: 0 // Will be calculated after sorting
      };
    });

    // Sort by points and assign positions
    leaderboard.sort((a, b) => b.points - a.points);
    leaderboard.forEach((entry, index) => {
      entry.position = index + 1;
    });

    return leaderboard;
  }

  /**
   * Validates if user can start the sweepstake (must be creator)
   */
  static validateUserPermissions(
    sweepstake: Sweepstake,
    userId: string
  ): { valid: boolean; reason?: string } {
    if (sweepstake.createdBy !== userId) {
      return {
        valid: false,
        reason: 'Only the sweepstake creator can start it'
      };
    }

    return { valid: true };
  }

  /**
   * Gets the next valid statuses from current status
   */
  static getValidNextStatuses(currentStatus: SweepstakeStatus): SweepstakeStatus[] {
    return VALID_STATUS_TRANSITIONS[currentStatus] || [];
  }
}

export default SweepstakeLifecycleService;