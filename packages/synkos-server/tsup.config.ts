import path from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'types/index': 'src/types/index.ts',
    'config/index': 'src/config/index.ts',
    'utils/index': 'src/utils/index.ts',
    'middleware/index': 'src/middleware/index.ts',
    'events/index': 'src/events/index.ts',
    'adapters/index': 'src/adapters/index.ts',
    'ports/index': 'src/ports/index.ts',
    'context/index': 'src/context/index.ts',
    'modules/auth/index': 'src/modules/auth/index.ts',
    'modules/user/index': 'src/modules/user/index.ts',
    'modules/account/index': 'src/modules/account/index.ts',
    'modules/username/index': 'src/modules/username/index.ts',
    'modules/notifications/index': 'src/modules/notifications/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  target: 'node20',
  platform: 'node',
  esbuildOptions(options) {
    options.alias = {
      '@': path.resolve('src'),
    };
  },
});
