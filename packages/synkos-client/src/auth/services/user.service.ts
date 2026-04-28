import { getApiClient } from '../../api/index.js';
import type { PublicUser } from '../../types.js';

interface UserResponse {
  success: boolean;
  data: { user: PublicUser };
}

export const UserService = {
  async updateName(name: string): Promise<PublicUser> {
    const res = await getApiClient().patch<UserResponse>('/user/name', { name });
    return res.data.data.user;
  },

  async updatePhoto(file: File): Promise<PublicUser> {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await getApiClient().patch<UserResponse>('/user/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.user;
  },

  async removePhoto(): Promise<PublicUser> {
    const res = await getApiClient().patch<UserResponse>('/user/photo');
    return res.data.data.user;
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await getApiClient().patch('/user/password', { currentPassword, newPassword });
  },

  async registerPushToken(token: string): Promise<void> {
    await getApiClient().patch('/user/push-token', { token });
  },

  async unregisterPushToken(token: string): Promise<void> {
    await getApiClient().delete('/user/push-token', { data: { token } });
  },
};
