import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "./auth.service";

// ── Validation schemas ────────────────────────────────────────────────────────

const deviceInfoSchema = z
  .object({
    platform: z.string().optional(),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
  })
  .optional();

const registerSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const forgotPasswordSchema = z.object({
  email: z.email(),
  force: z.boolean().optional(),
});

const validateResetCodeSchema = z.object({
  email: z.email(),
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

const resetPasswordSchema = z.object({
  email: z.email(),
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  deviceInfo: deviceInfoSchema,
});

const oauthSchema = z.object({
  idToken: z.string().min(1),
  email: z.string().optional(),
  displayName: z.string().optional(),
  deviceInfo: deviceInfoSchema,
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
  deviceInfo: deviceInfoSchema,
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1),
  allDevices: z.boolean().optional(),
});

const verifyEmailSchema = z.object({
  email: z.email(),
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

const sendVerificationSchema = z.object({
  email: z.email(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function validationError(res: Response, message: string) {
  return res.status(400).json({
    success: false,
    error: { code: "VALIDATION_ERROR", message },
  });
}

// ── Controller ────────────────────────────────────────────────────────────────

export const AuthController = {
  /**
   * POST /auth/register
   */
  register: async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const result = await AuthService.register(parsed.data);
    res.status(201).json({ success: true, data: result });
  },

  /**
   * POST /auth/login
   */
  loginEmail: async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const result = await AuthService.loginEmail(parsed.data);
    res.json({ success: true, data: result });
  },

  /**
   * POST /auth/google
   */
  loginGoogle: async (req: Request, res: Response) => {
    const parsed = oauthSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const result = await AuthService.loginGoogle(parsed.data);
    res.json({ success: true, data: result });
  },

  /**
   * POST /auth/apple
   */
  loginApple: async (req: Request, res: Response) => {
    const parsed = oauthSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const result = await AuthService.loginApple(parsed.data);
    res.json({ success: true, data: result });
  },

  /**
   * POST /auth/refresh
   */
  refresh: async (req: Request, res: Response) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, "refreshToken is required");
    }

    const tokens = await AuthService.refresh(parsed.data);
    res.json({ success: true, data: { tokens } });
  },

  /**
   * POST /auth/logout
   * Requires: refreshToken in body (optionally allDevices: true)
   */
  logout: async (req: Request, res: Response) => {
    const parsed = logoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, "refreshToken is required");
    }

    if (parsed.data.allDevices && req.user) {
      await AuthService.logoutAll(req.user._id.toString());
    } else {
      await AuthService.logout(parsed.data.refreshToken, req.user?._id.toString());
    }

    res.json({ success: true, data: null });
  },

  /**
   * POST /auth/forgot-password
   */
  forgotPassword: async (req: Request, res: Response) => {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const result = await AuthService.forgotPassword(parsed.data);
    // Always 200 — never reveal whether the email exists
    res.json({ success: true, data: { expiresAt: result.expiresAt, lastSentAt: result.lastSentAt } });
  },

  /**
   * POST /auth/validate-reset-code
   */
  validateResetCode: async (req: Request, res: Response) => {
    const parsed = validateResetCodeSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await AuthService.validateResetCode(parsed.data);
    res.json({ success: true, data: null });
  },

  /**
   * POST /auth/reset-password
   */
  resetPassword: async (req: Request, res: Response) => {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await AuthService.resetPassword(parsed.data);
    res.json({ success: true, data: null });
  },

  /**
   * POST /auth/verify-email
   */
  verifyEmail: async (req: Request, res: Response) => {
    const parsed = verifyEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    const user = await AuthService.verifyEmail(parsed.data.email, parsed.data.code);
    res.json({ success: true, data: { user } });
  },

  /**
   * POST /auth/send-verification
   * Always returns 200 — never reveals whether the email exists or is already verified.
   */
  sendVerification: async (req: Request, res: Response) => {
    const parsed = sendVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
    }

    await AuthService.sendVerificationEmail(parsed.data.email);
    res.json({ success: true, data: null });
  },

  /**
   * GET /auth/me
   * Requires authentication middleware.
   */
  getMe: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Not authenticated" },
      });
    }

    const user = await AuthService.getMe(req.user._id.toString());
    res.json({ success: true, data: { user } });
  },
};
