import type { RouteRecordRaw } from 'vue-router';
import { settingsRoutes } from './settings.routes';

/**
 * Core template routes — auth flow, full-screen experiences, and all
 * settings sections. These are shared across every app built from this
 * template and should not be modified when customising for a specific app.
 *
 * App-specific tab routes live in app.routes.ts.
 */

// ── Full-screen auth flow ─────────────────────────────────────────────────────
// Uses AuthLayout (no tab bar, no nav bar) for unobstructed full-screen UI.
export const coreAuthRoute: RouteRecordRaw = {
  path: '/auth',
  component: () => import('src/core/layouts/AuthLayout.vue'),
  children: [
    {
      path: 'login',
      name: 'auth-login',
      component: () => import('src/core/auth/pages/LoginPage.vue'),
    },
    {
      // Shown after first OAuth sign-in when no username is set yet
      path: 'username',
      name: 'auth-username',
      component: () => import('src/core/auth/pages/UsernamePickerPage.vue'),
    },
  ],
};

// ── Profile tab (shell — content via ProfilePage) ─────────────────────────────
// Declared here so the profile route is part of the template.
// The tab content (stats, activity…) is customised in ProfilePage itself.
export const coreProfileRoute: RouteRecordRaw = {
  path: 'profile',
  name: 'profile',
  component: () => import('src/core/profile/pages/ProfilePage.vue'),
};

// ── Settings sections (all menu-access routes) ────────────────────────────────
// Re-exported so index.ts can spread them alongside app routes.
export { settingsRoutes as coreSettingsRoutes };
