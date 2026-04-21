/**
 * Core event listeners.
 *
 * Call registerListeners() as the SECOND step in the bootstrap sequence,
 * after applyExtensions() and before wireCoreAdapters().
 *
 * Subscribe here to react to core domain events from your features.
 * Listeners must never throw — errors are logged and swallowed.
 *
 * AVAILABLE EVENTS
 * ─────────────────────────────────────────────────────────────────────────────
 * User lifecycle:
 *   user:registered        { userId, email, provider }
 *   user:login             { userId, provider }
 *   user:logout            { userId }
 *   user:email_verified    { userId, email }
 *   user:password_reset    { userId }
 *
 * Profile mutations:
 *   user:name_changed      { userId, newName }
 *   user:username_set      { userId, username }
 *   user:photo_updated     { userId, avatarUrl }
 *   user:password_changed  { userId }
 *
 * Account lifecycle:
 *   user:deletion_requested  { userId, scheduledAt }
 *   user:deletion_cancelled  { userId }
 *   user:deleted             { userId }
 *
 * EXAMPLE
 * ─────────────────────────────────────────────────────────────────────────────
 *   import { coreEvents } from "@synkos/server/events";
 *   import { ProfileService } from "@/features/profiles/profile.service";
 *
 *   coreEvents.on("user:registered", async ({ userId }) => {
 *     await ProfileService.createForUser(userId);
 *   });
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function registerListeners(): void {
  // Register event listeners here.
}
