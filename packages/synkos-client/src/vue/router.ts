import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
  type RouteRecordRaw,
  type Router,
} from 'vue-router';
import type { AppConfig } from 'synkos';
import type { AppTabRoute } from '../types.js';
import { setTabConfig } from '../internal/tab-config.js';
import { useAuthStore } from '../stores/auth.store.js';

// Extend RouteMeta for type-safe i18n-aware nav bar fields
declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string;
    parentTitleKey?: string;
    requiresAuth?: boolean;
  }
}

function buildRoutes(appTabRoutes: AppTabRoute[]): RouteRecordRaw[] {
  return [
    // ── Auth flow (full-screen, no tab bar) ─────────────────────────────────
    {
      path: '/auth',
      component: () => import('./layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'auth-login',
          component: () => import('./pages/auth/LoginPage.vue'),
        },
        {
          path: 'username',
          name: 'auth-username',
          component: () => import('./pages/auth/UsernamePickerPage.vue'),
        },
      ],
    },

    // ── Main app shell (tab bar + nav bar) ──────────────────────────────────
    {
      path: '/',
      component: () => import('./layouts/MainLayout.vue'),
      children: [
        // User-defined tab routes
        ...appTabRoutes.map(({ path, name, component }) => ({ path, name, component })),

        // Core profile tab (always present)
        {
          path: 'profile',
          name: 'profile',
          component: () => import('./pages/profile/ProfilePage.vue'),
        },

        // Settings sections
        {
          path: 'settings/account',
          name: 'settings-account',
          meta: { titleKey: 'nav.myAccount' },
          component: () => import('./pages/settings/account/pages/AccountHubPage.vue'),
        },
        {
          path: 'settings/account/edit',
          name: 'settings-account-edit',
          meta: { titleKey: 'nav.editProfile', parentTitleKey: 'nav.myAccount' },
          component: () => import('./pages/settings/account/pages/EditProfilePage.vue'),
        },
        {
          path: 'settings/account/username',
          name: 'settings-account-username',
          meta: { titleKey: 'nav.changeUsername', parentTitleKey: 'nav.editProfile' },
          component: () => import('./pages/settings/account/pages/ChangeUsernamePage.vue'),
        },
        {
          path: 'settings/account/password',
          name: 'settings-account-password',
          meta: { titleKey: 'nav.changePassword', parentTitleKey: 'nav.editProfile' },
          component: () => import('./pages/settings/account/pages/ChangePasswordPage.vue'),
        },
        {
          path: 'settings/account/delete',
          name: 'settings-account-delete',
          meta: { titleKey: 'pages.deleteAccount.step1.title', parentTitleKey: 'nav.myAccount' },
          component: () => import('./pages/settings/account/pages/DeleteAccountPage.vue'),
        },
        {
          path: 'settings/preferences',
          name: 'settings-preferences',
          meta: { titleKey: 'nav.preferences' },
          component: () => import('./pages/settings/preferences/PreferencesHubPage.vue'),
        },
        {
          path: 'settings/preferences/language',
          name: 'settings-preferences-language',
          meta: {
            titleKey: 'pages.settings.preferenciasSection.idioma',
            parentTitleKey: 'nav.preferences',
          },
          component: () => import('./pages/settings/preferences/LanguagePage.vue'),
        },
        {
          path: 'settings/notifications',
          name: 'settings-notifications',
          meta: { titleKey: 'nav.notifications' },
          component: () => import('./pages/settings/notifications/NotificationsHubPage.vue'),
        },
        {
          path: 'settings/security',
          name: 'settings-security',
          meta: { titleKey: 'nav.security' },
          component: () => import('./pages/settings/security/SecurityHubPage.vue'),
        },
        {
          path: 'settings/billing',
          name: 'settings-billing',
          meta: { titleKey: 'nav.billing' },
          component: () => import('./pages/settings/billing/BillingHubPage.vue'),
        },
        {
          path: 'settings/support',
          name: 'settings-support',
          meta: { titleKey: 'nav.support' },
          component: () => import('./pages/settings/support/SupportHubPage.vue'),
        },
        {
          path: 'settings/support/help',
          name: 'settings-support-help',
          meta: { titleKey: 'nav.help', parentTitleKey: 'nav.support' },
          component: () => import('./pages/settings/support/HelpPage.vue'),
        },
        {
          path: 'settings/legal',
          name: 'settings-legal',
          meta: { titleKey: 'nav.legal' },
          component: () => import('./pages/settings/legal/LegalHubPage.vue'),
        },
        {
          path: 'settings/about',
          name: 'settings-about',
          meta: { titleKey: 'nav.acercaDe' },
          component: () => import('./pages/settings/about/AboutHubPage.vue'),
        },
      ],
    },

    // ── 404 ─────────────────────────────────────────────────────────────────
    {
      path: '/:catchAll(.*)*',
      component: () => import('./pages/ErrorNotFound.vue'),
    },
  ];
}

export interface SynkosRouterOptions {
  config: AppConfig;
  appTabRoutes: AppTabRoute[];
  /** Override the 404 component. Defaults to the built-in ErrorNotFound page. */
  notFoundComponent?: () => Promise<unknown>;
}

export function createSynkosRouter(options: SynkosRouterOptions): Router;
export function createSynkosRouter(config: AppConfig, appTabRoutes: AppTabRoute[]): Router;
export function createSynkosRouter(
  configOrOptions: AppConfig | SynkosRouterOptions,
  maybeTabRoutes?: AppTabRoute[]
): Router {
  let appTabRoutes: AppTabRoute[];

  if (maybeTabRoutes !== undefined) {
    appTabRoutes = maybeTabRoutes;
  } else {
    const opts = configOrOptions as SynkosRouterOptions;
    appTabRoutes = opts.appTabRoutes;
  }

  // Register tab config for MainLayout dynamic tab rendering
  setTabConfig([
    ...appTabRoutes,
    {
      path: '/profile',
      name: 'profile',
      icon: 'person',
      labelKey: 'tabs.profile',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: () => import('./pages/profile/ProfilePage.vue') as any,
    },
  ]);

  const createHistory =
    process.env.SERVER === 'true'
      ? createMemoryHistory
      : process.env.VUE_ROUTER_MODE === 'history'
        ? createWebHistory
        : createWebHashHistory;

  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes: buildRoutes(appTabRoutes),
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    const isPublicRoute = to.name === 'auth-login';
    const canAccess = authStore.isAuthenticated || authStore.isGuest;

    if (isPublicRoute && authStore.isAuthenticated && authStore.user?.isEmailVerified) {
      return { name: 'home' };
    }

    if (!isPublicRoute && !canAccess) {
      return { name: 'auth-login' };
    }

    if (
      !isPublicRoute &&
      authStore.isAuthenticated &&
      !authStore.isGuest &&
      !authStore.user?.isEmailVerified
    ) {
      return { name: 'auth-login', query: { verify: '1' } };
    }

    return true;
  });

  return router;
}
