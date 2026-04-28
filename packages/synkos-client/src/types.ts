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

import type { Component, Ref, ComputedRef } from 'vue';
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
  /** Lazy-loaded component factory (optional when using meta.tab pattern) */
  component?: () => Promise<{ default: Component }>;
  /** Reactive or static badge count. Shown as a pill on the tab icon. */
  badge?: Ref<number> | ComputedRef<number> | number;
  /** If true, the tab's component is included in keep-alive cache. Default: false */
  cache?: boolean;
  /**
   * Vue component name for keep-alive matching.
   * When set, used instead of the auto-derived "${name}Page" convention.
   * Required for keep-alive to work correctly with the meta.tab pattern.
   */
  componentName?: string;
}

/** Declared inline on a route via meta.tab — alternative to AppTabRoute array */
export interface TabMeta {
  /** Material icon name for the tab bar */
  icon: string;
  /** i18n key resolved reactively in the tab bar (e.g. 'tabs.home') */
  labelKey: string;
  /** If true, the tab's component is included in keep-alive cache. Default: false */
  cache?: boolean;
  /**
   * Vue component name for keep-alive matching.
   * Set this to the component's `name` option when cache is true.
   */
  componentName?: string;
  /** Reactive or static badge count. Shown as a pill on the tab icon. */
  badge?: Ref<number> | ComputedRef<number> | number;
}

/** Merge utility: produces a type that combines core i18n keys with app-specific keys */
export type SynkosMessages<AppMessages> = typeof coreEnUS & AppMessages;
