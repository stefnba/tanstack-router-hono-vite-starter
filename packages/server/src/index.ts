import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { authEndopints, postEndpoints, protectedEndpoints, statusEndpoints } from './endpoints';
import { authMiddleware } from './lib/auth';
import { TAuthContext } from './lib/auth/types';
import { getEnvVariables } from './lib/env';

const { CLIENT_URL } = getEnvVariables();

// Extend Hono's Context type to include our user
declare module 'hono' {
    interface ContextVariableMap {
        user: TAuthContext['user'];
        session: TAuthContext['session'];
    }
}

// ================================
// App
// ================================
const app = new Hono<{
    // Request-scoped data passed between middleware and handlers.
    Variables: TAuthContext;
}>().basePath('/api');

// ================================
// Middleware
// ================================
app.use('*', logger());
app.use(
    '*',
    cors({
        origin: CLIENT_URL,
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: ['POST', 'GET', 'OPTIONS'],
        exposeHeaders: ['Content-Length'],
        maxAge: 600,
        credentials: true,
    })
);

app.onError((err, c) => {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
});

// ================================
// Routes
// ================================
const routes = app
    // Important! Matches the proxy prefix
    .route('/auth', authEndopints)
    .route('/status', statusEndpoints)
    .route('/posts', postEndpoints)
    .get('/', (c) => {
        return c.json({
            message: 'Hello',
        });
    })
    .route('/protected', protectedEndpoints);

// ================================
// Export
// ================================
// Start the server
// Bun serves this automatically when you run `bun run src/index.ts`
export default {
    port: 3000,
    fetch: app.fetch,
};

export type AppType = typeof routes;
export { routes, app };
