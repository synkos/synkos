import type { NavigationGuard } from 'vue-router';

export interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  isEmailVerified: boolean;
}

export interface AuthGuardOptions {
  /** Route name for the login / auth screen. */
  loginRoute: string;
  /** Route name to redirect authenticated users away from public routes. */
  homeRoute: string;
  /** Additional route names that are publicly accessible without auth. */
  publicRoutes?: string[];
  /** Sync or async getter for the current auth state. */
  getState: () => AuthState | Promise<AuthState>;
}

export function createAuthGuard(options: AuthGuardOptions): NavigationGuard {
  const { loginRoute, homeRoute, publicRoutes = [], getState } = options;
  const publicSet = new Set([loginRoute, ...publicRoutes]);

  return async (to) => {
    const { isAuthenticated, isGuest, isEmailVerified } = await getState();
    const isPublic = publicSet.has(String(to.name));
    const canAccess = isAuthenticated || isGuest;

    // Already logged in and verified — skip the login screen
    if (isPublic && isAuthenticated && isEmailVerified) {
      return { name: homeRoute };
    }

    // Not authenticated — must go through login
    if (!isPublic && !canAccess) {
      return { name: loginRoute };
    }

    // Authenticated but email unverified — force verification
    if (!isPublic && isAuthenticated && !isGuest && !isEmailVerified) {
      return { name: loginRoute, query: { verify: '1' } };
    }

    return true;
  };
}
