import api from './api';

export interface UsernameCheckResult {
  username: string;
  available: boolean;
  error: string | null;
  errorMessage: string | null;
  suggestions: string[];
}

export const UsernameService = {
  /**
   * Check if a username is available (public, no auth required).
   * Also returns format errors and suggestions when taken.
   */
  async check(username: string): Promise<UsernameCheckResult> {
    const res = await api.get<{ success: boolean; data: UsernameCheckResult }>('/username/check', {
      params: { username },
    });
    return res.data.data;
  },

  /**
   * Set the username for the first time (authenticated).
   * Throws on conflict or validation failure.
   */
  async setUsername(username: string): Promise<string> {
    const res = await api.post<{ success: boolean; data: { username: string } }>('/username', {
      username,
    });
    return res.data.data.username;
  },

  /**
   * Change an existing username (authenticated, 30-day cooldown).
   * Throws on conflict, validation failure, or cooldown violation.
   */
  async changeUsername(username: string): Promise<string> {
    const res = await api.put<{ success: boolean; data: { username: string } }>('/username', {
      username,
    });
    return res.data.data.username;
  },
};
