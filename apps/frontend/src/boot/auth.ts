import { defineBoot } from '#q-app/wrappers';
import { createAuthBoot } from '@synkos/client';
import { appConfig } from 'src/app.config';

export default defineBoot(
  createAuthBoot({
    config: appConfig,
    apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
    // onLogin: (user) => analytics.identify(user.id),
    // onLogout: () => analytics.reset(),
  }),
);
