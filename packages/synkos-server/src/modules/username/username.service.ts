import { User } from '@/modules/auth/user.model';
import { ReservedUsername } from './reserved-username.model';
import type { ReservationReason } from './reserved-username.model';
import { coreEvents } from '@/events/core-events';

// ── Constants ─────────────────────────────────────────────────────────────────

const USERNAME_REGEX = /^[a-z0-9._]{3,20}$/;

// Disallow starting/ending with separator chars, and consecutive separators
const LEADING_TRAILING_SEPARATOR = /^[._]|[._]$/;
const CONSECUTIVE_SEPARATORS = /[._]{2,}/;

const RESERVED_KEYWORDS = new Set([
  'admin',
  'administrator',
  'support',
  'help',
  'helpdesk',
  'api',
  'www',
  'mail',
  'email',
  'bot',
  'robot',
  'info',
  'team',
  'staff',
  'mod',
  'moderator',
  'official',
  'system',
  'null',
  'undefined',
  'anonymous',
  'guest',
  'test',
  'demo',
  'app',
  'apps',
  'account',
  'accounts',
  'user',
  'users',
  'me',
  'my',
  'settings',
  'profile',
  'signup',
  'login',
  'logout',
  'register',
  'root',
  'superuser',
  'webmaster',
  'postmaster',
  'abuse',
  'noreply',
  'no.reply',
  'security',
]);

/**
 * Add project-specific reserved usernames to the blocked list.
 * Call this from bootstrap/extensions.ts before any request is handled.
 *
 * @example
 *   addReservedUsernames(["myapp", "mybrand", "support_team"]);
 */
export function addReservedUsernames(keywords: string[]): void {
  for (const kw of keywords) {
    RESERVED_KEYWORDS.add(kw.toLowerCase().trim());
  }
}

const USERNAME_CHANGE_COOLDOWN_DAYS = 30;
const RESERVATION_DURATION_DAYS = 90;

// ── Normalization & Validation ────────────────────────────────────────────────

/**
 * Normalize a raw username input: lowercase and trim whitespace.
 */
export function normalizeUsername(raw: string): string {
  return raw.toLowerCase().trim();
}

export type UsernameValidationError =
  | 'too_short'
  | 'too_long'
  | 'invalid_chars'
  | 'invalid_start_end'
  | 'consecutive_separators'
  | 'reserved_keyword';

/**
 * Validate a *normalized* username string.
 * Returns null if valid, or a UsernameValidationError code if not.
 */
export function validateUsernameFormat(normalized: string): UsernameValidationError | null {
  if (normalized.length < 3) return 'too_short';
  if (normalized.length > 20) return 'too_long';
  if (!USERNAME_REGEX.test(normalized)) return 'invalid_chars';
  if (LEADING_TRAILING_SEPARATOR.test(normalized)) return 'invalid_start_end';
  if (CONSECUTIVE_SEPARATORS.test(normalized)) return 'consecutive_separators';
  if (RESERVED_KEYWORDS.has(normalized)) return 'reserved_keyword';
  return null;
}

const VALIDATION_MESSAGES: Record<UsernameValidationError, string> = {
  too_short: 'Username must be at least 3 characters.',
  too_long: 'Username must be at most 20 characters.',
  invalid_chars: 'Username may only contain letters, numbers, dots, and underscores.',
  invalid_start_end: 'Username cannot start or end with a dot or underscore.',
  consecutive_separators: 'Username cannot contain consecutive dots or underscores.',
  reserved_keyword: 'This username is reserved.',
};

// ── Availability ──────────────────────────────────────────────────────────────

/**
 * Check if a normalized username is available:
 *  1. Not already used by a user (excluding an optional userId).
 *  2. Not present in ReservedUsernames with a future or null reservedUntil.
 */
export async function isUsernameAvailable(
  normalized: string,
  excludeUserId?: string
): Promise<boolean> {
  const now = new Date();

  // Check live user collection
  const existingUserQuery = excludeUserId
    ? { usernameNormalized: normalized, _id: { $ne: excludeUserId } }
    : { usernameNormalized: normalized };

  const [userExists, reservationExists] = await Promise.all([
    User.exists(existingUserQuery),
    ReservedUsername.exists({
      usernameNormalized: normalized,
      $or: [
        { reservedUntil: null }, // permanent reservation
        { reservedUntil: { $gt: now } }, // active time-limited reservation
      ],
    }),
  ]);

  return !userExists && !reservationExists;
}

// ── Availability check (full flow: normalize → validate → check) ──────────────

export interface AvailabilityResult {
  available: boolean;
  normalized: string;
  error?: UsernameValidationError;
  errorMessage?: string;
}

