// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  PublicUser,
  TokenPair,
  AuthResponse,
  DeviceInfo,
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ForgotPasswordResult,
  ResetPasswordDto,
  OAuthDto,
  AppTabRoute,
  SynkosMessages,
} from './types.js';

// ── API ───────────────────────────────────────────────────────────────────────
export { createApiClient, getApiClient } from './api/index.js';

// ── Services ──────────────────────────────────────────────────────────────────
export { AuthService } from './services/auth.service.js';
export { UserService } from './services/user.service.js';
export { AccountService } from './services/account.service.js';
export { UsernameService } from './services/username.service.js';
export { notificationsService } from './services/notifications.service.js';
export type {
  UsernameCheckResult,
  PushNotificationHandler,
  PushActionHandler,
} from './services/index.js';

// ── Stores ────────────────────────────────────────────────────────────────────
export { useAuthStore } from './stores/auth.store.js';
export { useSettingsStore } from './stores/settings.store.js';

// ── Composables ───────────────────────────────────────────────────────────────
export { useSignOut } from './composables/useSignOut.js';
export { usePullToRefresh } from './composables/usePullToRefresh.js';

// ── Boot factories (individual) ───────────────────────────────────────────────
export { createAuthBoot } from './boot/auth.js';
export { createI18nBoot } from './boot/i18n.js';
export { createNotificationsBoot } from './boot/notifications.js';
export { createSplashBoot } from './boot/splash.js';
export type { AuthBootOptions, ClientBootFn } from './boot/auth.js';
export type { I18nBootOptions } from './boot/i18n.js';
export type { NotificationsBootOptions } from './boot/notifications.js';

// ── Boot factory (unified) ────────────────────────────────────────────────────
export { createSynkosBoot } from './boot/synkos.js';
export type { SynkosBootOptions } from './boot/synkos.js';

// ── Router factory ────────────────────────────────────────────────────────────
export { createSynkosRouter } from './vue/router.js';
export type { SynkosRouterOptions } from './vue/router.js';

// ── Vue components ────────────────────────────────────────────────────────────
export { default as SynkosApp } from './vue/SynkosApp.vue';

// ── i18n ──────────────────────────────────────────────────────────────────────
export { coreEnUS, coreEsES } from './i18n/index.js';
