import z from 'zod';

import { envSchema } from './schema';

const validatedEnv = envSchema.safeParse(process.env);

if (!validatedEnv.success) {
    console.error(
        '❌ Invalid environment variables:',
        JSON.stringify(z.treeifyError(validatedEnv.error), null, 2)
    );
    throw new Error('Invalid environment variables');
}

export const env = validatedEnv.data;
