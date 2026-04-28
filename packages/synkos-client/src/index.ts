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
  TabMeta,
  SynkosMessages,
} from './types.js';

// ── API ───────────────────────────────────────────────────────────────────────
export { createApiClient, getApiClient } from './api/index.js';

// ── Auth services ─────────────────────────────────────────────────────────────
export { AuthService } from './auth/services/auth.service.js';
export { UserService } from './auth/services/user.service.js';
export { AccountService } from './auth/services/account.service.js';
export { UsernameService } from './auth/services/username.service.js';
export { notificationsService } from './services/notifications.service.js';
export type {
  UsernameCheckResult,
  PushNotificationHandler,
  PushActionHandler,
} from './services/index.js';

// ── Stores ────────────────────────────────────────────────────────────────────
export { useAuthStore } from './auth/store.js';
export { useSettingsStore } from './stores/settings.store.js';

// ── Composables ───────────────────────────────────────────────────────────────
export { useSignOut } from './composables/useSignOut.js';
export { usePullToRefresh } from './composables/usePullToRefresh.js';
export { useTheme } from './composables/useTheme.js';
export type { AppTheme } from './composables/useTheme.js';
export { usePlatform } from './composables/usePlatform.js';
export type { AppPlatform } from './composables/usePlatform.js';
export { useNavAction } from './navigation/composables/useNavAction.js';
export type { NavActionOptions } from './navigation/composables/useNavAction.js';
export { useNavTitle } from './navigation/composables/useNavTitle.js';
export { useSettings } from './vue/composables/useSettings.js';

// ── Boot factories (individual) ───────────────────────────────────────────────
export { createAuthBoot } from './auth/boot.js';
export { createI18nBoot } from './boot/i18n.js';
export { createNotificationsBoot } from './boot/notifications.js';
export { createSplashBoot } from './boot/splash.js';
export type { AuthBootOptions, ClientBootFn } from './auth/boot.js';
export type { I18nBootOptions } from './boot/i18n.js';
export type { NotificationsBootOptions } from './boot/notifications.js';

// ── Boot factory (unified) ────────────────────────────────────────────────────
export { createSynkosBoot } from './boot/synkos.js';
export type { SynkosBootOptions } from './boot/synkos.js';

// ── Router ────────────────────────────────────────────────────────────────────
// createSynkosRouter — all-in-one factory (simple apps)
export { createSynkosRouter } from './navigation/router.js';
export type {
  SynkosRouterOptions,
  AuthRoutesConfig,
  SettingsConfig,
  SettingsCustomSection,
  BuiltInSettingsSection,
} from './navigation/router.js';

// setupSynkosRouter + synkosSettingsRoutes — headless routing (full control)
export { setupSynkosRouter, synkosSettingsRoutes } from './navigation/router.js';
export type { SynkosSetupOptions } from './navigation/router.js';

// ── Layout components ─────────────────────────────────────────────────────────
export { default as MainLayout } from './navigation/layouts/MainLayout.vue';
export { default as AuthLayout } from './navigation/layouts/AuthLayout.vue';

// ── Vue components ────────────────────────────────────────────────────────────
export { default as SynkosApp } from './vue/SynkosApp.vue';
export { default as LegalBottomSheet } from './vue/components/LegalBottomSheet.vue';

// ── Auth UI components (for user-owned auth pages) ────────────────────────────
export { default as OtpInput } from './vue/components/auth/OtpInput.vue';
export { default as AuthFieldGroup } from './vue/components/auth/AuthFieldGroup.vue';
export { default as AuthFieldRow } from './vue/components/auth/AuthFieldRow.vue';
export { default as AuthFeedback } from './vue/components/auth/AuthFeedback.vue';

// ── Auth composables ──────────────────────────────────────────────────────────
export { usePasswordStrength } from './composables/usePasswordStrength.js';
export type { PasswordStrength, StrengthLevel } from './composables/usePasswordStrength.js';

// ── Internal config access (needed by user-owned auth pages) ──────────────────
export { getClientConfig } from './internal/app-config.js';

// ── i18n ──────────────────────────────────────────────────────────────────────
export { coreEnUS, coreEsES } from './i18n/index.js';
