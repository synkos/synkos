import type { RouteRecordRaw } from 'vue-router';
import { coreAuthRoute, coreProfileRoute, coreSettingsRoutes } from './core.routes';
import { appTabRoutes } from './app.routes';

// Extend RouteMeta for type-safe i18n-aware navigation bar fields.
// titleKey/parentTitleKey are resolved in MainLayout via t() so titles
// update instantly on locale change — no hardcoded strings in route config.
declare module 'vue-router' {
  interface RouteMeta {
    /** i18n key for the iOS nav bar title */
    titleKey?: string;
    /** i18n key for the back button label */
    parentTitleKey?: string;
    /** Route requires a fully authenticated user (not guest) */
    requiresAuth?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  // ── Core: auth flow (full-screen, no tab bar) ─────────────────────────
  coreAuthRoute,

  // ── App: full-screen experiences (camera, onboarding…) ───────────────
  // Uncomment when you export appFullscreen from app.routes.ts:
  // appFullscreen,

  // ── Main app shell (tab bar + nav bar) ───────────────────────────────
  {
    path: '/',
    component: () => import('src/core/layouts/MainLayout.vue'),
    children: [
      // App-specific tabs (home, collection, grade-center, feed…)
      ...appTabRoutes,
      // Core profile tab (always present in every app)
      coreProfileRoute,
      // Core settings sections (/settings/*)
      ...coreSettingsRoutes,
    ],
  },

  // ── 404 ──────────────────────────────────────────────────────────────
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue'),
  },
];

export default routes;
