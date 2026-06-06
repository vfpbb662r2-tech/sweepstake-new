/**
 * Sweepstake status values
 */
export const SWEEPSTAKE_STATUS = {
  SETUP: 'setup',
  OPEN: 'open',
  CLOSED: 'closed',
  DRAWN: 'drawn',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

/**
 * Payment status values
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

/**
 * Invite status values
 */
export const INVITE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
} as const;

/**
 * Sweepstake status labels
 */
export const SWEEPSTAKE_STATUS_LABELS = {
  [SWEEPSTAKE_STATUS.SETUP]: 'Setup',
  [SWEEPSTAKE_STATUS.OPEN]: 'Open for Entries',
  [SWEEPSTAKE_STATUS.CLOSED]: 'Closed',
  [SWEEPSTAKE_STATUS.DRAWN]: 'Teams Drawn',
  [SWEEPSTAKE_STATUS.ACTIVE]: 'Active',
  [SWEEPSTAKE_STATUS.COMPLETED]: 'Completed',
  [SWEEPSTAKE_STATUS.CANCELLED]: 'Cancelled',
} as const;

/**
 * Payment status labels
 */
export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Payment Pending',
  [PAYMENT_STATUS.PAID]: 'Paid',
  [PAYMENT_STATUS.REFUNDED]: 'Refunded',
  [PAYMENT_STATUS.CANCELLED]: 'Cancelled',
} as const;

/**
 * Invite status labels
 */
export const INVITE_STATUS_LABELS = {
  [INVITE_STATUS.PENDING]: 'Pending',
  [INVITE_STATUS.ACCEPTED]: 'Accepted',
  [INVITE_STATUS.DECLINED]: 'Declined',
  [INVITE_STATUS.EXPIRED]: 'Expired',
} as const;

/**
 * Default prize distributions
 */
export const DEFAULT_PRIZE_DISTRIBUTIONS = {
  WINNER_TAKES_ALL: { winner: 100 },
  TWO_PLACE: { winner: 70, runnerUp: 30 },
  THREE_PLACE: { winner: 50, runnerUp: 30, thirdPlace: 20 },
} as const;

/**
 * Sweepstake configuration limits
 */
export const SWEEPSTAKE_LIMITS = {
  MIN_PARTICIPANTS: 2,
  MAX_PARTICIPANTS: 1000,
  MIN_ENTRY_FEE: 0,
  MAX_ENTRY_FEE: 10000,
  INVITE_CODE_LENGTH: 8,
  INVITE_EXPIRY_DAYS: 7,
  MAX_INVITES_PER_BATCH: 50,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
} as const;

/**
 * Draw methods
 */
export const DRAW_METHODS = {
  RANDOM: 'random',
  MANUAL: 'manual',
} as const;

/**
 * Draw method labels
 */
export const DRAW_METHOD_LABELS = {
  [DRAW_METHODS.RANDOM]: 'Random Draw',
  [DRAW_METHODS.MANUAL]: 'Manual Assignment',
} as const;

/**
 * Sweepstake types
 */
export const SWEEPSTAKE_TYPES = {
  STANDARD: 'standard',
  PREMIUM: 'premium',
  CHARITY: 'charity',
} as const;

/**
 * Notification types for sweepstakes
 */
export const SWEEPSTAKE_NOTIFICATIONS = {
  INVITE_RECEIVED: 'invite_received',
  PARTICIPANT_JOINED: 'participant_joined',
  DRAW_COMPLETED: 'draw_completed',
  TOURNAMENT_STARTED: 'tournament_started',
  TEAM_MATCH_RESULT: 'team_match_result',
  LEADERBOARD_UPDATE: 'leaderboard_update',
  SWEEPSTAKE_COMPLETED: 'sweepstake_completed',
  PAYMENT_REMINDER: 'payment_reminder',
} as const;

/**
 * Sweepstake sorting options
 */
export const SWEEPSTAKE_SORT_OPTIONS = {
  CREATED_DATE_DESC: 'created_at_desc',
  CREATED_DATE_ASC: 'created_at_asc',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  PARTICIPANTS_DESC: 'participants_desc',
  PARTICIPANTS_ASC: 'participants_asc',
  ENTRY_FEE_DESC: 'entry_fee_desc',
  ENTRY_FEE_ASC: 'entry_fee_asc',
  STATUS: 'status',
} as const;

/**
 * Leaderboard scoring system
 */
export const LEADERBOARD_SCORING = {
  GROUP_STAGE_WIN: 3,
  GROUP_STAGE_DRAW: 1,
  KNOCKOUT_WIN: 5,
  REACHING_ROUND_16: 2,
  REACHING_QUARTER: 3,
  REACHING_SEMI: 5,
  REACHING_FINAL: 8,
  WINNING_TOURNAMENT: 10,
} as const;

/**
 * Sweepstake permissions
 */
export const SWEEPSTAKE_PERMISSIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  MANAGE_PARTICIPANTS: 'manage_participants',
  CONDUCT_DRAW: 'conduct_draw',
  VIEW_PAYMENTS: 'view_payments',
  SEND_INVITES: 'send_invites',
} as const;

/**
 * Default sweepstake settings
 */
export const DEFAULT_SWEEPSTAKE_SETTINGS = {
  IS_PUBLIC: false,
  AUTO_DRAW: false,
  ALLOW_LATE_ENTRIES: false,
  REQUIRE_PAYMENT: false,
  SEND_NOTIFICATIONS: true,
  SHOW_LEADERBOARD: true,
  ALLOW_COMMENTS: true,
} as const;

/**
 * Sweepstake activity types
 */
export const SWEEPSTAKE_ACTIVITIES = {
  CREATED: 'created',
  PARTICIPANT_JOINED: 'participant_joined',
  PARTICIPANT_LEFT: 'participant_left',
  DRAW_CONDUCTED: 'draw_conducted',
  SETTINGS_UPDATED: 'settings_updated',
  INVITE_SENT: 'invite_sent',
  PAYMENT_RECEIVED: 'payment_received',
  TOURNAMENT_STARTED: 'tournament_started',
  MATCH_RESULT: 'match_result',
  COMPLETED: 'completed',
} as const;