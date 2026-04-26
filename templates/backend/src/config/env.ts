import { z } from 'zod';
import { baseEnvSchema } from '@synkos/server/config';
import { parseEnv } from '@synkos/server/utils';

const envSchema = baseEnvSchema.extend({
  // Add project-specific environment variables here:
  // STRIPE_SECRET_KEY: z.string().min(1),
});

export const env = parseEnv(envSchema, process.env);
export type Env = z.infer<typeof envSchema>;
