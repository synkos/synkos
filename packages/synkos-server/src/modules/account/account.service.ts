import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { User } from "@/modules/auth/user.model";
import { RefreshToken } from "@/modules/auth/refresh-token.model";
import { getEmailAdapter } from "@/adapters/email/email.registry";
import { getCache, CacheKeys } from "@/adapters/cache/cache.registry";
import { reserveUsername } from "@/modules/username/username.service";
import { createLogger } from "@/utils/logger";
import { coreEvents } from "@/events/core-events";

// ── Deletion cleanup registry ─────────────────────────────────────────────────

type DeletionCleanupFn = (userId: string, oid: Types.ObjectId) => Promise<void>;
const deletionCleanupFns: DeletionCleanupFn[] = [];

/**
 * Register a cleanup function to run during permanent user deletion,
 * before the user document itself is removed.
 *
 * Call this from bootstrap/listeners.ts for any feature that owns data
 * tied to a userId and must be purged when the account is permanently deleted.
 *
 * @example
 *   registerDeletionCleanup(async (userId, oid) => {
 *     await GradedCard.deleteMany({ userId: oid });
 *   });
 */
export function registerDeletionCleanup(fn: DeletionCleanupFn): void {
  deletionCleanupFns.push(fn);
}

const log = createLogger("account");

const DELETION_GRACE_DAYS = 30;

export const AccountService = {
  /**
   * Schedule the authenticated user's account for deletion.
   *
   * - Local auth users must supply their password for re-authentication.
   * - OAuth-only users are already authenticated via JWT (no password needed).
   * - Idempotent: returns the existing scheduled date if already pending.
   */
  async requestDeletion(
    userId: string,
    password?: string
  ): Promise<{ scheduledAt: Date }> {
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) {
      const err = new Error("User not found") as Error & { status: number };
      err.status = 404;
      throw err;
    }

    // Already pending — idempotent, return existing date
    if (user.deletionStatus === "pending_deletion") {
      return { scheduledAt: user.deletionScheduledAt! };
    }

    // Re-authenticate local users via password
    const hasLocalProvider = user.providers.some((p) => p.provider === "local");
    if (hasLocalProvider) {
      if (!password) {
        const err = new Error("Password is required to delete your account") as Error & { status: number };
        err.status = 400;
        throw err;
      }
      if (!user.passwordHash) {
        const err = new Error("No password set for this account") as Error & { status: number };
        err.status = 400;
        throw err;
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        const err = new Error("Incorrect password") as Error & { status: number };
        err.status = 401;
        throw err;
      }
    }

    const now = new Date();
    const scheduledAt = new Date(
      now.getTime() + DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000
    );

    user.deletionStatus = "pending_deletion";
    user.deletionRequestedAt = now;
    user.deletionScheduledAt = scheduledAt;
    await user.save();

    // Best-effort notification — never fail the request on email error
    getEmailAdapter().sendDeletionConfirmation(user.email, scheduledAt).catch(
      (err) => log.error({ err }, "Deletion confirmation email failed")
    );

    await getCache().del(CacheKeys.user(userId));
    coreEvents.emit("user:deletion_requested", { userId, scheduledAt });

    return { scheduledAt };
  },

  /**
   * Cancel a pending deletion during the grace period.
   * Restores the account to active status.
   */
  async cancelDeletion(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found") as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (user.deletionStatus !== "pending_deletion") {
      const err = new Error("No pending deletion to cancel") as Error & { status: number };
      err.status = 400;
      throw err;
    }

    user.deletionStatus = "active";
    user.deletionRequestedAt = undefined;
    user.deletionScheduledAt = undefined;
    await user.save();

    getEmailAdapter().sendDeletionCancelled(user.email).catch(
      (err) => log.error({ err }, "Deletion cancelled notification email failed")
    );

    await getCache().del(CacheKeys.user(userId));
    coreEvents.emit("user:deletion_cancelled", { userId });
  },

  /**
   * Called by the background worker.
   * Finds all users past their deletion date and permanently removes their data.
   * Processes in batches of 50 and handles per-user errors without stopping the run.
   */
  async processDeletions(): Promise<void> {
    const now = new Date();

    const candidates = await User.find(
      {
        deletionStatus: "pending_deletion",
        deletionScheduledAt: { $lte: now },
      },
      { _id: 1 }
    )
      .lean()
      .limit(50);

    if (candidates.length === 0) return;

    log.info({ count: candidates.length }, "Processing pending deletions");

    for (const candidate of candidates) {
      const userId = (candidate._id as Types.ObjectId).toString();
      try {
        await AccountService.permanentlyDeleteUser(userId);
        log.info({ userId }, "User permanently deleted");
      } catch (err) {
        // Log and continue — failed users will be retried on the next run
        log.error({ err, userId }, "Failed to permanently delete user");
      }
    }
  },

  /**
   * Permanently delete a single user and all associated data.
   * Safe to retry — each step is a no-op if already deleted.
   */
  async permanentlyDeleteUser(userId: string): Promise<void> {
    const oid = new Types.ObjectId(userId);

    // 1. Reserve the username so it cannot be grabbed immediately after deletion
    const user = await User.findById(oid, { username: 1 }).lean();
    if (user?.username) {
      await reserveUsername(user.username, "deleted", {
        userId,
        durationDays: 90,
      });
    }

    // 2. Run project-level cleanup hooks (feature data tied to this user).
    //    Registered via registerDeletionCleanup() in bootstrap/listeners.ts.
    for (const fn of deletionCleanupFns) {
      await fn(userId, oid);
    }

    // 3. Revoke and remove all refresh tokens (invalidates all active sessions)
    await RefreshToken.deleteMany({ userId: oid });

    // 4. Delete the user document itself
    await User.deleteOne({ _id: oid });

    await getCache().del(CacheKeys.user(userId));
    // Emitted after all data is removed — listeners receive a userId that no longer exists
    coreEvents.emit("user:deleted", { userId });
  },
};
