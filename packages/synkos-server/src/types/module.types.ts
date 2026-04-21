import { Router } from "express";

/**
 * Contract that every module (core or feature) must export.
 * The app factory uses this to mount routers under the correct path.
 *
 * Authentication is handled inside each module's own routes file.
 * The `auth` field is informational — documents the module's access level.
 */
export type ModuleAuth = "required" | "optional" | "none" | "mixed";

export interface ModuleDefinition {
  /** Base path for the module, e.g. '/auth', '/cards' */
  path: string;
  router: Router;
  /**
   * Documents the module's authentication requirement.
   * - required: all routes need a valid access token
   * - optional: routes work for both authenticated and guest users
   * - none: no auth required (public)
   * - mixed: module handles auth per-route internally
   */
  auth?: ModuleAuth;
  /** Informational: marks module as admin-only */
  adminOnly?: boolean;
}
