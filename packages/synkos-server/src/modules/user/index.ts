import type { ModuleDefinition } from '@/types/module.types';
import router from './user.routes';

export const userModule: ModuleDefinition = {
  path: '/user',
  router,
  auth: 'required',
};