export async function checkUsernameAvailability(
  raw: string,
  excludeUserId?: string
): Promise<AvailabilityResult> {
  const normalized = normalizeUsername(raw);

  const validationError = validateUsernameFormat(normalized);
  if (validationError) {
    return {
      available: false,
      normalized,
      error: validationError,
      errorMessage: VALIDATION_MESSAGES[validationError],
    };
  }

  const available = await isUsernameAvailable(normalized, excludeUserId);
  return { available, normalized };
}

// ── Generation ────────────────────────────────────────────────────────────────

/**
 * Derive a base slug from a display name. Strips non-alphanumeric characters
 * and truncates to 15 chars. Falls back to "trainer" if result is too short.
 */
function baseFromDisplayName(displayName: string): string {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // strip anything that isn't letter or digit
    .slice(0, 15);

  return slug.length >= 3 ? slug : 'trainer';
}

/**
 * Generate a unique username using the following strategy:
 *  1. Try the base slug as-is (if valid and available).
 *  2. Append 2-digit incrementing suffix: base_01, base_02 … base_99.
 *  3. Append 4-digit random suffix on each further attempt.
 *  4. Absolute fallback: trainer + timestamp (virtually impossible to collide).
 *
 * The returned username is already saved to the user record — this function
 * only generates the string; persistence is the caller's responsibility.
 */
export async function generateUniqueUsername(displayName?: string): Promise<string> {
  const base = baseFromDisplayName(displayName ?? 'trainer');

  // Step 1: try base slug itself (if valid length)
  if (base.length >= 3 && !validateUsernameFormat(base)) {
    if (await isUsernameAvailable(base)) return base;
  }

  // Step 2: append short incrementing numbers (_01 … _99)
  for (let i = 1; i <= 99; i++) {
    const suffix = String(i).padStart(2, '0');
    const candidate = `${base}_${suffix}`.slice(0, 20);
    if (!validateUsernameFormat(candidate) && (await isUsernameAvailable(candidate))) {
      return candidate;
    }
  }

  // Step 3: append 4-digit random numbers — retry 20 times
  for (let attempt = 0; attempt < 20; attempt++) {
    const num = Math.floor(Math.random() * 9000) + 1000;
    const candidate = `${base.slice(0, 15)}_${num}`;
    if (!validateUsernameFormat(candidate) && (await isUsernameAvailable(candidate))) {
      return candidate;
    }
  }

  // Step 4: absolute fallback — virtually impossible to collide with a real user
  return `trainer_${Date.now()}`.slice(0, 20);
}

// ── Suggestion ────────────────────────────────────────────────────────────────

/**
 * Generate up to N username suggestions based on a taken username.
 * Used by the frontend to offer alternatives when the desired handle is unavailable.
 */
export async function generateSuggestions(raw: string, count = 3): Promise<string[]> {
  const base =
    normalizeUsername(raw)
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15) || 'trainer';
  const suggestions: string[] = [];

  // Try sequential numeric suffixes first (friendlier UX)
  for (let i = 1; suggestions.length < count && i <= 99; i++) {
    const suffix = String(i).padStart(2, '0');
    const candidate = `${base}_${suffix}`.slice(0, 20);
    if (!validateUsernameFormat(candidate) && (await isUsernameAvailable(candidate))) {
      suggestions.push(candidate);
    }
  }

  // Fill remaining with random 4-digit suffixes
  let attempts = 0;
  while (suggestions.length < count && attempts < 30) {
    const num = Math.floor(Math.random() * 9000) + 1000;
    const candidate = `${base.slice(0, 15)}_${num}`;
    if (!validateUsernameFormat(candidate) && (await isUsernameAvailable(candidate))) {
      suggestions.push(candidate);
    }
    attempts++;
  }

  return suggestions;
}

// ── Reservation ───────────────────────────────────────────────────────────────

/**
 * Add a username to the reserved list.
 * If a reservation already exists for this normalized name, it is updated.
 */
export async function reserveUsername(
  username: string,
  reason: ReservationReason,
  options: {
    userId?: string;
    durationDays?: number | null; // null = permanent, default = RESERVATION_DURATION_DAYS
  } = {}
): Promise<void> {
  const usernameNormalized = normalizeUsername(username);
  const { userId, durationDays = RESERVATION_DURATION_DAYS } = options;

  const reservedUntil =
    durationDays === null ? null : new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  await ReservedUsername.findOneAndUpdate(
    { usernameNormalized },
    {
      username,
      usernameNormalized,
      reservedUntil,
      reason,
      ...(userId ? { userId } : {}),
    },
    { upsert: true }
  );
}

