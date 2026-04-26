import type { App } from 'vue';
import type { Router } from 'vue-router';
import { Capacitor } from '@capacitor/core';

export type ClientBootFn = (params: { app: App; router: Router }) => Promise<void>;

export function createSplashBoot(): ClientBootFn {
  return async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const { SplashScreen } = await import('@capacitor/splash-screen');
      await SplashScreen.hide({ fadeOutDuration: 0 });
    } catch {
      // no-op
    }
  };
}
