import synkosConfig from '@synkos/config/eslint';

export default [
  ...synkosConfig,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      'templates/**',
      'apps/**',
    ],
  },
];
