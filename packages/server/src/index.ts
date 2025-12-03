import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { authEndopints, postEndpoints, statusEndpoints } from './endpoints';

// ================================
// App
// ================================
const app = new Hono().basePath('/api');

// ================================
// Middleware
// ================================
app.use('*', logger());
app.use('*', cors());

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
