import { 
  Sweepstake, 
  SweepstakeWithParticipants,
  SweepstakeParticipant,
  SweepstakeListItem,
  CreateSweepstakeInput,
  UpdateSweepstakeInput,
  JoinSweepstakeInput,
  StartSweepstakeInput,
  AssignTeamsInput,
  SweepstakeStatus,
  validateSweepstakeStatusTransition,
  canJoinSweepstake,
  canStartSweepstake,
  generateInviteCode,
} from '../schemas/sweepstake';

export interface SweepstakeFilters {
  status?: SweepstakeStatus[];
  tournament?: string;
  isPublic?: boolean;
  createdBy?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface SweepstakeServiceError {
  code: string;
  message: string;
  field?: string;
}

export class SweepstakeService {
  constructor(private db: DatabaseAdapter) {}

  async createSweepstake(
    input: CreateSweepstakeInput,
    createdBy: string
  ): Promise<{ success: true; data: Sweepstake } | { success: false; error: SweepstakeServiceError }> {
    try {
      // Validate tournament exists
      const tournament = await this.db.getTournament(input.tournament);
      if (!tournament) {
        return {
          success: false,
          error: {
            code: 'TOURNAMENT_NOT_FOUND',
            message: 'Tournament not found',
            field: 'tournament',
          },
        };
      }

      // Check if tournament is active/upcoming
      if (tournament.status === 'completed') {
        return {
          success: false,
          error: {
            code: 'TOURNAMENT_COMPLETED',
            message: 'Cannot create sweepstake for completed tournament',
            field: 'tournament',
          },
        };
      }

      // Generate invite code if sweepstake is public or doesn't require approval
      const inviteCode = input.settings.isPublic || !input.settings.requireApproval 
        ? generateInviteCode() 
        : null;

      const sweepstakeData = {
        id: crypto.randomUUID(),
        name: input.name,
        description: input.description || null,
        tournament: input.tournament,
        status: 'draft' as SweepstakeStatus,
        settings: input.settings,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: null,
        completedAt: null,
        inviteCode,
        participantCount: 0,
      };

      const sweepstake = await this.db.createSweepstake(sweepstakeData);
      
      return { success: true, data: sweepstake };
    } catch (error) {
      console.error('Error creating sweepstake:', error);
      return {
        success: false,
        error: {
          code: 'CREATION_FAILED',
          message: 'Failed to create sweepstake',
        },
      };
    }
  }

