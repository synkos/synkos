<script setup lang="ts">
/**
 * Layout for `/auth/*` routes — a thin wrapper around `<router-view>` that
 * holds the auth chrome boundary. Routes nested under it skip the main app's
 * nav and tab bars. Used together with `MainLayout` and Synkos's auth guard,
 * which redirects unauthenticated users here.
 *
 * @example
 * import { AuthLayout } from '@synkos/client'
 *
 * createRouter({
 *   routes: [
 *     {
 *       path: '/auth',
 *       component: AuthLayout,
 *       children: [
 *         { path: 'login', meta: { requiresAuth: false }, component: LoginPage },
 *         { path: 'username', meta: { requiresAuth: false }, component: UsernamePage },
 *       ],
 *     },
 *   ],
 * })
 */
</script>

<template>
  <router-view />
</template>
