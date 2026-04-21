Object.assign(process.env, {
  NODE_ENV: 'test',
  APP_NAME: 'test-api',
  PORT: '3099',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/test-placeholder',
  JWT_ACCESS_SECRET: 'test-jwt-access-secret-minimum-32-characters-aaa',
  JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-minimum-32-characters-bbb',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_DAYS: '30',
  RATE_LIMIT_SKIP_DEV: 'true',
  CORS_ORIGINS: '*',
});
