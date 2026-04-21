import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Mirrors the @/* path alias in tsconfig.json
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',

    // Runs before each test file — sets required env vars before any project
    // module is evaluated, so @/config/env sees correct values on first import.
    setupFiles: ['./tests/setup.ts'],

    // Integration tests share a real DB — run all files in one worker to avoid
    // port conflicts and concurrent MongoMemoryServer binary downloads.
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },

    testTimeout: 20_000,
    hookTimeout: 30_000,

    coverage: {
      provider: 'v8',
      include: ['src/core/**'],
      exclude: ['src/core/**/*.types.ts', 'src/core/utils/logger.ts'],
    },
  },
});
