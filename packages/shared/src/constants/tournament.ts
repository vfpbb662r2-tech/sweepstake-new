/**
 * Tournament types
 */
export const TOURNAMENT_TYPES = {
  WORLD_CUP: 'world_cup',
  EUROS: 'euros',
  COPA_AMERICA: 'copa_america',
  CUSTOM: 'custom',
} as const;

/**
 * Tournament status values
 */
export const TOURNAMENT_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

/**
 * Match stages
 */
export const MATCH_STAGES = {
  GROUP: 'group',
  ROUND_OF_16: 'round_of_16',
  QUARTER_FINAL: 'quarter_final',
  SEMI_FINAL: 'semi_final',
  THIRD_PLACE: 'third_place',
  FINAL: 'final',
} as const;

/**
 * Match status values
 */
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  COMPLETED: 'completed',
  POSTPONED: 'postponed',
  CANCELLED: 'cancelled',
} as const;

/**
 * World Cup 2022 groups
 */
export const WORLD_CUP_GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

/**
 * Tournament type labels
 */
export const TOURNAMENT_TYPE_LABELS = {
  [TOURNAMENT_TYPES.WORLD_CUP]: 'FIFA World Cup',
  [TOURNAMENT_TYPES.EUROS]: 'UEFA European Championship',
  [TOURNAMENT_TYPES.COPA_AMERICA]: 'Copa América',
  [TOURNAMENT_TYPES.CUSTOM]: 'Custom Tournament',
} as const;

/**
 * Tournament status labels
 */
export const TOURNAMENT_STATUS_LABELS = {
  [TOURNAMENT_STATUS.UPCOMING]: 'Upcoming',
  [TOURNAMENT_STATUS.ACTIVE]: 'Active',
  [TOURNAMENT_STATUS.COMPLETED]: 'Completed',
  [TOURNAMENT_STATUS.CANCELLED]: 'Cancelled',
} as const;

/**
 * Match stage labels
 */
export const MATCH_STAGE_LABELS = {
  [MATCH_STAGES.GROUP]: 'Group Stage',
  [MATCH_STAGES.ROUND_OF_16]: 'Round of 16',
  [MATCH_STAGES.QUARTER_FINAL]: 'Quarter Final',
  [MATCH_STAGES.SEMI_FINAL]: 'Semi Final',
  [MATCH_STAGES.THIRD_PLACE]: 'Third Place',
  [MATCH_STAGES.FINAL]: 'Final',
} as const;

/**
 * Match status labels
 */
export const MATCH_STATUS_LABELS = {
  [MATCH_STATUS.SCHEDULED]: 'Scheduled',
  [MATCH_STATUS.LIVE]: 'Live',
  [MATCH_STATUS.COMPLETED]: 'Completed',
  [MATCH_STATUS.POSTPONED]: 'Postponed',
  [MATCH_STATUS.CANCELLED]: 'Cancelled',
} as const;

/**
 * Points system for tournament standings
 */
export const POINTS_SYSTEM = {
  WIN: 3,
  DRAW: 1,
  LOSS: 0,
} as const;

/**
 * Tournament defaults
 */
export const TOURNAMENT_DEFAULTS = {
  MAX_TEAMS: 32,
  GROUP_SIZE: 4,
  GROUPS_COUNT: 8,
  MATCHES_PER_TEAM_GROUP_STAGE: 3,
  KNOCKOUT_ROUNDS: 4, // Round of 16, Quarter, Semi, Final
} as const;

/**
 * Common FIFA country codes
 */
export const FIFA_COUNTRIES = {
  ARG: 'Argentina',
  AUS: 'Australia',
  BEL: 'Belgium',
  BRA: 'Brazil',
  CAN: 'Canada',
  CRO: 'Croatia',
  DEN: 'Denmark',
  ECU: 'Ecuador',
  ENG: 'England',
  ESP: 'Spain',
  FRA: 'France',
  GER: 'Germany',
  GHA: 'Ghana',
  IRN: 'Iran',
  JPN: 'Japan',
  KOR: 'South Korea',
  MAR: 'Morocco',
  MEX: 'Mexico',
  NED: 'Netherlands',
  POL: 'Poland',
  POR: 'Portugal',
  QAT: 'Qatar',
  KSA: 'Saudi Arabia',
  SEN: 'Senegal',
  SRB: 'Serbia',
  SUI: 'Switzerland',
  TUN: 'Tunisia',
  URU: 'Uruguay',
  USA: 'United States',
  WAL: 'Wales',
} as const;

/**
 * Tournament configuration
 */
export const TOURNAMENT_CONFIG = {
  // Group stage
  GROUP_STAGE_TEAMS: 32,
  TEAMS_PER_GROUP: 4,
  GROUP_MATCHES: 6, // Per group
  
  // Knockout stage
  ROUND_OF_16_TEAMS: 16,
  QUARTER_FINAL_TEAMS: 8,
  SEMI_FINAL_TEAMS: 4,
  FINAL_TEAMS: 2,
  
  // Match durations
  GROUP_MATCH_DURATION: 90, // minutes
  KNOCKOUT_MATCH_DURATION: 90, // minutes (plus potential extra time)
  EXTRA_TIME_DURATION: 30, // minutes
  
  // Schedule
  MATCHES_PER_DAY_MAX: 4,
  REST_DAYS_BETWEEN_MATCHES: 3,
  
  // Scoring
  GOALS_FOR_TIEBREAKER: true,
  GOAL_DIFFERENCE_TIEBREAKER: true,
  HEAD_TO_HEAD_TIEBREAKER: true,
} as const;