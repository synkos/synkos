/**
 * Schema extensions and core hooks.
 *
 * Call applyExtensions() as the FIRST step in the bootstrap sequence —
 * before everything else, so schema patches apply before any model is accessed.
 *
 * 1. SCHEMA EXTENSIONS — add fields to core Mongoose schemas:
 * ─────────────────────────────────────────────────────────────────────────────
 *   import { userSchema } from "@synkos/server/modules/auth";
 *
 *   userSchema.add({
 *     plan:      { type: String, enum: ["free", "pro"], default: "free" },
 *     isPremium: { type: Boolean, default: false },
 *   });
 *
 *   declare module "@synkos/server/modules/auth" {
 *     interface IUser {
 *       plan?: "free" | "pro";
 *       isPremium?: boolean;
 *     }
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 2. DELETION HOOKS — register data to purge when a user is permanently deleted:
 * ─────────────────────────────────────────────────────────────────────────────
 *   import { registerDeletionCleanup } from "@synkos/server/modules/account";
 *   import { PostModel } from "@/features/posts/post.model";
 *
 *   registerDeletionCleanup(async (_userId, oid) => {
 *     await PostModel.deleteMany({ userId: oid });
 *   });
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 3. RESERVED USERNAMES — block usernames specific to your app:
 * ─────────────────────────────────────────────────────────────────────────────
 *   import { addReservedUsernames } from "@synkos/server/modules/username";
 *
 *   addReservedUsernames(["myapp", "support", "team"]);
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function applyExtensions(): void {
  // Add schema extensions and hooks here.
}
