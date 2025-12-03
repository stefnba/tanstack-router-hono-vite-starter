import { envSchema } from './schema';

export const getEnvVariables = () => {
    const validatedEnv = envSchema.safeParse(process.env);
    if (!validatedEnv.success) {
        throw new Error(`Invalid environment variables: ${validatedEnv.error.message}`);
    }
    return validatedEnv.data;
};
