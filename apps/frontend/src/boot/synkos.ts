import { defineBoot } from '#q-app/wrappers';
import { createSynkosBoot } from '@synkos/client';
import { appConfig } from 'src/app.config';
import enUS from 'src/i18n/en-US';
import esES from 'src/i18n/es-ES';

export default defineBoot(
  createSynkosBoot({
    config: appConfig,
    messages: { 'en-US': enUS, 'es-ES': esES },
    ...(import.meta.env.VITE_API_URL ? { apiBaseUrl: import.meta.env.VITE_API_URL } : {}),
  }),
);
