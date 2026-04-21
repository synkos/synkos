import { baseEnvSchema } from "./base-env";
import { parseEnv } from "@/utils/parse-env";

export const env = parseEnv(baseEnvSchema, process.env);
