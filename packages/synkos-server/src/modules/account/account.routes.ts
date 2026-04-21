import { Router, type IRouter } from "express";
import { authenticate } from "@/middleware/authenticate";
import { AccountController } from "./account.controller";

const router: IRouter = Router();

/**
 * All account management routes require authentication.
 *
 * POST   /account/deletion   → request deletion (starts 30-day grace period)
 * DELETE /account/deletion   → cancel pending deletion
 */
router.post("/deletion", authenticate, AccountController.requestDeletion);
router.delete("/deletion", authenticate, AccountController.cancelDeletion);

export default router;
