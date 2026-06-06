export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  code: string; // 3-letter country code (e.g., "ENG", "BRA")
  flag: string; // URL to flag image
  group: string; // Group letter (A-H)
  eliminated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sweepstake {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  creator?: User;
  code: string; // 6-character join code
  maxParticipants: number;
  isActive: boolean;
  isComplete: boolean;
  drawCompleted: boolean;
  drawDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  participants?: Participant[];
  teams?: Team[];
}

export interface Participant {
  id: string;
  sweepstakeId: string;
  sweepstake?: Sweepstake;
  userId: string;
  user?: User;
  teamId?: string;
  team?: Team;
  position?: number;
  joinedAt: Date;
}

export interface Match {
  id: string;
  homeTeamId: string;
  homeTeam?: Team;
  awayTeamId: string;
  awayTeam?: Team;
  homeScore?: number;
  awayScore?: number;
  matchDate: Date;
  venue: string;
  stage: MatchStage;
  group?: string;
  isCompleted: boolean;
  winnerId?: string;
  winner?: Team;
  createdAt: Date;
  updatedAt: Date;
}

export type MatchStage = 
  | 'GROUP_STAGE'
  | 'ROUND_OF_16'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'THIRD_PLACE'
  | 'FINAL';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  sweepstakeId?: string;
  createdAt: Date;
}

export type NotificationType = 
  | 'SWEEPSTAKE_INVITE'
  | 'SWEEPSTAKE_JOINED'
  | 'DRAW_COMPLETED'
  | 'MATCH_RESULT'
  | 'TOURNAMENT_UPDATE'
  | 'SYSTEM';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Form types
export interface CreateSweepstakeForm {
  name: string;
  description?: string;
  maxParticipants: number;
}

export interface JoinSweepstakeForm {
  code: string;
}

// Tournament standings
export interface TeamStanding {
  teamId: string;
  team: Team;
  participantId: string;
  participant: Participant;
  points: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  isEliminated: boolean;
  eliminatedAt?: Date;
}

export interface SweepstakeLeaderboard {
  sweepstakeId: string;
  standings: TeamStanding[];
  lastUpdated: Date;
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  data: unknown;
  timestamp: Date;
}

export interface MatchUpdateMessage extends WebSocketMessage {
  type: 'MATCH_UPDATE';
  data: {
    matchId: string;
    homeScore: number;
    awayScore: number;
    isCompleted: boolean;
    winnerId?: string;
  };
}

export interface SweepstakeUpdateMessage extends WebSocketMessage {
  type: 'SWEEPSTAKE_UPDATE';
  data: {
    sweepstakeId: string;
    updateType: 'PARTICIPANT_JOINED' | 'DRAW_COMPLETED' | 'STANDINGS_UPDATED';
    payload: unknown;
  };
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  details?: ValidationError[];
}