  async getSweepstake(
    id: string,
    userId?: string
  ): Promise<{ success: true; data: SweepstakeWithParticipants } | { success: false; error: SweepstakeServiceError }> {
    try {
      const sweepstake = await this.db.getSweepstakeWithParticipants(id);
      
      if (!sweepstake) {
        return {
          success: false,
          error: {
            code: 'SWEEPSTAKE_NOT_FOUND',
            message: 'Sweepstake not found',
          },
        };
      }

      // Check access permissions
      const hasAccess = this.canAccessSweepstake(sweepstake, userId);
      if (!hasAccess) {
        return {
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Access denied to this sweepstake',
          },
        };
      }

      return { success: true, data: sweepstake };
    } catch (error) {
      console.error('Error getting sweepstake:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch sweepstake',
        },
      };
    }
  }

  async getSweepstakeByInviteCode(
    inviteCode: string
  ): Promise<{ success: true; data: Sweepstake } | { success: false; error: SweepstakeServiceError }> {
    try {
      const sweepstake = await this.db.getSweepstakeByInviteCode(inviteCode);
      
      if (!sweepstake) {
        return {
          success: false,
          error: {
            code: 'INVALID_INVITE_CODE',
            message: 'Invalid invite code',
          },
        };
      }

      return { success: true, data: sweepstake };
    } catch (error) {
      console.error('Error getting sweepstake by invite code:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: 'Failed to fetch sweepstake',
        },
      };
    }
  }

  async listSweepstakes(
    filters: SweepstakeFilters = {},
    userId?: string
  ): Promise<{ success: true; data: SweepstakeListItem[]; total: number } | { success: false; error: SweepstakeServiceError }> {
    try {
      const result = await this.db.listSweepstakes(filters, userId);
      return { 
        success: true, 
        data: result.sweepstakes, 
        total: result.total 
      };
    } catch (error) {
      console.error('Error listing sweepstakes:', error);
      return {
        success: false,
        error: {
          code: 'LIST_FAILED',
          message: 'Failed to list sweepstakes',
        },
      };
    }
  }

  async updateSweepstake(
    input: UpdateSweepstakeInput,
    userId: string
  ): Promise<{ success: true; data: Sweepstake } | { success: false; error: SweepstakeServiceError }> {
    try {
      const existingSweepstake = await this.db.getSweepstake(input.id);
      
      if (!existingSweepstake) {
        return {
          success: false,
          error: {
            code: 'SWEEPSTAKE_NOT_FOUND',
            message: 'Sweepstake not found',
          },
        };
      }

      // Check ownership
      if (existingSweepstake.createdBy !== userId) {
        return {
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Only the creator can update this sweepstake',
          },
        };
      }

      // Validate status changes
      if (input.status && !validateSweepstakeStatusTransition(existingSweepstake.status, input.status)) {
        return {
          success: false,
          error: {
            code: 'INVALID_STATUS_TRANSITION',
            message: `Cannot change status from ${existingSweepstake.status} to ${input.status}`,
          },
        };
      }

      // Prevent certain updates after sweepstake has started
      if (['started', 'completed'].includes(existingSweepstake.status)) {
        const restrictedFields = ['tournament', 'settings'];
        const hasRestrictedUpdates = restrictedFields.some(field => input[field as keyof typeof input] !== undefined);
        
        if (hasRestrictedUpdates) {
          return {
            success: false,
            error: {
              code: 'UPDATE_RESTRICTED',
              message: 'Cannot update tournament or settings after sweepstake has started',
            },
          };
        }
      }

      const updatedData = {
        ...input,
        updatedAt: new Date(),
      };

      const updatedSweepstake = await this.db.updateSweepstake(input.id, updatedData);
      
      return { success: true, data: updatedSweepstake };
    } catch (error) {
      console.error('Error updating sweepstake:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: 'Failed to update sweepstake',
        },
      };
    }
  }

  async deleteSweepstake(
    id: string,
    userId: string
  ): Promise<{ success: true } | { success: false; error: SweepstakeServiceError }> {
    try {
      const sweepstake = await this.db.getSweepstake(id);
      
      if (!sweepstake) {
        return {
          success: false,
          error: {
            code: 'SWEEPSTAKE_NOT_FOUND',
            message: 'Sweepstake not found',
          },
        };
      }

      // Check ownership
      if (sweepstake.createdBy !== userId) {
        return {
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Only the creator can delete this sweepstake',
          },
        };
      }

      // Prevent deletion of started sweepstakes
      if (['started', 'completed'].includes(sweepstake.status)) {
        return {
          success: false,
          error: {
            code: 'DELETE_RESTRICTED',
            message: 'Cannot delete a started or completed sweepstake',
          },
        };
      }

      await this.db.deleteSweepstake(id);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting sweepstake:', error);
      return {
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: 'Failed to delete sweepstake',
        },
      };
    }
  }

  async joinSweepstake(
    input: JoinSweepstakeInput,
    userId: string,
    userName: string,
    userEmail: string
  ): Promise<{ success: true; data: SweepstakeParticipant } | { success: false; error: SweepstakeServiceError }> {
    try {
      let sweepstake: Sweepstake | null = null;

      // Get sweepstake by ID or invite code
      if (input.sweepstakeId) {
        sweepstake = await this.db.getSweepstake(input.sweepstakeId);
      } else if (input.inviteCode) {
        const result = await this.getSweepstakeByInviteCode(input.inviteCode);
        if (result.success) {
          sweepstake = result.data;
        }
      }

      if (!sweepstake) {
        return {
          success: false,
          error: {
            code: 'SWEEPSTAKE_NOT_FOUND',
            message: 'Sweepstake not found',
          },
        };
      }

      // Check if user can join
      if (!canJoinSweepstake(sweepstake)) {
        const reasons = [];
        if (sweepstake.status !== 'open') reasons.push('not accepting participants');
        if (sweepstake.participantCount >= sweepstake.settings.maxParticipants) reasons.push('full');
        
        return {
          success: false,
          error: {
            code: 'CANNOT_JOIN',
            message: `Cannot join sweepstake: ${reasons.join(', ')}`,
          },
        };
      }

      // Check if user is already a participant
      const existingParticipant = await this.db.getSweepstakeParticipant(sweepstake.id, userId);
      if (existingParticipant) {
        return {
          success: false,
          error: {
            code: 'ALREADY_PARTICIPANT',
            message: 'You are already a participant in this sweepstake',
          },
        };
      }

      const participantData = {
        id: crypto.randomUUID(),
        sweepstakeId: sweepstake.id,
        userId,
        userName,
        userEmail,
        joinedAt: new Date(),
        isApproved: !sweepstake.settings.requireApproval,
        assignedTeam: null,
      };

      const participant = await this.db.createSweepstakeParticipant(participantData);
      
      // Update participant count
      await this.db.updateSweepstake(sweepstake.id, {
        participantCount: sweepstake.participantCount + 1,
        updatedAt: new Date(),
      });

      return { success: true, data: participant };
    } catch (error) {
      console.error('Error joining sweepstake:', error);
      return {
        success: false,
        error: {
          code: 'JOIN_FAILED',
          message: 'Failed to join sweepstake',
        },
      };
    }
  }

  async startSweepstake(
    input: StartSweepstakeInput,
    userId: string
  ): Promise<{ success: true; data: SweepstakeWithParticipants } | { success: false; error: SweepstakeServiceError }> {
    try {
      const sweepstakeResult = await this.getSweepstake(input.id);
      if (!sweepstakeResult.success) {
        return sweepstakeResult;
      }

      const sweepstake = sweepstakeResult.data;

      // Check ownership
      if (sweepstake.createdBy !== userId) {
        return {
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Only the creator can start this sweepstake',
          },
        };
      }

      // Check if sweepstake can be started
      if (!canStartSweepstake(sweepstake)) {
        const reasons = [];
        if (!['open', 'closed'].includes(sweepstake.status)) reasons.push('invalid status');
        if (sweepstake.participants.length < 2) reasons.push('not enough participants');
        if (!sweepstake.settings.autoAssignTeams && sweepstake.participants.some(p => !p.assignedTeam)) {
          reasons.push('teams not assigned');
        }
        
        return {
          success: false,
          error: {
            code: 'CANNOT_START',
            message: `Cannot start sweepstake: ${reasons.join(', ')}`,
          },
        };
      }

      // Auto-assign teams if needed
      if (sweepstake.settings.autoAssignTeams) {
        const assignResult = await this.autoAssignTeams(sweepstake);
        if (!assignResult.success) {
          return assignResult;
        }
      }

      // Update sweepstake status
      const updatedSweepstake = await this.db.updateSweepstake(input.id, {
        status: 'started',
        startedAt: new Date(),
        updatedAt: new Date(),
      });

      const finalResult = await this.getSweepstake(input.id);
      return finalResult;
    } catch (error) {
      console.error('Error starting sweepstake:', error);
      return {
        success: false,
        error: {
          code: 'START_FAILED',
          message: 'Failed to start sweepstake',
        },
      };
    }
  }

  private async autoAssignTeams(
    sweepstake: SweepstakeWithParticipants
  ): Promise<{ success: true } | { success: false; error: SweepstakeServiceError }> {
    try {
      // Get available teams for tournament
      const tournament = await this.db.getTournament(sweepstake.tournament);
      if (!tournament || !tournament.teams) {
        return {
          success: false,
          error: {
            code: 'NO_TEAMS_AVAILABLE',
            message: 'No teams available for assignment',
          },
        };
      }

      const availableTeams = [...tournament.teams];
      const participants = [...sweepstake.participants];
      
      // Shuffle arrays for random assignment
      for (let i = availableTeams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableTeams[i], availableTeams[j]] = [availableTeams[j], availableTeams[i]];
      }

      // Assign teams to participants
      const assignments: Record<string, string> = {};
      participants.forEach((participant, index) => {
        if (index < availableTeams.length) {
          assignments[participant.userId] = availableTeams[index].id;
        }
      });

      await this.assignTeams({ sweepstakeId: sweepstake.id, assignments });
      
      return { success: true };
    } catch (error) {
      console.error('Error auto-assigning teams:', error);
      return {
        success: false,
        error: {
          code: 'AUTO_ASSIGN_FAILED',
          message: 'Failed to auto-assign teams',
        },
      };
    }
  }

  async assignTeams(
    input: AssignTeamsInput
  ): Promise<{ success: true } | { success: false; error: SweepstakeServiceError }> {
    try {
      if (!input.assignments) {
        return { success: true };
      }

      const updatePromises = Object.entries(input.assignments).map(([userId, teamId]) =>
        this.db.updateSweepstakeParticipant(input.sweepstakeId, userId, {
          assignedTeam: teamId,
        })
      );

      await Promise.all(updatePromises);
      
      return { success: true };
    } catch (error) {
      console.error('Error assigning teams:', error);
      return {
        success: false,
        error: {
          code: 'ASSIGN_FAILED',
          message: 'Failed to assign teams',
        },
      };
    }
  }

  private canAccessSweepstake(sweepstake: SweepstakeWithParticipants, userId?: string): boolean {
    // Public sweepstakes can be accessed by anyone
    if (sweepstake.settings.isPublic) return true;
    
    // Creator can always access
    if (userId && sweepstake.createdBy === userId) return true;
    
    // Participants can access
    if (userId && sweepstake.participants.some(p => p.userId === userId)) return true;
    
    return false;
  }
}

