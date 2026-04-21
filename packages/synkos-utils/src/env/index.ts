import { z } from 'zod';

/**
 * Parse and validate environment variables against a Zod schema.
 *
 * On failure, prints a human-readable summary of every invalid variable
 * and exits the process with code 1.
 *
 * @example
 * import { parseEnv } from '@synkos/utils/env';
 *
 * const envSchema = z.object({ PORT: z.string().default('3000') });
 * export const env = parseEnv(envSchema, process.env);
 */
export function parseEnv<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);

  if (result.success) return result.data;

  const lines = result.error.issues.map((issue) => {
    const key = issue.path.join('.');
    return `   ${key}: ${issue.message}`;
  });

  console.error(`\n❌ Invalid environment variables:\n${lines.join('\n')}\n`);
  process.exit(1);
}
