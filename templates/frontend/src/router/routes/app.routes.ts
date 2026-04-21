import type { RouteRecordRaw } from 'vue-router';

/**
 * App-specific routes — replace or extend these when building a new app
 * from this template.
 *
 * appTabRoutes   → rendered inside MainLayout (tab bar + nav bar visible)
 * appFullscreen  → top-level route with AuthLayout (full-screen, no tab bar)
 *
 * The 'profile' tab is provided by the template (core.routes.ts).
 *
 * Example full-screen route (uncomment and adapt):
 *
 *   export const appFullscreen: RouteRecordRaw = {
 *     path: '/app',
 *     component: () => import('src/core/layouts/AuthLayout.vue'),
 *     children: [
 *       {
 *         path: 'camera',
 *         name: 'camera',
 *         component: () => import('src/features/camera/pages/CameraPage.vue'),
 *       },
 *     ],
 *   };
 */

// ── Tab routes (children of MainLayout) ──────────────────────────────────────
export const appTabRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'home',
    component: () => import('src/features/home/pages/HomePage.vue'),
  },
  // Add your app's tab routes here
];

// ── Full-screen app routes (top-level, use AuthLayout — no tab bar) ───────────
// Uncomment and extend when you have full-screen experiences (camera, onboarding, paywall, etc.)
// export const appFullscreen: RouteRecordRaw = { ... };
