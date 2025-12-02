import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'

// Initialize the app
const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors()) // Useful if you deploy them on different domains later

// Define a route
const apiRoutes = app
    .basePath('/api') // Important! Matches the proxy prefix
    .get('/hello', (c) => {
        return c.json({
            message: 'Hello from Hono!',
        })
    })

// Start the server
// Bun serves this automatically when you run `bun run src/index.ts`
export default {
    port: 3000,
    fetch: app.fetch,
}

// Export type for RPC
export type AppType = typeof apiRoutes
