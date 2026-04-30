import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
  type RouteRecordRaw,
  type Router,
  type RouteMeta,
} from 'vue-router';
import type { AppConfig } from 'synkos';
import type { AppTabRoute, TabMeta } from '../types.js';
export type { TabMeta };
import { setTabConfig, getTabConfig } from './internal/tab-config.js';
import { setSettingsConfig, ALL_SECTIONS } from './internal/settings-config.js';
import { setPostAuthRoute, getPostAuthRoute } from './internal/post-auth.js';
import { setTabTransitionName } from './internal/nav-state.js';
import { useAuthStore } from '../auth/store.js';

// ── Tab transition direction ───────────────────────────────────────────────────
//
// Computes the Vue `<transition>` name to apply on the route swap by comparing
// the tab index of `from` vs `to`. Centralised here (router-level) so every
// navigation path is covered: tab tap, back button, deep link, programmatic
// router.push, browser back. The previous click-based logic in MainLayout left
// every other navigation source on a stale direction.
//
// Names match the CSS classes in MainLayout's non-scoped <style> block:
// `tab-slide-left`, `tab-slide-right`, `tab-fade`.

function tabIndexOf(path: string): number {
  const tabs = getTabConfig();
  // First exact match wins; otherwise pick the deepest prefix match so that
  // sub-routes (e.g. `/projects/:id`) inherit the index of their parent tab.
  const exact = tabs.findIndex((t) => t.path === path);
  if (exact !== -1) return exact;
  let best = -1;
  let bestLen = 0;
  tabs.forEach((t, i) => {
    if (t.path === '/') return;
    if (path === t.path || path.startsWith(t.path + '/')) {
      if (t.path.length > bestLen) {
        best = i;
        bestLen = t.path.length;
      }
    }
  });
  if (best !== -1) return best;
  // Root tab as last-resort match for the literal '/' path.
  return tabs.findIndex((t) => t.path === '/' && (path === '/' || path === ''));
}

function computeTabTransitionName(toPath: string, fromPath: string | undefined): string {
  // Initial mount (no previous route) — never slide; cold start should not look
  // like a navigation animation.
  if (!fromPath) return 'tab-fade';
  if (toPath === fromPath) return 'tab-fade';

  const ti = tabIndexOf(toPath);
  const fi = tabIndexOf(fromPath);

  // At least one side isn't a tab (auth, modal, sub-route) → fade.
  // Phase C will introduce a dedicated push transition for sub-routes.
  if (ti === -1 || fi === -1) return 'tab-fade';
  if (ti === fi) return 'tab-fade';
  return ti > fi ? 'tab-slide-left' : 'tab-slide-right';
}

function installTabTransitionGuard(router: Router): void {
  router.afterEach((to, from) => {
    const fromPath = from.matched.length === 0 ? undefined : from.path;
    setTabTransitionName(computeTabTransitionName(to.path, fromPath));
  });
}

// Extend RouteMeta for type-safe i18n-aware nav bar fields
declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string;
    parentTitleKey?: string;
    /**
     * Set to false to mark a route as public (no auth required).
     * Used by setupSynkosRouter's guard. Routes under /auth are implicitly public.
     */
    requiresAuth?: boolean;
    /** Hide the tab bar on this route (e.g. fullscreen modals) */
    hideTabBar?: boolean;
    /**
     * Declare this route as a tab bar item.
     * Used by setupSynkosRouter to auto-register tabs from route definitions.
     * Tabs appear in the order they are declared in the routes array.
     */
    tab?: TabMeta;
    // ── Custom layout fields (extend as needed in your own RouteMeta) ──────
    /** Show a back button in custom layouts (e.g. OnboardingLayout) */
    canGoBack?: boolean;
    /** Show a skip button in custom layouts */
    canSkip?: boolean;
    /** Route name to navigate to when skip is pressed */
    skipTo?: string;
  }
}

