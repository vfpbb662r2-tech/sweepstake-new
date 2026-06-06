import { 
  CreateSweepstakeInput,
  UpdateSweepstakeInput,
  JoinSweepstakeInput,
  StartSweepstakeInput,
  AssignTeamsInput,
  Sweepstake,
  SweepstakeWithParticipants,
  SweepstakeParticipant,
  SweepstakeListItem,
  SweepstakeFilters,
} from '@sweepstakes/shared/schemas/sweepstake';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
}

interface ListResponse<T> extends ApiResponse<T> {
  total?: number;
}

class SweepstakeApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'SweepstakeApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401) {
      // Handle authentication error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
      }
      throw new SweepstakeApiError('UNAUTHORIZED', 'Authentication required');
    }

    const errorData = await response.json().catch(() => ({}));
    throw new SweepstakeApiError(
      errorData.code || 'API_ERROR',
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      errorData.field
    );
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new SweepstakeApiError(
      data.error?.code || 'API_ERROR',
      data.error?.message || 'An error occurred',
      data.error?.field
    );
  }

  return data.data;
}

export const sweepstakeApi = {
  /**
   * Create a new sweepstake
   */
  async create(input: CreateSweepstakeInput): Promise<Sweepstake> {
    return apiRequest<Sweepstake>('/sweepstakes', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Get a sweepstake by ID
   */
  async get(id: string): Promise<SweepstakeWithParticipants> {
    return apiRequest<SweepstakeWithParticipants>(`/sweepstakes/${id}`);
  },

  /**
   * Get a sweepstake by invite code
   */
  async getByInviteCode(inviteCode: string): Promise<Sweepstake> {
    return apiRequest<Sweepstake>(`/sweepstakes/invite/${encodeURIComponent(inviteCode)}`);
  },

  /**
   * List sweepstakes with filters
   */
  async list(filters: SweepstakeFilters = {}): Promise<{
    sweepstakes: SweepstakeListItem[];
    total: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters.status?.length) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters.tournament) params.set('tournament', filters.tournament);
    if (filters.isPublic !== undefined) params.set('isPublic', filters.isPublic.toString());
    if (filters.createdBy) params.set('createdBy', filters.createdBy);
    if (filters.search) params.set('search', filters.search);
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.offset) params.set('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = `/sweepstakes${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      sweepstakes: SweepstakeListItem[];
      total: number;
    }>(url);
  },

  /**
   * Update a sweepstake
   */
  async update(input: UpdateSweepstakeInput): Promise<Sweepstake> {
    return apiRequest<Sweepstake>(`/sweepstakes/${input.id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  /**
   * Delete a sweepstake
   */
  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/sweepstakes/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Join a sweepstake
   */
  async join(input: JoinSweepstakeInput): Promise<SweepstakeParticipant> {
    return apiRequest<SweepstakeParticipant>('/sweepstakes/join', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Leave a sweepstake
   */
  async leave(sweepstakeId: string): Promise<void> {
    await apiRequest<void>(`/sweepstakes/${sweepstakeId}/leave`, {
      method: 'DELETE',
    });
  },

  /**
   * Start a sweepstake
   */
  async start(input: StartSweepstakeInput): Promise<SweepstakeWithParticipants> {
    return apiRequest<SweepstakeWithParticipants>(`/sweepstakes/${input.id}/start`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Assign teams to participants
   */
  async assignTeams(input: AssignTeamsInput): Promise<void> {
    await apiRequest<void>(`/sweepstakes/${input.sweepstakeId}/assign-teams`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Approve a participant (for sweepstakes requiring approval)
   */
  async approveParticipant(sweepstakeId: string, userId: string): Promise<void> {
    await apiRequest<void>(`/sweepstakes/${sweepstakeId}/participants/${userId}/approve`, {
      method: 'POST',
    });
  },

  /**
   * Remove a participant
   */
  async removeParticipant(sweepstakeId: string, userId: string): Promise<void> {
    await apiRequest<void>(`/sweepstakes/${sweepstakeId}/participants/${userId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get sweepstakes the current user has joined
   */
  async getMySweepstakes(filters: Omit<SweepstakeFilters, 'createdBy'> = {}): Promise<{
    sweepstakes: SweepstakeListItem[];
    total: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters.status?.length) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters.tournament) params.set('tournament', filters.tournament);
    if (filters.search) params.set('search', filters.search);
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.offset) params.set('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = `/sweepstakes/my${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      sweepstakes: SweepstakeListItem[];
      total: number;
    }>(url);
  },

  /**
   * Get sweepstakes created by the current user
   */
  async getMyCreatedSweepstakes(filters: Omit<SweepstakeFilters, 'createdBy'> = {}): Promise<{
    sweepstakes: SweepstakeListItem[];
    total: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters.status?.length) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters.tournament) params.set('tournament', filters.tournament);
    if (filters.search) params.set('search', filters.search);
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.offset) params.set('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = `/sweepstakes/created${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      sweepstakes: SweepstakeListItem[];
      total: number;
    }>(url);
  },

  /**
   * Generate a new invite code for a sweepstake
   */
  async generateInviteCode(sweepstakeId: string): Promise<{ inviteCode: string }> {
    return apiRequest<{ inviteCode: string }>(`/sweepstakes/${sweepstakeId}/invite-code`, {
      method: 'POST',
    });
  },

  /**
   * Disable the current invite code for a sweepstake
   */
  async disableInviteCode(sweepstakeId: string): Promise<void> {
    await apiRequest<void>(`/sweepstakes/${sweepstakeId}/invite-code`, {
      method: 'DELETE',
    });
  },

  /**
   * Search public sweepstakes
   */
  async searchPublic(query: string, limit: number = 20): Promise<SweepstakeListItem[]> {
    const params = new URLSearchParams({
      search: query,
      isPublic: 'true',
      limit: limit.toString(),
    });

    const result = await apiRequest<{
      sweepstakes: SweepstakeListItem[];
      total: number;
    }>(`/sweepstakes/search?${params.toString()}`);

    return result.sweepstakes;
  },
};

