import { createMiddleware } from 'hono/factory';

import { auth } from './config';
import type { TAuthContext } from './types';

export const authMiddleware = createMiddleware<{
    Variables: TAuthContext;
}>(async (c, next) => {
    const session = await auth.api.getSession(c.req.raw);

    if (!session) {
        c.set('user', null);
        c.set('session', null);
        return c.json({ error: 'Unauthorized' }, 401);
    }

    // Set the user and session in the request context
    c.set('user', session.user);
    c.set('session', session.session);

    // Continue to the next middleware or handler
    await next();
});
