import type { RouteLocationRaw } from 'vue-router';

let _postAuthRoute: RouteLocationRaw = { name: 'home' };

/**
 * Override the route the user is redirected to after a successful auth event
 * (login, OTP verify, biometric unlock, deletion cancel). Useful for one-time
 * onboarding flows: call this from your post-login boot step before navigation
 * runs, then call it again with the canonical home once onboarding completes.
 *
 * @example
 * setPostAuthRoute({ name: 'onboarding-welcome' })
 */
export function setPostAuthRoute(route: RouteLocationRaw) {
  _postAuthRoute = route;
}

/**
 * Read the current post-auth target. The default is the first user-declared
 * tab route (or `homeRouteName` in `setupSynkosRouter`), with `{ name: 'home' }`
 * as the final fallback. Use this in user-owned auth pages instead of hardcoding
 * a route name so that renaming the landing route never breaks the auth flow.
 *
 * @example
 * await router.replace(getPostAuthRoute())
 */
export function getPostAuthRoute(): RouteLocationRaw {
  return _postAuthRoute;
}
