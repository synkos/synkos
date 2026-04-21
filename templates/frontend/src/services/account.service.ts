import api from './api';

export const AccountService = {
  /**
   * Request account deletion. Starts the 30-day grace period.
   * Returns the ISO date string when the account will be permanently deleted.
   *
   * @param password - Required for users with a local (email/password) provider.
   */
  async requestDeletion(password?: string): Promise<{ scheduledAt: string }> {
    const res = await api.post<{ success: boolean; data: { scheduledAt: string } }>(
      '/account/deletion',
      { password },
    );
    return res.data.data;
  },

  /**
   * Cancel a pending account deletion during the 30-day grace period.
   */
  async cancelDeletion(): Promise<void> {
    await api.delete('/account/deletion');
  },
};
