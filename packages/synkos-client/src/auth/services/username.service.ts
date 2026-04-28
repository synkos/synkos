import { getApiClient } from '../../api/index.js';

export interface UsernameCheckResult {
  username: string;
  available: boolean;
  error: string | null;
  errorMessage: string | null;
  suggestions: string[];
}

export const UsernameService = {
  async check(username: string): Promise<UsernameCheckResult> {
    const res = await getApiClient().get<{ success: boolean; data: UsernameCheckResult }>(
      '/username/check',
      { params: { username } }
    );
    return res.data.data;
  },

  async setUsername(username: string): Promise<string> {
    const res = await getApiClient().post<{ success: boolean; data: { username: string } }>(
      '/username',
      { username }
    );
    return res.data.data.username;
  },

  async changeUsername(username: string): Promise<string> {
    const res = await getApiClient().put<{ success: boolean; data: { username: string } }>(
      '/username',
      { username }
    );
    return res.data.data.username;
  },
};