// ── Settings configuration ─────────────────────────────────────────────────────

export type BuiltInSettingsSection =
  | 'account'
  | 'preferences'
  | 'notifications'
  | 'security'
  | 'billing'
  | 'support'
  | 'legal'
  | 'about';

export interface SettingsCustomSection {
  /** Path segment relative to 'settings/' (e.g. 'billing' → '/settings/billing') */
  path: string;
  name: string;
  titleKey: string;
  parentTitleKey?: string;
  component: () => Promise<unknown>;
}

export interface SettingsConfig {
  /**
   * Which built-in settings sections to include.
   * If omitted, all sections are included.
   */
  sections?: BuiltInSettingsSection[];
  /** Additional custom settings sections */
  customSections?: SettingsCustomSection[];
}

// ── Auth routes configuration ──────────────────────────────────────────────────

export interface AuthRoutesConfig {
  /** Override the login page component. Defaults to the built-in LoginPage. */
  login?: () => Promise<unknown>;
  /** Override the username picker page. Defaults to the built-in UsernamePickerPage. */
  usernamePicker?: () => Promise<unknown>;
}

// ── Router options ─────────────────────────────────────────────────────────────

export interface SynkosRouterOptions {
  config: AppConfig;
  appTabRoutes: AppTabRoute[];
  /** Override the 404 component. Defaults to the built-in ErrorNotFound page. */
  notFoundComponent?: () => Promise<unknown>;
  /**
   * Override auth page components with your own implementations.
   * The auth store, services, and i18n are still provided by the framework —
   * only the UI layer changes.
   */
  authRoutes?: AuthRoutesConfig;
  /**
   * Configure which built-in settings sections are available and add custom ones.
   * If omitted, all sections are included.
   */
  settingsConfig?: SettingsConfig;
}

// ── Settings route map ─────────────────────────────────────────────────────────

interface SettingsRouteEntry {
  section: BuiltInSettingsSection;
  routes: RouteRecordRaw[];
}

