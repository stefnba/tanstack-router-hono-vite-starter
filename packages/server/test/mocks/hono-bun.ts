import { Context, Next } from 'hono';

/**
 * Mock implementation of serveStatic for Vitest environment
 * This prevents "Bun is not defined" errors when running tests in Node.js environment
 */
export const serveStatic = () => {
    return async (c: Context, next: Next) => {
        await next();
    };
};
