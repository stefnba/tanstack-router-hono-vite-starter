import { createMiddleware } from 'hono/factory';

import { auth } from '@server/lib/auth/config';
import type { TAuthContext } from '@server/lib/auth/types';

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