function buildSettingsRoutes(): SettingsRouteEntry[] {
  return [
    {
      section: 'account',
      routes: [
        {
          path: 'settings/account',
          name: 'settings-account',
          meta: { titleKey: 'nav.myAccount' },
          component: () => import('../vue/pages/settings/account/pages/AccountHubPage.vue'),
        },
        {
          path: 'settings/account/edit',
          name: 'settings-account-edit',
          meta: { titleKey: 'nav.editProfile', parentTitleKey: 'nav.myAccount' },
          component: () => import('../vue/pages/settings/account/pages/EditProfilePage.vue'),
        },
        {
          path: 'settings/account/username',
          name: 'settings-account-username',
          meta: { titleKey: 'nav.changeUsername', parentTitleKey: 'nav.editProfile' },
          component: () => import('../vue/pages/settings/account/pages/ChangeUsernamePage.vue'),
        },
        {
          path: 'settings/account/password',
          name: 'settings-account-password',
          meta: { titleKey: 'nav.changePassword', parentTitleKey: 'nav.editProfile' },
          component: () => import('../vue/pages/settings/account/pages/ChangePasswordPage.vue'),
        },
        {
          path: 'settings/account/delete',
          name: 'settings-account-delete',
          meta: {
            titleKey: 'pages.deleteAccount.step1.title',
            parentTitleKey: 'nav.myAccount',
          },
          component: () => import('../vue/pages/settings/account/pages/DeleteAccountPage.vue'),
        },
      ],
    },
    {
      section: 'preferences',
      routes: [
        {
          path: 'settings/preferences',
          name: 'settings-preferences',
          meta: { titleKey: 'nav.preferences' },
          component: () => import('../vue/pages/settings/preferences/PreferencesHubPage.vue'),
        },
        {
          path: 'settings/preferences/language',
          name: 'settings-preferences-language',
          meta: {
            titleKey: 'pages.settings.preferenciasSection.idioma',
            parentTitleKey: 'nav.preferences',
          },
          component: () => import('../vue/pages/settings/preferences/LanguagePage.vue'),
        },
      ],
    },
    {
      section: 'notifications',
      routes: [
        {
          path: 'settings/notifications',
          name: 'settings-notifications',
          meta: { titleKey: 'nav.notifications' },
          component: () => import('../vue/pages/settings/notifications/NotificationsHubPage.vue'),
        },
      ],
    },
    {
      section: 'security',
      routes: [
        {
          path: 'settings/security',
          name: 'settings-security',
          meta: { titleKey: 'nav.security' },
          component: () => import('../vue/pages/settings/security/SecurityHubPage.vue'),
        },
      ],
    },
    {
      section: 'billing',
      routes: [
        {
          path: 'settings/billing',
          name: 'settings-billing',
          meta: { titleKey: 'nav.billing' },
          component: () => import('../vue/pages/settings/billing/BillingHubPage.vue'),
        },
      ],
    },
    {
      section: 'support',
      routes: [
        {
          path: 'settings/support',
          name: 'settings-support',
          meta: { titleKey: 'nav.support' },
          component: () => import('../vue/pages/settings/support/SupportHubPage.vue'),
        },
        {
          path: 'settings/support/help',
          name: 'settings-support-help',
          meta: { titleKey: 'nav.help', parentTitleKey: 'nav.support' },
          component: () => import('../vue/pages/settings/support/HelpPage.vue'),
        },
      ],
    },
    {
      section: 'legal',
      routes: [
        {
          path: 'settings/legal',
          name: 'settings-legal',
          meta: { titleKey: 'nav.legal' },
          component: () => import('../vue/pages/settings/legal/LegalHubPage.vue'),
        },
      ],
    },
    {
      section: 'about',
      routes: [
        {
          path: 'settings/about',
          name: 'settings-about',
          meta: { titleKey: 'nav.acercaDe' },
          component: () => import('../vue/pages/settings/about/AboutHubPage.vue'),
        },
      ],
    },
  ];
}

// ── Route builder ──────────────────────────────────────────────────────────────

function buildRoutes(appTabRoutes: AppTabRoute[], opts: SynkosRouterOptions): RouteRecordRaw[] {
  const loginComponent =
    opts.authRoutes?.login ?? (() => import('../vue/pages/auth/LoginPage.vue'));
  const usernameComponent =
    opts.authRoutes?.usernamePicker ?? (() => import('../vue/pages/auth/UsernamePickerPage.vue'));
  const notFoundComponent =
    opts.notFoundComponent ?? (() => import('../vue/pages/ErrorNotFound.vue'));

  // Resolve which settings sections to include
  const enabledSections = opts.settingsConfig?.sections ?? ALL_SECTIONS;
  const settingsMap = buildSettingsRoutes();
  const settingsRoutes: RouteRecordRaw[] = settingsMap
    .filter((entry) => enabledSections.includes(entry.section))
    .flatMap((entry) => entry.routes);

  // Custom settings sections
  const customSettingsRoutes: RouteRecordRaw[] = (opts.settingsConfig?.customSections ?? []).map(
    (s) => ({
      path: `settings/${s.path}`,
      name: s.name,
      meta: {
        titleKey: s.titleKey,
        ...(s.parentTitleKey ? { parentTitleKey: s.parentTitleKey } : {}),
      } as RouteMeta,
      component: s.component,
    })
  );

  return [
    // ── Auth flow (full-screen, no tab bar) ─────────────────────────────────
    {
      path: '/auth',
      component: () => import('./layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'auth-login',
          component: loginComponent,
        },
        {
          path: 'username',
          name: 'auth-username',
          component: usernameComponent,
        },
      ],
    },

    // ── Main app shell (tab bar + nav bar) ──────────────────────────────────
    {
      path: '/',
      component: () => import('./layouts/MainLayout.vue'),
      children: [
        // User-defined tab routes
        ...appTabRoutes.map(({ path, name, component }) => ({ path, name, component: component! })),

        // Core profile tab (always present)
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../vue/pages/profile/ProfilePage.vue'),
        },

        // Settings — filtered by settingsConfig + custom sections
        ...settingsRoutes,
        ...customSettingsRoutes,
      ],
    },

    // ── 404 ─────────────────────────────────────────────────────────────────
    {
      path: '/:catchAll(.*)*',
      component: notFoundComponent,
    },
  ];
}

