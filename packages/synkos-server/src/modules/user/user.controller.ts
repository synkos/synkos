import type { Request, Response } from "express";
import { z } from "zod";
import { UserService } from "./user.service";

// ── Validation schemas ────────────────────────────────────────────────────────

const nameSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const usernameSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

const pushTokenSchema = z.object({
  token: z.string().min(8, "Invalid push token"),
});

const deletePushTokenSchema = z.object({
  token: z.string().min(8, "Invalid push token"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function validationError(res: Response, message: string) {
  return res.status(400).json({
    success: false,
    error: { code: "VALIDATION_ERROR", message },
  });
}

function requireUser(req: Request, res: Response): boolean {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    });
    return false;
  }
  return true;
}

// ── Controller ────────────────────────────────────────────────────────────────

export const UserController = {
  /**
   * PATCH /user/name
   * Update the authenticated user's display name.
   */
  patchName: async (req: Request, res: Response) => {
    if (!requireUser(req, res)) return;

    const parsed = nameSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const user = await UserService.updateName(
      req.user!._id.toString(),
      parsed.data.name
    );

    res.json({ success: true, data: { user } });
  },

  /**
   * PATCH /user/username
   * Change the authenticated user's username (30-day cooldown, reservation logic).
   */
  patchUsername: async (req: Request, res: Response) => {
    if (!requireUser(req, res)) return;

    const parsed = usernameSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const user = await UserService.updateUsername(
      req.user!._id.toString(),
      parsed.data.username
    );

    res.json({ success: true, data: { user } });
  },

  /**
   * PATCH /user/photo
   * Replace or remove the authenticated user's avatar.
   * Expects multipart/form-data with an optional "photo" file field.
   * Omitting the file field removes the current avatar.
   */
  patchPhoto: async (req: Request, res: Response) => {
    if (!requireUser(req, res)) return;

    // req.file is populated by Multer (optional — absence means remove)
    const user = await UserService.updatePhoto(
      req.user!._id.toString(),
      req.file
    );

    res.json({ success: true, data: { user } });
  },

  /**
   * PATCH /user/push-token
   * Register a device APNs/FCM token for the authenticated user.
   */
  patchPushToken: async (req: Request, res: Response) => {
    if (!requireUser(req, res)) return;

    const parsed = pushTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await UserService.registerPushToken(
      req.user!._id.toString(),
      parsed.data.token
    );

    res.json({ success: true, data: null });
  },

  /**
   * DELETE /user/push-token
   * Removes a device push token on logout so the user stops receiving notifications.
   */
  deletePushToken: async (req: Request, res: Response) => {
    if (!requireUser(req, res)) return;

    const parsed = deletePushTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await UserService.unregisterPushToken(
      req.user!._id.toString(),
      parsed.data.token
    );

    res.json({ success: true, data: null });
  },

  /**
   * PATCH /user/password
   * Change password for local-auth accounts.
   * Requires current password. Invalidates all sessions on success.
   */
  patchPassword: async (req: Request, res: Response) => {
    if (!requireUser(req, res)) return;

    const parsed = passwordSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await UserService.updatePassword(
      req.user!._id.toString(),
      parsed.data.currentPassword,
      parsed.data.newPassword
    );

    res.json({ success: true, data: null });
  },
};
