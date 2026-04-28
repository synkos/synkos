import { getApiClient } from '../../api/index.js';

export const AccountService = {
  async requestDeletion(password?: string): Promise<{ scheduledAt: string }> {
    const res = await getApiClient().post<{ success: boolean; data: { scheduledAt: string } }>(
      '/account/deletion',
      { password }
    );
    return res.data.data;
  },

  async cancelDeletion(): Promise<void> {
    await getApiClient().delete('/account/deletion');
  },
};
