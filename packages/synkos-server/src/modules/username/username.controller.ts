import type { Request, Response } from "express";
import { z } from "zod";
import {
  checkUsernameAvailability,
  generateSuggestions,
  setUsername,
  changeUsername,
} from "./username.service";

// ── Validation schemas ────────────────────────────────────────────────────────

const usernameBodySchema = z.object({
  username: z.string().min(1, "Username is required.").max(30),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function validationError(res: Response, message: string) {
  return res.status(400).json({
    success: false,
    error: { code: "VALIDATION_ERROR", message },
  });
}

// ── Controller ────────────────────────────────────────────────────────────────

export const UsernameController = {
  /**
   * GET /username/check?username=xxx
   *
   * Public endpoint. Returns availability + format errors + suggestions when taken.
   */
  checkAvailability: async (req: Request, res: Response) => {
    const raw = String(req.query.username ?? "").trim();
    if (!raw) return validationError(res, "username query parameter is required.");

    const result = await checkUsernameAvailability(raw);

    const suggestions =
      !result.available && !result.error ? await generateSuggestions(raw) : [];

    res.json({
      success: true,
      data: {
        username: result.normalized,
        available: result.available,
        error: result.error ?? null,
        errorMessage: result.errorMessage ?? null,
        suggestions,
      },
    });
  },

  /**
   * POST /username
   *
   * Set a username for the first time (authenticated users with no username yet).
   */
  setUsername: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Not authenticated." },
      });
    }

    const parsed = usernameBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input.");
    }

    const normalized = await setUsername(
      req.user._id.toString(),
      parsed.data.username
    );

    res.status(201).json({ success: true, data: { username: normalized } });
  },

  /**
   * PUT /username
   *
   * Change an existing username (authenticated, subject to 30-day cooldown).
   */
  changeUsername: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Not authenticated." },
      });
    }

    const parsed = usernameBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input.");
    }

    const normalized = await changeUsername(
      req.user._id.toString(),
      parsed.data.username
    );

    res.json({ success: true, data: { username: normalized } });
  },
};
