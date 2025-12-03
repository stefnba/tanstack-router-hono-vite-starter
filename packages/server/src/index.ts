import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { authEndopints, postEndpoints, statusEndpoints } from './endpoints';
import { getEnvVariables } from './lib/env';

const { CLIENT_URL } = getEnvVariables();

// ================================
// App
// ================================
const app = new Hono().basePath('/api');

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
    });

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