// Re-export the error class for use in components
export { SweepstakeApiError };

// Helper functions for common operations
export const sweepstakeHelpers = {
  /**
   * Check if a user can join a sweepstake
   */
  canJoin: (sweepstake: Sweepstake): boolean => {
    return sweepstake.status === 'open' && 
           sweepstake.participantCount < sweepstake.settings.maxParticipants;
  },

  /**
   * Check if a sweepstake can be started
   */
  canStart: (sweepstake: SweepstakeWithParticipants): boolean => {
    if (!['open', 'closed'].includes(sweepstake.status)) return false;
    if (sweepstake.participants.length < 2) return false;
    
    // If manual team assignment is required, check all participants have teams
    if (!sweepstake.settings.autoAssignTeams) {
      return sweepstake.participants.every(p => p.assignedTeam !== null);
    }
    
    return true;
  },

  /**
   * Get the status color for UI display
   */
  getStatusColor: (status: string): string => {
    switch (status) {
      case 'draft': return 'gray';
      case 'open': return 'green';
      case 'closed': return 'orange';
      case 'started': return 'blue';
      case 'completed': return 'purple';
      default: return 'gray';
    }
  },

  /**
   * Format participant count display
   */
  formatParticipantCount: (current: number, max: number): string => {
    return `${current}/${max} participants`;
  },

  /**
   * Get the sweepstake URL for sharing
   */
  getSweepstakeUrl: (sweepstake: Sweepstake): string => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      if (sweepstake.inviteCode) {
        return `${baseUrl}/join/${sweepstake.inviteCode}`;
      }
      return `${baseUrl}/sweepstakes/${sweepstake.id}`;
    }
    return '';
  },
};

// Type guards for runtime type checking
export const sweepstakeTypeGuards = {
  isValidStatus: (status: string): boolean => {
    return ['draft', 'open', 'closed', 'started', 'completed'].includes(status);
  },

  hasParticipants: (sweepstake: any): sweepstake is SweepstakeWithParticipants => {
    return sweepstake && Array.isArray(sweepstake.participants);
  },

  isParticipant: (sweepstake: SweepstakeWithParticipants, userId: string): boolean => {
    return sweepstake.participants.some(p => p.userId === userId);
  },

  isCreator: (sweepstake: Sweepstake, userId: string): boolean => {
    return sweepstake.createdBy === userId;
  },
};