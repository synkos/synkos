import { defineRouter } from '#q-app/wrappers';
import { createRouter, createWebHashHistory } from 'vue-router';
import { MainLayout, AuthLayout, setupSynkosRouter } from '@synkos/client';
import { settingsRoutes } from './settings.routes';

export default defineRouter(() => {
  const router = createRouter({
    history: createWebHashHistory(process.env.VUE_ROUTER_BASE),
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes: [
      // ── Auth ──────────────────────────────────────────────────────────────
      {
        path: '/auth',
        component: AuthLayout,
        children: [
          {
            path: 'login',
            name: 'auth-login',
            meta: { requiresAuth: false },
            component: () => import('src/pages/auth/LoginPage.vue'),
          },
          {
            path: 'username',
            name: 'auth-username',
            meta: { requiresAuth: false },
            component: () => import('src/pages/auth/UsernamePage.vue'),
          },
        ],
      },

      // ── Main app shell ────────────────────────────────────────────────────
      {
        path: '/',
        component: MainLayout,
        children: [
          // ── Your tabs — add as many as you need ───────────────────────────
          {
            path: '',
            name: 'home',
            meta: {
              tab: {
                icon: 'home',
                labelKey: 'tabs.home',
                cache: true,
                componentName: 'HomePage',
              },
            },
            component: () => import('src/features/home/pages/HomePage.vue'),
          },

          // ── Profile + settings — defined in settings.routes.ts ────────────
          // All pages live in src/pages/settings/ and are yours to edit.
          ...settingsRoutes,
        ],
      },

      // ── Custom layout example ─────────────────────────────────────────────
      // Remove or replace this with your own layouts.
      // Each layout is a route that wraps a <router-view> — standard Vue Router.
      {
        path: '/onboarding',
        component: () => import('src/layouts/OnboardingLayout.vue'),
        children: [
          {
            path: '',
            name: 'onboarding',
            meta: { requiresAuth: false, canSkip: true, skipTo: 'home' },
            component: () => import('src/pages/OnboardingPage.vue'),
          },
        ],
      },

      // ── 404 ───────────────────────────────────────────────────────────────
      {
        path: '/:catchAll(.*)*',
        component: () => import('src/pages/ErrorNotFound.vue'),
      },
    ],
  });

  // Wire up Synkos: discovers meta.tab routes, registers guards, configures drawer
  setupSynkosRouter(router);

  // Add your own guards here — they run after Synkos's auth guard
  // router.beforeEach((to, from) => { ... })

  // Add your own boots in src/boot/ and register them in quasar.config.ts:
  // boot: ['synkos', 'your-boot-file']

  return router;
});
