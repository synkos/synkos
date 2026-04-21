import type { Request, Response } from "express";
import { z } from "zod";
import { User } from "@/modules/auth/user.model";
import { getNotificationAdapter } from "@/adapters/notification/notification.registry";

// ── Validation schemas ────────────────────────────────────────────────────────

const sendToUserSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  title: z.string().min(1, "title is required"),
  body: z.string().min(1, "body is required"),
  data: z.record(z.string(), z.unknown()).optional(),
  badge: z.number().int().min(0).optional(),
  sound: z.string().optional(),
});

const broadcastSchema = z.object({
  title: z.string().min(1, "title is required"),
  body: z.string().min(1, "body is required"),
  data: z.record(z.string(), z.unknown()).optional(),
  badge: z.number().int().min(0).optional(),
  sound: z.string().optional(),
});

// ── Controller ────────────────────────────────────────────────────────────────

export const NotificationsController = {
  /**
   * POST /admin/notifications/send
   *
   * Sends a push notification to a specific user (all their registered devices).
   *
   * Body: { userId, title, body, data?, badge?, sound? }
   */
  sendToUser: async (req: Request, res: Response) => {
    const parsed = sendToUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      });
      return;
    }

    const { userId, ...payload } = parsed.data;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: { code: "USER_NOT_FOUND", message: "User not found." },
      });
      return;
    }

    const tokens = user.pushTokens ?? [];
    if (tokens.length === 0) {
      res.status(200).json({
        success: true,
        data: { sent: 0, message: "User has no registered devices." },
      });
      return;
    }

    await getNotificationAdapter().sendToMany(tokens, payload);

    res.json({ success: true, data: { sent: tokens.length } });
  },

  /**
   * POST /admin/notifications/broadcast
   *
   * Sends a push notification to ALL users with at least one registered device.
   * Processes users in batches of 100 to avoid memory spikes.
   *
   * Body: { title, body, data?, badge?, sound? }
   */
  broadcast: async (req: Request, res: Response) => {
    const parsed = broadcastSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message ?? "Invalid input" },
      });
      return;
    }

    const payload = parsed.data;

    const BATCH = 100;
    let skip = 0;
    let totalSent = 0;

    while (true) {
      const users = await User.find(
        { "pushTokens.0": { $exists: true }, isActive: true },
        { pushTokens: 1 }
      )
        .skip(skip)
        .limit(BATCH)
        .lean();

      if (users.length === 0) break;

      await Promise.all(
        users.map((u) =>
          getNotificationAdapter().sendToMany(u.pushTokens ?? [], payload)
        )
      );

      totalSent += users.reduce((acc, u) => acc + (u.pushTokens?.length ?? 0), 0);
      skip += BATCH;

      if (users.length < BATCH) break;
    }

    res.json({ success: true, data: { sent: totalSent } });
  },
};
