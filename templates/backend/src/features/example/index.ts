import type { ModuleDefinition } from '@synkos/server/types';
import { router } from './example.routes';

/**
 * Example feature module.
 *
 * A minimal CRUD module that demonstrates the standard layered pattern:
 *   routes → controller → service → model
 *
 * To activate: uncomment the import and array entry in bootstrap/modules.ts.
 * To delete: remove this folder and its entry from bootstrap/modules.ts.
 *
 * Endpoints (all require auth):
 *   POST   /api/v1/examples        Create an example
 *   GET    /api/v1/examples        List user's examples
 *   GET    /api/v1/examples/:id    Get one example
 *   DELETE /api/v1/examples/:id    Delete an example
 */
export const exampleModule: ModuleDefinition = {
  path: '/examples',
  router,
  auth: 'required',
};
