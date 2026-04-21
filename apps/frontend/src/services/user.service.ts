import api from './api';
import type { PublicUser } from 'src/types/auth';

// ── Response wrappers ─────────────────────────────────────────────────────────

interface UserResponse {
  success: boolean;
  data: { user: PublicUser };
}

// ── UserService ───────────────────────────────────────────────────────────────

export const UserService = {
  /**
   * PATCH /user/name
   * Update the authenticated user's display name (2–50 characters).
   */
  async updateName(name: string): Promise<PublicUser> {
    const res = await api.patch<UserResponse>('/user/name', { name });
    return res.data.data.user;
  },

  /**
   * PATCH /user/username
   * Change username (30-day cooldown, reservation logic).
   * Throws with structured error codes: USERNAME_TAKEN, USERNAME_RESERVED,
   * USERNAME_INVALID, USERNAME_CHANGE_TOO_SOON.
   */
  async updateUsername(username: string): Promise<PublicUser> {
    const res = await api.patch<UserResponse>('/user/username', { username });
    return res.data.data.user;
  },

  /**
   * PATCH /user/photo
   * Upload a new avatar. Sends multipart/form-data.
   * Returns the updated user with the new avatar URL.
   */
  async updatePhoto(file: File): Promise<PublicUser> {
    const formData = new FormData();
    formData.append('photo', file);

    const res = await api.patch<UserResponse>('/user/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.user;
  },

  /**
   * PATCH /user/photo (no file body)
   * Remove the current avatar — reverts to the default placeholder.
   */
  async removePhoto(): Promise<PublicUser> {
    const res = await api.patch<UserResponse>('/user/photo');
    return res.data.data.user;
  },

  /**
   * PATCH /user/password
   * Change password for local-auth accounts.
   * Invalidates all sessions on success — the caller should handle re-login UX.
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.patch('/user/password', { currentPassword, newPassword });
  },

  /**
   * PATCH /user/push-token
   * Register the device APNs token so the backend can send push notifications.
   * Safe to call on every app launch — the backend deduplicates.
   */
  async registerPushToken(token: string): Promise<void> {
    await api.patch('/user/push-token', { token });
  },

  async unregisterPushToken(token: string): Promise<void> {
    await api.delete('/user/push-token', { data: { token } });
  },
};