// ── Router factory ─────────────────────────────────────────────────────────────

export function createSynkosRouter(options: SynkosRouterOptions): Router;
export function createSynkosRouter(config: AppConfig, appTabRoutes: AppTabRoute[]): Router;
export function createSynkosRouter(
  configOrOptions: AppConfig | SynkosRouterOptions,
  maybeTabRoutes?: AppTabRoute[]
): Router {
  let opts: SynkosRouterOptions;

  if (maybeTabRoutes !== undefined) {
    opts = {
      config: configOrOptions as AppConfig,
      appTabRoutes: maybeTabRoutes,
    };
  } else {
    opts = configOrOptions as SynkosRouterOptions;
  }

  // Persist settings config so AppMenuDrawer can read it reactively
  setSettingsConfig({
    sections: opts.settingsConfig?.sections ?? ALL_SECTIONS,
    customSections: opts.settingsConfig?.customSections ?? [],
  });

  // Default post-auth target: first user-declared tab route, falling back to 'home'.
  setPostAuthRoute({ name: (opts.appTabRoutes[0]?.name as string) ?? 'home' });

  // Register tab config for MainLayout dynamic tab rendering
  setTabConfig([
    ...opts.appTabRoutes,
    {
      path: '/profile',
      name: 'profile',
      icon: 'person',
      labelKey: 'tabs.profile',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component: () => import('../vue/pages/profile/ProfilePage.vue') as any,
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
    routes: buildRoutes(opts.appTabRoutes, opts),
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    const isPublicRoute = to.name === 'auth-login';
    const canAccess = authStore.isAuthenticated || authStore.isGuest;

    if (isPublicRoute && authStore.isAuthenticated && authStore.user?.isEmailVerified) {
      return getPostAuthRoute();
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

  installTabTransitionGuard(router);

  return router;
}

// ── synkosSettingsRoutes ───────────────────────────────────────────────────────
//
// Returns ready-made route records for profile + settings sections.
// Spread these into your MainLayout children to get Synkos's built-in pages
// without managing 15+ routes by hand.
//
// Usage:
//   children: [
//     { path: '', name: 'home', meta: { tab: { icon: 'home', labelKey: 'tabs.home' } }, component: HomePage },
//     ...synkosSettingsRoutes({ sections: ['account', 'preferences'] }),
//   ]

export function synkosSettingsRoutes(config?: SettingsConfig): RouteRecordRaw[] {
  const enabledSections = config?.sections ?? ALL_SECTIONS;
  const settingsMap = buildSettingsRoutes();

  const settingsRoutes = settingsMap
    .filter((entry) => enabledSections.includes(entry.section))
    .flatMap((entry) => entry.routes);

  const customRoutes: RouteRecordRaw[] = (config?.customSections ?? []).map((s) => ({
    path: `settings/${s.path}`,
    name: s.name,
    meta: {
      titleKey: s.titleKey,
      ...(s.parentTitleKey ? { parentTitleKey: s.parentTitleKey } : {}),
    } as RouteMeta,
    component: s.component,
  }));

  const profileRoute: RouteRecordRaw = {
    path: 'profile',
    name: 'profile',
    meta: { tab: { icon: 'person', labelKey: 'tabs.profile' } },
    component: () => import('../vue/pages/profile/ProfilePage.vue'),
  };

  return [profileRoute, ...settingsRoutes, ...customRoutes];
}

// ── setupSynkosRouter ─────────────────────────────────────────────────────────
//
// Alternative to createSynkosRouter for headless routing.
// Takes a fully-constructed Vue Router and wires up Synkos:
//   - Auto-discovers tabs from routes with meta.tab
//   - Registers settings config for AppMenuDrawer
//   - Installs the auth guard
//
// Usage:
//   const router = createRouter({ history, routes })
//   setupSynkosRouter(router, { settingsConfig: { sections: ['account'] } })

export interface SynkosSetupOptions {
  /** Which settings sections AppMenuDrawer should show. Default: all sections. */
  settingsConfig?: SettingsConfig;
  /**
   * Route name for the login page. Used to redirect unauthenticated users.
   * Default: 'auth-login'
   */
  loginRouteName?: string;
  /**
   * Route name to redirect authenticated users away from the login page.
   * Default: the first route with meta.tab, or 'home'.
   */
  homeRouteName?: string;
}

export function setupSynkosRouter(router: Router, options: SynkosSetupOptions = {}): void {
  const loginRoute = options.loginRouteName ?? 'auth-login';

  // ── Discover tabs from meta.tab declarations ───────────────────────────────
  // router.getRoutes() returns all flat route records with resolved absolute paths.
  // We filter by meta.tab and preserve their declaration order.
  const tabRecords = router
    .getRoutes()
    .filter((r) => r.meta?.tab && r.name)
    .map((r) => ({
      path: r.path,
      name: r.name as string,
      icon: r.meta.tab!.icon,
      labelKey: r.meta.tab!.labelKey,
      cache: r.meta.tab!.cache ?? false,
      componentName: r.meta.tab!.componentName,
      badge: r.meta.tab!.badge,
      // component not used by MainLayout for rendering — routing handles it
      component: (() => Promise.resolve({ default: {} })) as AppTabRoute['component'],
    }));

  if (tabRecords.length > 0) {
    setTabConfig(tabRecords);
  }

  // ── Register settings config for AppMenuDrawer ─────────────────────────────
  setSettingsConfig({
    sections: options.settingsConfig?.sections ?? ALL_SECTIONS,
    customSections: options.settingsConfig?.customSections ?? [],
  });

  // ── Auth guard ─────────────────────────────────────────────────────────────
  // Public routes: marked with meta.requiresAuth === false, or under /auth.
  // Authenticated → first tab route (or homeRouteName option).
  const resolvedHome =
    options.homeRouteName ?? (tabRecords[0]?.name as string | undefined) ?? 'home';

  // Single source of truth for "where to navigate after a successful auth event"
  // (login, OTP verify, biometric unlock, deletion cancel, etc.). Fallback pages
  // and user-owned auth pages should use getPostAuthRoute() instead of hardcoding.
  setPostAuthRoute({ name: resolvedHome });

  router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    // Explicit meta wins over the path heuristic. A route that lives under
    // /auth/* but declares requiresAuth: true (e.g. an OAuth callback that
    // needs the bearer token) is treated as protected.
    const isPublicRoute =
      to.meta?.requiresAuth === false ||
      (to.meta?.requiresAuth !== true && to.path.startsWith('/auth'));
    const canAccess = authStore.isAuthenticated || authStore.isGuest;

    // Already authenticated → skip login
    if (isPublicRoute && authStore.isAuthenticated && authStore.user?.isEmailVerified) {
      return { name: resolvedHome };
    }

    // Not authenticated → go to login
    if (!isPublicRoute && !canAccess) {
      return { name: loginRoute };
    }

    // Authenticated but email not verified → go to login verify screen
    if (
      !isPublicRoute &&
      authStore.isAuthenticated &&
      !authStore.isGuest &&
      !authStore.user?.isEmailVerified
    ) {
      return { name: loginRoute, query: { verify: '1' } };
    }

    return true;
  });

  installTabTransitionGuard(router);
}
