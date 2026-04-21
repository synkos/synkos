import { Request, Response } from "express";
import { AccountService } from "./account.service";
import type { RequestDeletionDto } from "./account.types";

export const AccountController = {
  /**
   * POST /account/deletion
   *
   * Schedule the current user's account for deletion.
   * Requires re-authentication (password) for users with a local provider.
   */
  async requestDeletion(req: Request, res: Response): Promise<void> {
    const userId = req.user!._id.toString();
    const { password } = req.body as RequestDeletionDto;

    const { scheduledAt } = await AccountService.requestDeletion(userId, password);

    res.status(200).json({
      success: true,
      data: { scheduledAt: scheduledAt.toISOString() },
    });
  },

  /**
   * DELETE /account/deletion
   *
   * Cancel a pending account deletion during the grace period.
   */
  async cancelDeletion(req: Request, res: Response): Promise<void> {
    const userId = req.user!._id.toString();

    await AccountService.cancelDeletion(userId);

    res.json({ success: true, data: null });
  },
};
