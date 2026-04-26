import { defineBoot } from '#q-app/wrappers';
import { createI18nBoot } from '@synkos/client';
import { appConfig } from 'src/app.config';
import enUS from 'src/i18n/en-US';
import esES from 'src/i18n/es-ES';

export default defineBoot(
  createI18nBoot({
    config: appConfig,
    messages: {
      'en-US': enUS,
      'es-ES': esES,
    },
  }),
);
