import type { ModuleDefinition } from '@/types/module.types';
import router from './username.routes';

export const usernameModule: ModuleDefinition = {
  path: '/username',
  router,
  auth: 'mixed', // GET /check is public, POST and PUT require auth
};

export { addReservedUsernames } from './username.service';
