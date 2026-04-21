import { z } from "zod";
import { baseEnvSchema } from "@synkos/server/config";
import { parseEnv }      from "@synkos/server/utils";

/**
 * Project-level environment schema.
 *
 * Extends the core schema with variables specific to this project.
 * Core infrastructure vars (DB, auth, email, storage, redis…) are already
 * declared in @synkos/server and do not need to be repeated here.
 *
 * HOW TO ADD A VAR
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Add it here with a Zod type:
 *      STRIPE_SECRET_KEY: z.string().min(1),
 *
 * 2. Add it to .env.example with a placeholder value.
 *
 * 3. Access it anywhere via: import { env } from "@/config/env"
 * ─────────────────────────────────────────────────────────────────────────────
 */
const envSchema = baseEnvSchema.extend({
  // Add your project-specific environment variables here:
});

export const env = parseEnv(envSchema, process.env);
export type Env  = z.infer<typeof envSchema>;
