export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  username?: string;
  usernameChangedAt?: string;
  avatar?: string;
  isEmailVerified: boolean;
  role: string;
  providers: string[];
  deletionStatus: 'active' | 'pending_deletion';
  deletionScheduledAt?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: PublicUser;
  tokens: TokenPair;
}

export interface DeviceInfo {
  platform?: string;
  deviceId?: string;
  deviceName?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
}

export interface ForgotPasswordDto {
  email: string;
  force?: boolean;
}

export interface ForgotPasswordResult {
  expiresAt: string;
  lastSentAt: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface OAuthDto {
  idToken: string;
  email?: string;
  displayName?: string;
  deviceInfo?: DeviceInfo;
}

// ── Vue / Router ───────────────────────────────────────────────────────────────

import type { Component } from 'vue';
import type coreEnUS from './i18n/en-US.js';

export interface AppTabRoute {
  /** Route path — use '/' for the default/home tab */
  path: string;
  /** Vue Router route name */
  name: string;
  /** Material icon name for the tab bar */
  icon: string;
  /** i18n key resolved reactively in the tab bar (e.g. 'tabs.home') */
  labelKey: string;
  /** Lazy-loaded component factory */
  component: () => Promise<{ default: Component }>;
}

/** Merge utility: produces a type that combines core i18n keys with app-specific keys */
export type SynkosMessages<AppMessages> = typeof coreEnUS & AppMessages;
