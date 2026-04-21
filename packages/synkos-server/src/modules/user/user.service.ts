import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { User } from "@/modules/auth/user.model";
import { RefreshToken } from "@/modules/auth/refresh-token.model";
import { changeUsername as usernameServiceChange } from "@/modules/username/username.service";
import { logAuditEvent } from "@/modules/audit/audit.service";
import { getStorageAdapter } from "@/adapters/storage/storage.registry";
import { getCache, CacheKeys } from "@/adapters/cache/cache.registry";
import type { PublicUser } from "@/modules/auth/auth.types";
import { coreEvents } from "@/events/core-events";

// ── Avatar validation ─────────────────────────────────────────────────────────

const MAX_AVATAR_BYTES  = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/gif":  "gif",
};

function validateAvatarFile(file: Express.Multer.File): void {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    throw Object.assign(
      new Error("Only JPEG, PNG, WebP, or GIF images are accepted."),
      { status: 422, code: "INVALID_FILE_TYPE" }
    );
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw Object.assign(
      new Error("Image must be smaller than 5 MB."),
      { status: 422, code: "FILE_TOO_LARGE" }
    );
  }
}

const BCRYPT_ROUNDS = 12;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeError(message: string, status: number, code: string): Error {
  return Object.assign(new Error(message), { status, code });
}

function toPublicUser(user: InstanceType<typeof User>): PublicUser {
  return {
    id: (user._id as { toString(): string }).toString(),
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    usernameChangedAt: user.usernameChangedAt?.toISOString(),
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    role: user.role,
    providers: user.providers.map((p) => p.provider),
    deletionStatus: user.deletionStatus ?? "active",
    deletionScheduledAt: user.deletionScheduledAt?.toISOString(),
  };
}

// ── Name ──────────────────────────────────────────────────────────────────────

/**
 * Update the user's display name.
 *  - Trims whitespace.
 *  - Enforces 2–50 character range.
 *  - Returns the updated PublicUser.
 */
export async function updateName(userId: string, rawName: string): Promise<PublicUser> {
  const name = rawName.trim();

  if (name.length < 2) {
    throw makeError("Name must be at least 2 characters.", 422, "NAME_TOO_SHORT");
  }
  if (name.length > 50) {
    throw makeError("Name must be at most 50 characters.", 422, "NAME_TOO_LONG");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { displayName: name },
    { new: true }
  );

  if (!user) throw makeError("User not found.", 404, "USER_NOT_FOUND");

  await getCache().del(CacheKeys.user(userId));

  logAuditEvent({ userId, type: "name_changed", newValue: name });
  coreEvents.emit("user:name_changed", { userId, newName: name });

  return toPublicUser(user);
}

// ── Username ──────────────────────────────────────────────────────────────────

/**
 * Change the authenticated user's username.
 * Delegates the core logic (validation, cooldown, reservation) to UsernameService
 * and translates thrown errors to specific, documented error codes.
 *
 * Error codes:
 *  - USERNAME_INVALID         — format rules violated
 *  - USERNAME_TAKEN           — already used by another account
 *  - USERNAME_RESERVED        — held in the reservation table
 *  - USERNAME_CHANGE_TOO_SOON — 30-day cooldown not elapsed
 */
export async function updateUsername(userId: string, rawUsername: string): Promise<PublicUser> {
  let normalized: string;

  try {
    normalized = await usernameServiceChange(userId, rawUsername);
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string; code?: string };

    // 422 from UsernameService = format validation failed
    if (e.status === 422) {
      throw makeError(e.message ?? "Invalid username.", 422, "USERNAME_INVALID");
    }

    // 409 = taken (duplicate in users table or reserved table)
    if (e.status === 409) {
      // Distinguish between active user and reservation
      const msg = (e.message ?? "").toLowerCase();
      const code = msg.includes("reserved") ? "USERNAME_RESERVED" : "USERNAME_TAKEN";
      throw makeError(e.message ?? "Username is not available.", 409, code);
    }

    // 429 = cooldown
    if (e.status === 429) {
      throw makeError(e.message ?? "Username change not allowed yet.", 429, "USERNAME_CHANGE_TOO_SOON");
    }

    throw err; // unexpected — let global handler deal with it
  }

  const user = await User.findById(userId);
  if (!user) throw makeError("User not found.", 404, "USER_NOT_FOUND");

  await getCache().del(CacheKeys.user(userId));

  logAuditEvent({ userId, type: "username_changed", newValue: normalized });
  coreEvents.emit("user:username_changed", { userId, newUsername: normalized });

  return toPublicUser(user);
}

