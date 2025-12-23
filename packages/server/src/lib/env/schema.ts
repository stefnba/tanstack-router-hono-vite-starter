import { z } from 'zod';

import { CLIENT, SERVER } from '@app/shared/config/app';

export const envSchema = z.object({
    // Application
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CLIENT_URL: z.url().min(1).default(`http://localhost:${CLIENT.DEFAULT_PORT}`), // Client URL for CORS - override in production (e.g., https://my-app.com)
    SERVER_PORT: z.coerce.number().int().min(1).max(65535).default(SERVER.DEFAULT_PORT),
    // Database
    DATABASE_URL: z.url().min(1),
    // Auth
    BETTER_AUTH_SECRET: z.string().min(1),
    // BETTER_AUTH_URL: z.url().min(1),
    // GITHUB_CLIENT_ID: z.string(),
    // GITHUB_CLIENT_SECRET: z.string(),

    // AWS
    AWS_ACCESS_KEY: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),
    AWS_BUCKET_REGION: z.string().min(1).default('eu-central-1'),
    AWS_BUCKET_NAME_PUBLIC_UPLOAD: z.string().min(1),
    AWS_BUCKET_NAME_PRIVATE_UPLOAD: z.string().min(1),

    // Local Upload
    LOCAL_UPLOAD_BASE_DIR: z.string().min(1).default('uploads'),
});

export type EnvSchema = z.infer<typeof envSchema>;
