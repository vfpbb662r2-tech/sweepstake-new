# @sweepstakes/shared

Shared types, utilities, and business logic for the Sweepstakes application.

## Overview

This package provides:

- **Types**: TypeScript interfaces for all data models
- **Schemas**: Zod validation schemas for runtime type checking
- **Utilities**: Common functions for validation, formatting, calculations, etc.
- **Constants**: Application-wide constants and enums

## Installation

This package is part of the Sweepstakes monorepo and is automatically available to other packages in the workspace.

```bash
# From other packages in the workspace
pnpm add @sweepstakes/shared
```

## Usage

### Types

```typescript
import type { User, Sweepstake, Tournament } from '@sweepstakes/shared';

const user: User = {
  id: '123',
  email: 'user@example.com',
  displayName: 'John Doe',
  // ...
};
```

### Validation Schemas

```typescript
import { CreateSweepstakeSchema } from '@sweepstakes/shared';

const result = CreateSweepstakeSchema.safeParse({
  name: 'World Cup 2026',
  entryFee: 10,
  maxParticipants: 32,
  isPublic: false,
});

if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Validation errors:', result.error.errors);
}
```

### Utilities

```typescript
import {
  formatCurrency,
  generateJoinCode,
  calculatePrizeDistribution,
  validateData,
} from '@sweepstakes/shared';

// Formatting
const price = formatCurrency(25.50); // "£25.50"

// Generation
const code = generateJoinCode(); // "ABC123"

// Calculations
const prizes = calculatePrizeDistribution(100, 10);
// { first: 50, second: 30, third: 20, remaining: 0 }

// Validation
const { success, data, errors } = validateData(schema, userData);
```

### Constants

```typescript
import {
  TOURNAMENT_STAGES,
  SWEEPSTAKE_LIMITS,
  ERROR_MESSAGES,
} from '@sweepstakes/shared';

if (participants.length > SWEEPSTAKE_LIMITS.MAX_PARTICIPANTS) {
  throw new Error(ERROR_MESSAGES.SWEEPSTAKE_FULL);
}
```

## API Reference

### Types

The package exports TypeScript types for all data models:

- `User`, `CreateUserInput`, `UpdateUserInput`
- `Sweepstake`, `CreateSweepstakeInput`, `UpdateSweepstakeInput`
- `Tournament`, `CreateTournamentInput`, `UpdateTournamentInput`
- `Team`, `CreateTeamInput`, `UpdateTeamInput`
- `Match`, `CreateMatchInput`, `UpdateMatchInput`
- `Participant`, `CreateParticipantInput`

### Validation Schemas

Zod schemas for runtime validation:

- `CreateUserSchema`, `LoginSchema`, `UpdateUserSchema`
- `CreateSweepstakeSchema`, `UpdateSweepstakeSchema`, `JoinSweepstakeSchema`
- `CreateTournamentSchema`, `UpdateTournamentSchema`
- `CreateTeamSchema`, `UpdateTeamSchema`
- `CreateMatchSchema`, `UpdateMatchSchema`

### Utilities

#### Validation
- `validateData(schema, data)` - Validates data against a Zod schema
- `isValidEmail(email)` - Email format validation
- `isValidPassword(password)` - Password strength validation
- `isValidUUID(uuid)` - UUID format validation

#### Formatting
- `formatCurrency(amount, currency, locale)` - Currency formatting
- `formatDate(date, locale)` - Date formatting
- `formatDateTime(date, locale)` - Date and time formatting
- `formatRelativeTime(date, locale)` - Relative time (e.g., "2 hours ago")
- `formatScore(homeScore, awayScore)` - Match score formatting

#### Generators
- `generateJoinCode()` - Random 6-character join code
- `generateUUID()` - UUID v4 generation
- `generateSlug(text)` - URL-friendly slug from text
- `generateRandomColor()` - Random hex color
- `generatePassword(length)` - Secure random password

#### Calculations
- `calculatePrizeDistribution(totalPot, participants)` - Prize distribution
- `calculateStandings(participants, matches)` - Leaderboard calculation
- `calculateWinProbability(homeRanking, awayRanking)` - Win probability
- `calculateTournamentProgress(completed, total)` - Progress percentage

#### Transforms
- `transformUser(dbUser)` - Database to client format
- `transformSweepstake(dbSweepstake)` - Database to client format
- `toSnakeCase(obj)` - camelCase to snake_case
- `toCamelCase(obj)` - snake_case to camelCase

### Constants

#### Enums
- `TOURNAMENT_STAGES` - Tournament stage values
- `TOURNAMENT_STATUSES` - Tournament status values
- `MATCH_STATUSES` - Match status values
- `SWEEPSTAKE_STATUSES` - Sweepstake status values

#### Limits
- `SWEEPSTAKE_LIMITS` - Sweepstake validation limits
- `USER_LIMITS` - User validation limits
- `TEAM_LIMITS` - Team validation limits

#### Messages
- `SUCCESS_MESSAGES` - Success message constants
- `ERROR_MESSAGES` - Error message constants
- `ERROR_CODES` - Error code constants

## Development

### Building

```bash
pnpm build
```

### Testing

```bash
pnpm test          # Run tests
pnpm test:watch    # Watch mode
pnpm test:ui       # UI mode
```

### Linting

```bash
pnpm lint          # Check for issues
pnpm lint:fix      # Fix auto-fixable issues
```

### Type Checking

```bash
pnpm type-check
```

## Contributing

1. Add new utilities to appropriate files in `src/utils/`
2. Add corresponding tests in `src/utils/__tests__/`
3. Export new functions from `src/utils/index.ts`
4. Update this README if adding new public APIs
5. Ensure all tests pass before committing

## License

MIT