// Database adapter interface that needs to be implemented
export interface DatabaseAdapter {
  // Tournament operations
  getTournament(id: string): Promise<Tournament | null>;
  
  // Sweepstake operations
  createSweepstake(data: Omit<Sweepstake, 'participantCount'>): Promise<Sweepstake>;
  getSweepstake(id: string): Promise<Sweepstake | null>;
  getSweepstakeWithParticipants(id: string): Promise<SweepstakeWithParticipants | null>;
  getSweepstakeByInviteCode(inviteCode: string): Promise<Sweepstake | null>;
  updateSweepstake(id: string, data: Partial<Sweepstake>): Promise<Sweepstake>;
  deleteSweepstake(id: string): Promise<void>;
  listSweepstakes(filters: SweepstakeFilters, userId?: string): Promise<{
    sweepstakes: SweepstakeListItem[];
    total: number;
  }>;
  
  // Participant operations
  createSweepstakeParticipant(data: SweepstakeParticipant): Promise<SweepstakeParticipant>;
  getSweepstakeParticipant(sweepstakeId: string, userId: string): Promise<SweepstakeParticipant | null>;
  updateSweepstakeParticipant(sweepstakeId: string, userId: string, data: Partial<SweepstakeParticipant>): Promise<SweepstakeParticipant>;
}

interface Tournament {
  id: string;
  name: string;
  status: 'upcoming' | 'active' | 'completed';
  teams?: Array<{ id: string; name: string; }>;
}