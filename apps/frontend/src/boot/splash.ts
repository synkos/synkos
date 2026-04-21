import { defineBoot } from '#q-app/wrappers';
import { Capacitor } from '@capacitor/core';

/**
 * Oculta el splash screen nativo con fade una vez que la app está lista.
 * Debe ser el ÚLTIMO boot file para que corra después de auth.ts.
 *
 * Requiere: npm install @capacitor/splash-screen && npx cap sync
 */
export default defineBoot(async () => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    // Hide native splash immediately — the Vue SplashOverlay covers the transition
    await SplashScreen.hide({ fadeOutDuration: 0 });
  } catch {
    // no-op
  }
});