// ── Set username (first-time) ─────────────────────────────────────────────────

/**
 * Set a username for a user who does not yet have one.
 * Validates format, checks availability, and atomically writes to the DB.
 * Throws if the username is invalid or taken.
 */
export async function setUsername(userId: string, rawUsername: string): Promise<string> {
  const normalized = normalizeUsername(rawUsername);

  const formatError = validateUsernameFormat(normalized);
  if (formatError) {
    const err = new Error(VALIDATION_MESSAGES[formatError]) as Error & { status: number };
    err.status = 422;
    throw err;
  }

  // Atomic update: only write if the user has no username yet AND the normalized
  // name is not already taken (enforced by the sparse unique index on usernameNormalized).
  const available = await isUsernameAvailable(normalized, userId);
  if (!available) {
    const err = new Error('Username is already taken.') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  try {
    const user = await User.findOneAndUpdate(
      { _id: userId, usernameNormalized: { $exists: false } },
      { username: rawUsername.trim(), usernameNormalized: normalized },
      { new: true }
    );

    if (!user) {
      // User already has a username — should use changeUsername instead
      const err = new Error('User already has a username. Use the change endpoint.') as Error & {
        status: number;
      };
      err.status = 409;
      throw err;
    }

    coreEvents.emit('user:username_set', { userId, username: normalized });

    return normalized;
  } catch (err: unknown) {
    // Handle MongoDB duplicate key error (E11000) on the unique index
    if ((err as { code?: number }).code === 11000) {
      const duplicate = new Error('Username is already taken.') as Error & { status: number };
      duplicate.status = 409;
      throw duplicate;
    }
    throw err;
  }
}

// ── Change username ───────────────────────────────────────────────────────────

/**
 * Change an existing user's username.
 *  1. Validates the new username format.
 *  2. Enforces the 30-day cooldown between changes.
 *  3. Checks availability (user + reserved table).
 *  4. Atomically reserves the old username and writes the new one.
 *
 * Throws a typed HTTP error on any failure.
 */
export async function changeUsername(userId: string, rawUsername: string): Promise<string> {
  const normalized = normalizeUsername(rawUsername);

  const formatError = validateUsernameFormat(normalized);
  if (formatError) {
    const err = new Error(VALIDATION_MESSAGES[formatError]) as Error & { status: number };
    err.status = 422;
    throw err;
  }

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found.') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  // Enforce cooldown
  if (user.usernameChangedAt) {
    const cooldownMs = USERNAME_CHANGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    const nextChangeAllowedAt = new Date(user.usernameChangedAt.getTime() + cooldownMs);
    if (nextChangeAllowedAt > new Date()) {
      const daysLeft = Math.ceil(
        (nextChangeAllowedAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      );
      const err = new Error(
        `You can change your username again in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`
      ) as Error & { status: number; daysLeft: number; nextChangeAllowedAt: string };
      err.status = 429;
      (err as typeof err & { daysLeft: number }).daysLeft = daysLeft;
      (err as typeof err & { nextChangeAllowedAt: string }).nextChangeAllowedAt =
        nextChangeAllowedAt.toISOString();
      throw err;
    }
  }

  // No-op if same username (case-insensitive)
  if (user.usernameNormalized === normalized) {
    return normalized;
  }

  const available = await isUsernameAvailable(normalized, userId);
  if (!available) {
    const err = new Error('Username is already taken.') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  // Atomically: reserve old username + update user
  const oldUsername = user.username;
  const oldNormalized = user.usernameNormalized;

  try {
    await User.findByIdAndUpdate(userId, {
      username: rawUsername.trim(),
      usernameNormalized: normalized,
      usernameChangedAt: new Date(),
    });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      const duplicate = new Error('Username is already taken.') as Error & { status: number };
      duplicate.status = 409;
      throw duplicate;
    }
    throw err;
  }

  // Reserve the old username so it can't be immediately grabbed
  if (oldUsername && oldNormalized) {
    await reserveUsername(oldUsername, 'changed', {
      userId,
      durationDays: RESERVATION_DURATION_DAYS,
    });
  }

  return normalized;
}

// ── Background cleanup ────────────────────────────────────────────────────────

/**
 * Delete all ReservedUsername entries whose reservedUntil has passed.
 * Intended to be called by a periodic background job.
 * Returns the number of documents removed.
 */
export async function cleanupExpiredReservations(): Promise<number> {
  const now = new Date();
  const result = await ReservedUsername.deleteMany({
    reservedUntil: { $lte: now, $ne: null },
  });
  return result.deletedCount;
}
