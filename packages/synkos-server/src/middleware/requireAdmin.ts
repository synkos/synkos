import { Request, Response, NextFunction } from "express";

/**
 * Middleware that rejects requests from non-admin users with 403.
 * Must be used AFTER `authenticate` so that req.user is populated.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Admin access required." },
    });
    return;
  }
  next();
}
