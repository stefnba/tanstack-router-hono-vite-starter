import {
    authEndopints,
    postEndpoints,
    protectedEndpoints,
    statusEndpoints,
} from '@server/endpoints';
import { TAuthContext } from '@server/lib/auth';
import { getEnvVariables } from '@server/lib/env';
import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

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
}>();

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
// API Routes
// ================================
const apiRoutes = app
    .basePath('/api')
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

// Catch any request starting with /api that wasn't handled above
app.on(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/api/*', (c) => {
    return c.json({ success: false, message: 'Not found' }, 404);
});

// ================================
// Production
// ================================
// Serve Static Assets (The React Build)
// This serves files like /assets/index.js directly
if (getEnvVariables().NODE_ENV === 'production') {
    app.use(
        '/*',
        serveStatic({
            root: './public', // We will copy the React build here in Docker
        })
    );
    // SPA Fallback (The "Catch-All")
    // If a route doesn't match an API or a static file, serve index.html
    // so the React Router can handle it client-side.
    app.use(
        '*',
        serveStatic({
            path: './public/index.html',
        })
    );
}

// ================================
// Export
// ================================
// Start the server
// Bun serves this automatically when you run `bun run src/index.ts`
export default {
    port: 3000,
    fetch: app.fetch,
};

export type AppType = typeof apiRoutes;
export { apiRoutes, app };
