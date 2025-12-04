import { Hono } from 'hono';

import { authMiddleware } from '../auth';

export const createHonoRouter = (
    { isProtected = true }: { isProtected?: boolean } = { isProtected: true }
) => {
    const endpoint = new Hono();

    if (isProtected) {
        endpoint.use(authMiddleware);
    }

    return endpoint;
};
