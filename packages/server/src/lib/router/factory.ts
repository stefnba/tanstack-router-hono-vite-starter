import { authMiddleware } from '@server/lib/auth';
import { Hono } from 'hono';

export const createHonoRouter = (
    { isProtected = true }: { isProtected?: boolean } = { isProtected: true }
) => {
    const endpoint = new Hono();

    if (isProtected) {
        endpoint.use(authMiddleware);
    }

    return endpoint;
};
