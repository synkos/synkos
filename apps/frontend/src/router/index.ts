import { defineRouter } from '#q-app/wrappers';
import { createSynkosRouter } from '@synkos/client';
import { appConfig } from 'src/app.config';
import { appTabRoutes } from './app.routes';

export default defineRouter(() => createSynkosRouter(appConfig, appTabRoutes));
