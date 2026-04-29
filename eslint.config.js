import synkosConfig from '@synkos/config/eslint';
import globals from 'globals';

export default [
  ...synkosConfig,
  {
    files: ['scripts/**', 'packages/*/scripts/**'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  },
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      'templates/**',
      'apps/**',
      'packages/create-synkos/templates/**',
      'packages/create-synkos/scripts/**',
      '**/.quasar/**',
    ],
  },
];