// ── Photo ─────────────────────────────────────────────────────────────────────

/**
 * Update the user's avatar.
 *  - When a file is provided: validates, uploads, replaces old avatar.
 *  - When no file is provided: removes the avatar (fallback to default).
 */
export async function updatePhoto(
  userId: string,
  file?: Express.Multer.File
): Promise<PublicUser> {
  const user = await User.findById(userId);
  if (!user) throw makeError("User not found.", 404, "USER_NOT_FOUND");

  const previousKey = user.avatar ?? null;

  if (!file) {
    // Remove avatar — fall back to default
    await User.findByIdAndUpdate(userId, { $unset: { avatar: "" } });
    if (previousKey) {
      getStorageAdapter().delete(previousKey).catch(() => {});
    }

    await getCache().del(CacheKeys.user(userId));

    logAuditEvent({ userId, type: "photo_removed", oldValue: previousKey ?? undefined });
    coreEvents.emit("user:photo_removed", { userId });

    const updated = await User.findById(userId);
    return toPublicUser(updated!);
  }

  // Validate before uploading
  validateAvatarFile(file);

  const ext = MIME_TO_EXT[file.mimetype] ?? "bin";
  const key = `avatars/${userId}/${randomUUID()}.${ext}`;
  const { url } = await getStorageAdapter().upload(key, file.buffer, file.mimetype);

  await User.findByIdAndUpdate(userId, { avatar: url });

  // Best-effort delete of old avatar — don't fail the request if it errors
  if (previousKey && previousKey !== url) {
    getStorageAdapter().delete(previousKey).catch(() => {});
  }

  await getCache().del(CacheKeys.user(userId));

  logAuditEvent({ userId, type: "photo_updated", oldValue: previousKey ?? undefined, newValue: url });
  coreEvents.emit("user:photo_updated", { userId, avatarUrl: url });

  const updated = await User.findById(userId);
  return toPublicUser(updated!);
}

// ── Password ──────────────────────────────────────────────────────────────────

/**
 * Change the user's password (local auth accounts only).
 *  - Requires the current password for re-authentication.
 *  - Validates the new password format.
 *  - Hashes with bcrypt (12 rounds).
 *  - Revokes ALL refresh tokens to force re-login on all devices.
 */
export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw makeError("User not found.", 404, "USER_NOT_FOUND");

  const hasLocalProvider = user.providers.some((p) => p.provider === "local");
  if (!hasLocalProvider) {
    throw makeError(
      "Password changes are only available for email/password accounts.",
      400,
      "NOT_LOCAL_ACCOUNT"
    );
  }

  if (!user.passwordHash) {
    throw makeError("No password is set for this account.", 400, "NO_PASSWORD_SET");
  }

  const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    throw makeError("Current password is incorrect.", 401, "INVALID_CURRENT_PASSWORD");
  }

  if (currentPassword === newPassword) {
    throw makeError("New password must differ from the current password.", 422, "PASSWORD_SAME_AS_CURRENT");
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await User.findByIdAndUpdate(userId, { passwordHash: newHash });

  // Invalidate all sessions — user must log in again on all devices
  await RefreshToken.deleteMany({ userId });

  await getCache().del(CacheKeys.user(userId));

  logAuditEvent({ userId, type: "password_changed" });
  coreEvents.emit("user:password_changed", { userId });
}

// ── Push token ────────────────────────────────────────────────────────────────

const MAX_PUSH_TOKENS = 10;

/**
 * Registers a device push token for the user.
 * - Adds it if not already present.
 * - Trims the oldest token when the cap is exceeded.
 */
export async function registerPushToken(userId: string, token: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user) throw makeError("User not found.", 404, "USER_NOT_FOUND");

  const tokens: string[] = user.pushTokens ?? [];
  if (tokens.includes(token)) return; // already registered

  const updated = [...tokens, token].slice(-MAX_PUSH_TOKENS);
  await User.findByIdAndUpdate(userId, { pushTokens: updated });
  await getCache().del(CacheKeys.user(userId));
}

/**
 * Removes a device push token for the user on logout.
 * No-op if the token was not registered.
 */
export async function unregisterPushToken(userId: string, token: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { $pull: { pushTokens: token } });
  await getCache().del(CacheKeys.user(userId));
}

// ── Namespace export (mirrors AuthService pattern) ────────────────────────────

export const UserService = {
  updateName,
  updateUsername,
  updatePhoto,
  updatePassword,
  registerPushToken,
  unregisterPushToken,
};
