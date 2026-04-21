import { inject, type InjectionKey, type Plugin } from 'vue';
import type { AppConfig } from './types.js';

const appConfigKey: InjectionKey<AppConfig> = Symbol('synkos:appConfig');

export function createSynkosPlugin(config: AppConfig): Plugin {
  return {
    install(app) {
      app.provide(appConfigKey, config);
    },
  };
}

export function useAppConfig(): AppConfig {
  const config = inject(appConfigKey);
  if (!config) {
    throw new Error(
      '[synkos] useAppConfig() called outside a Synkos app. Did you install createSynkosPlugin()?'
    );
  }
  return config;
}
