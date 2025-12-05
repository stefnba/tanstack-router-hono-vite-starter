import { z } from 'zod';

export const envSchema = z.object({
    // Application
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_URL: z.url().min(1),
    // Database
    DATABASE_URL: z.url().min(1),
    // Auth
    BETTER_AUTH_SECRET: z.string().min(1),
    // BETTER_AUTH_URL: z.url().min(1),
    // GITHUB_CLIENT_ID: z.string(),
    // GITHUB_CLIENT_SECRET: z.string(),
});

export type EnvSchema = z.infer<typeof envSchema>;
