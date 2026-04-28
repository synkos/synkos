import { Capacitor } from '@capacitor/core';

export type AppPlatform = 'ios' | 'android' | 'web';

export function usePlatform() {
  const platform = Capacitor.getPlatform() as AppPlatform;
  const isNative = Capacitor.isNativePlatform();

  return {
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isNative,
    isWeb: !isNative,
  };
}
