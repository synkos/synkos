import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes/index';

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to) => {
    const { useAuthStore } = await import('src/stores/auth.store');
    const authStore = useAuthStore();

    const isPublicRoute = to.name === 'auth-login';
    const canAccess = authStore.isAuthenticated || authStore.isGuest;

    // Already authenticated and verified → no need to see the login screen
    if (isPublicRoute && authStore.isAuthenticated && authStore.user?.isEmailVerified) {
      return { name: 'home' };
    }

    // Not authenticated and not guest → must go through login first
    if (!isPublicRoute && !canAccess) {
      return { name: 'auth-login' };
    }

    // Authenticated but email not verified → force verification before app access
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

  return Router;
});
