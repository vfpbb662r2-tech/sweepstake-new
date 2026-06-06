import { Database } from '../types/database';

// Type aliases for better readability
type DbUser = Database['public']['Tables']['users']['Row'];
type DbSweepstake = Database['public']['Tables']['sweepstakes']['Row'];
type DbTeam = Database['public']['Tables']['teams']['Row'];
type DbTournament = Database['public']['Tables']['tournaments']['Row'];
type DbMatch = Database['public']['Tables']['matches']['Row'];
type DbParticipant = Database['public']['Tables']['participants']['Row'];

/**
 * Transforms database user to client-safe format
 */
export function transformUser(dbUser: DbUser) {
  return {
    id: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.display_name,
    avatarUrl: dbUser.avatar_url,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
  };
}

/**
 * Transforms database sweepstake to client format
 */
export function transformSweepstake(dbSweepstake: DbSweepstake & {
  creator?: DbUser;
  tournament?: DbTournament;
  participants?: DbParticipant[];
}) {
  return {
    id: dbSweepstake.id,
    name: dbSweepstake.name,
    description: dbSweepstake.description,
    creatorId: dbSweepstake.creator_id,
    tournamentId: dbSweepstake.tournament_id,
    entryFee: dbSweepstake.entry_fee,
    maxParticipants: dbSweepstake.max_participants,
    currentParticipants: dbSweepstake.participants?.length || 0,
    status: dbSweepstake.status,
    isPublic: dbSweepstake.is_public,
    joinCode: dbSweepstake.join_code,
    prizePayout: dbSweepstake.prize_payout,
    createdAt: dbSweepstake.created_at,
    updatedAt: dbSweepstake.updated_at,
    creator: dbSweepstake.creator ? transformUser(dbSweepstake.creator) : undefined,
    tournament: dbSweepstake.tournament ? transformTournament(dbSweepstake.tournament) : undefined,
  };
}

/**
 * Transforms database tournament to client format
 */
export function transformTournament(dbTournament: DbTournament) {
  return {
    id: dbTournament.id,
    name: dbTournament.name,
    year: dbTournament.year,
    startDate: dbTournament.start_date,
    endDate: dbTournament.end_date,
    location: dbTournament.location,
    status: dbTournament.status,
    logoUrl: dbTournament.logo_url,
    createdAt: dbTournament.created_at,
    updatedAt: dbTournament.updated_at,
  };
}

/**
 * Transforms database team to client format
 */
export function transformTeam(dbTeam: DbTeam) {
  return {
    id: dbTeam.id,
    name: dbTeam.name,
    country: dbTeam.country,
    flagUrl: dbTeam.flag_url,
    fifaRanking: dbTeam.fifa_ranking,
    isEliminated: dbTeam.is_eliminated,
    createdAt: dbTeam.created_at,
    updatedAt: dbTeam.updated_at,
  };
}

/**
 * Transforms database match to client format
 */
export function transformMatch(dbMatch: DbMatch & {
  home_team?: DbTeam;
  away_team?: DbTeam;
  tournament?: DbTournament;
}) {
  return {
    id: dbMatch.id,
    tournamentId: dbMatch.tournament_id,
    homeTeamId: dbMatch.home_team_id,
    awayTeamId: dbMatch.away_team_id,
    scheduledAt: dbMatch.scheduled_at,
    homeScore: dbMatch.home_score,
    awayScore: dbMatch.away_score,
    status: dbMatch.status,
    stage: dbMatch.stage,
    groupName: dbMatch.group_name,
    createdAt: dbMatch.created_at,
    updatedAt: dbMatch.updated_at,
    homeTeam: dbMatch.home_team ? transformTeam(dbMatch.home_team) : undefined,
    awayTeam: dbMatch.away_team ? transformTeam(dbMatch.away_team) : undefined,
    tournament: dbMatch.tournament ? transformTournament(dbMatch.tournament) : undefined,
  };
}

/**
 * Transforms database participant to client format
 */
export function transformParticipant(dbParticipant: DbParticipant & {
  user?: DbUser;
  team?: DbTeam;
  sweepstake?: DbSweepstake;
}) {
  return {
    id: dbParticipant.id,
    sweepstakeId: dbParticipant.sweepstake_id,
    userId: dbParticipant.user_id,
    teamId: dbParticipant.team_id,
    joinedAt: dbParticipant.joined_at,
    user: dbParticipant.user ? transformUser(dbParticipant.user) : undefined,
    team: dbParticipant.team ? transformTeam(dbParticipant.team) : undefined,
    sweepstake: dbParticipant.sweepstake ? transformSweepstake(dbParticipant.sweepstake) : undefined,
  };
}

/**
 * Transforms client user input to database format
 */
export function transformUserToDb(user: {
  email: string;
  displayName: string;
  avatarUrl?: string;
}) {
  return {
    email: user.email,
    display_name: user.displayName,
    avatar_url: user.avatarUrl,
  };
}

/**
 * Transforms client sweepstake input to database format
 */
export function transformSweepstakeToDb(sweepstake: {
  name: string;
  description?: string;
  creatorId: string;
  tournamentId: string;
  entryFee: number;
  maxParticipants: number;
  isPublic: boolean;
  joinCode?: string;
}) {
  return {
    name: sweepstake.name,
    description: sweepstake.description,
    creator_id: sweepstake.creatorId,
    tournament_id: sweepstake.tournamentId,
    entry_fee: sweepstake.entryFee,
    max_participants: sweepstake.maxParticipants,
    is_public: sweepstake.isPublic,
    join_code: sweepstake.joinCode,
  };
}

/**
 * Transforms client tournament input to database format
 */
export function transformTournamentToDb(tournament: {
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  location: string;
  logoUrl?: string;
}) {
  return {
    name: tournament.name,
    year: tournament.year,
    start_date: tournament.startDate,
    end_date: tournament.endDate,
    location: tournament.location,
    logo_url: tournament.logoUrl,
  };
}

/**
 * Transforms client team input to database format
 */
export function transformTeamToDb(team: {
  name: string;
  country: string;
  flagUrl?: string;
  fifaRanking?: number;
}) {
  return {
    name: team.name,
    country: team.country,
    flag_url: team.flagUrl,
    fifa_ranking: team.fifaRanking,
  };
}

/**
 * Transforms client match input to database format
 */
export function transformMatchToDb(match: {
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  scheduledAt: string;
  stage: string;
  groupName?: string;
}) {
  return {
    tournament_id: match.tournamentId,
    home_team_id: match.homeTeamId,
    away_team_id: match.awayTeamId,
    scheduled_at: match.scheduledAt,
    stage: match.stage,
    group_name: match.groupName,
  };
}

/**
 * Transforms camelCase object to snake_case for database
 */
export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  
  return result;
}

/**
 * Transforms snake_case object to camelCase for client
 */
export function toCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  
  return result;
}

/**
 * Transforms array of database objects to client format
 */
export function transformArray<T, U>(
  array: T[],
  transformer: (item: T) => U
): U[] {
  return array.map(transformer);
}

/**
 * Transforms pagination metadata
 */
export function transformPagination(meta: {
  total_count: number;
  page_size: number;
  current_page: number;
  total_pages: number;
}) {
  return {
    totalCount: meta.total_count,
    pageSize: meta.page_size,
    currentPage: meta.current_page,
    totalPages: meta.total_pages,
    hasNextPage: meta.current_page < meta.total_pages,
    hasPreviousPage: meta.current_page > 1,
  };
}