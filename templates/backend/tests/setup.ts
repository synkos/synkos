/**
 * Vitest setupFiles — runs before each test file, before any project module is imported.
 *
 * Sets environment variables so that @/config/env (Zod schema) sees correct
 * values on its first evaluation. Do NOT import any project code here.
 */

Object.assign(process.env, {
  NODE_ENV:            "test",
  APP_NAME:            "test-api",
  PORT:                "3099",
  // Placeholder — tests connect to MongoMemoryServer directly, never via connectDatabase()
  MONGODB_URI:         "mongodb://127.0.0.1:27017/test-placeholder",
  JWT_ACCESS_SECRET:   "test-jwt-access-secret-minimum-32-characters-aaa",
  JWT_REFRESH_SECRET:  "test-jwt-refresh-secret-minimum-32-characters-bbb",
  JWT_ACCESS_EXPIRES_IN:    "15m",
  JWT_REFRESH_EXPIRES_DAYS: "30",
  // Skip global rate limiter in test environment
  RATE_LIMIT_SKIP_DEV: "true",
  CORS_ORIGINS:        "*",
});
