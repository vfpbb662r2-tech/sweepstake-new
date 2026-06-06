export const WORLD_CUP_2022 = {
  id: 'wc-2022',
  name: 'FIFA World Cup 2022',
  description: 'The 22nd FIFA World Cup held in Qatar',
  start_date: '2022-11-20T00:00:00Z',
  end_date: '2022-12-18T23:59:59Z',
  status: 'completed' as const,
} as const;

export const WORLD_CUP_2026 = {
  id: 'wc-2026',
  name: 'FIFA World Cup 2026',
  description: 'The 23rd FIFA World Cup hosted by USA, Canada, and Mexico',
  start_date: '2026-06-11T00:00:00Z',
  end_date: '2026-07-19T23:59:59Z',
  status: 'upcoming' as const,
} as const;

export const EURO_2024 = {
  id: 'euro-2024',
  name: 'UEFA Euro 2024',
  description: 'UEFA European Football Championship 2024 in Germany',
  start_date: '2024-06-14T00:00:00Z',
  end_date: '2024-07-14T23:59:59Z',
  status: 'completed' as const,
} as const;

export const COPA_AMERICA_2024 = {
  id: 'copa-2024',
  name: 'Copa América 2024',
  description: 'CONMEBOL Copa América 2024 in the United States',
  start_date: '2024-06-20T00:00:00Z',
  end_date: '2024-07-14T23:59:59Z',
  status: 'completed' as const,
} as const;

export const WORLD_CUP_2022_TEAMS = [
  // Group A
  { name: 'Qatar', code: 'QAT', group: 'A', flag_emoji: '🇶🇦' },
  { name: 'Ecuador', code: 'ECU', group: 'A', flag_emoji: '🇪🇨' },
  { name: 'Senegal', code: 'SEN', group: 'A', flag_emoji: '🇸🇳' },
  { name: 'Netherlands', code: 'NED', group: 'A', flag_emoji: '🇳🇱' },
  
  // Group B
  { name: 'England', code: 'ENG', group: 'B', flag_emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Iran', code: 'IRN', group: 'B', flag_emoji: '🇮🇷' },
  { name: 'USA', code: 'USA', group: 'B', flag_emoji: '🇺🇸' },
  { name: 'Wales', code: 'WAL', group: 'B', flag_emoji: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  
  // Group C
  { name: 'Argentina', code: 'ARG', group: 'C', flag_emoji: '🇦🇷' },
  { name: 'Saudi Arabia', code: 'KSA', group: 'C', flag_emoji: '🇸🇦' },
  { name: 'Mexico', code: 'MEX', group: 'C', flag_emoji: '🇲🇽' },
  { name: 'Poland', code: 'POL', group: 'C', flag_emoji: '🇵🇱' },
  
  // Group D
  { name: 'France', code: 'FRA', group: 'D', flag_emoji: '🇫🇷' },
  { name: 'Australia', code: 'AUS', group: 'D', flag_emoji: '🇦🇺' },
  { name: 'Denmark', code: 'DEN', group: 'D', flag_emoji: '🇩🇰' },
  { name: 'Tunisia', code: 'TUN', group: 'D', flag_emoji: '🇹🇳' },
  
  // Group E
  { name: 'Spain', code: 'ESP', group: 'E', flag_emoji: '🇪🇸' },
  { name: 'Costa Rica', code: 'CRC', group: 'E', flag_emoji: '🇨🇷' },
  { name: 'Germany', code: 'GER', group: 'E', flag_emoji: '🇩🇪' },
  { name: 'Japan', code: 'JPN', group: 'E', flag_emoji: '🇯🇵' },
  
  // Group F
  { name: 'Belgium', code: 'BEL', group: 'F', flag_emoji: '🇧🇪' },
  { name: 'Canada', code: 'CAN', group: 'F', flag_emoji: '🇨🇦' },
  { name: 'Morocco', code: 'MAR', group: 'F', flag_emoji: '🇲🇦' },
  { name: 'Croatia', code: 'CRO', group: 'F', flag_emoji: '🇭🇷' },
  
  // Group G
  { name: 'Brazil', code: 'BRA', group: 'G', flag_emoji: '🇧🇷' },
  { name: 'Serbia', code: 'SRB', group: 'G', flag_emoji: '🇷🇸' },
  { name: 'Switzerland', code: 'SUI', group: 'G', flag_emoji: '🇨🇭' },
  { name: 'Cameroon', code: 'CMR', group: 'G', flag_emoji: '🇨🇲' },
  
  // Group H
  { name: 'Portugal', code: 'POR', group: 'H', flag_emoji: '🇵🇹' },
  { name: 'Ghana', code: 'GHA', group: 'H', flag_emoji: '🇬🇭' },
  { name: 'Uruguay', code: 'URU', group: 'H', flag_emoji: '🇺🇾' },
  { name: 'South Korea', code: 'KOR', group: 'H', flag_emoji: '🇰🇷' },
] as const;

export const TOURNAMENT_MATCH_TYPES = [
  { value: 'group', label: 'Group Stage' },
  { value: 'round_of_16', label: 'Round of 16' },
  { value: 'quarter_final', label: 'Quarter Final' },
  { value: 'semi_final', label: 'Semi Final' },
  { value: 'third_place', label: 'Third Place' },
  { value: 'final', label: 'Final' },
] as const;

export const TOURNAMENT_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
} as const;

// Popular tournaments for selection
export const POPULAR_TOURNAMENTS = [
  WORLD_CUP_2026,
  EURO_2024,
  COPA_AMERICA_2024,
  WORLD_CUP_2022,
] as const;

// Tournament configurations
export const TOURNAMENT_CONFIGS = {
  WORLD_CUP: {
    max_teams: 32,
    group_size: 4,
    groups: 8,
    knockout_rounds: ['round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final'],
  },
  EURO: {
    max_teams: 24,
    group_size: 4,
    groups: 6,
    knockout_rounds: ['round_of_16', 'quarter_final', 'semi_final', 'final'],
  },
  COPA_AMERICA: {
    max_teams: 16,
    group_size: 4,
    groups: 4,
    knockout_rounds: ['quarter_final', 'semi_final', 'third_place', 'final'],
  },
} as const;

// Common prize distribution presets
export const PRIZE_DISTRIBUTION_PRESETS = {
  WINNER_TAKES_ALL: {
    name: 'Winner Takes All',
    distribution: { first: 100 },
  },
  TOP_THREE: {
    name: 'Top 3',
    distribution: { first: 60, second: 25, third: 15 },
  },
  TOP_TWO: {
    name: 'Top 2',
    distribution: { first: 70, second: 30 },
  },
  WITH_PARTICIPATION: {
    name: 'With Participation Prize',
    distribution: { first: 50, second: 25, third: 15, participation: 10 },
  },
  EQUAL_SPLIT: {
    name: 'Equal Split Top 3',
    distribution: { first: 33.33, second: 33.33, third: 33.34 },
  },
} as const;