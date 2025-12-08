import { Hono } from 'hono';

import { TAuthContext } from '@server/lib/auth';
import { authMiddleware } from '@server/lib/auth/middleware';

export const createHonoRouter = (
    { isProtected = true }: { isProtected?: boolean } = { isProtected: true }
) => {
    const endpoint = new Hono<{ Variables: TAuthContext }>();

    if (isProtected) {
        endpoint.use(authMiddleware);
    }

    return endpoint;
};
