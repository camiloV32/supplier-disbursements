import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.url(),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables:\n${JSON.stringify(parsedEnv.error.issues, null, 2)}`,
  );
}

export const env = parsedEnv.data;
