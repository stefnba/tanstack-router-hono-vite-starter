import { sql } from 'drizzle-orm';
import { Hono } from 'hono';

import { db } from '../lib/db';

export const endopints = new Hono().get('/', async (c) => {
    let databaseStatus = 'OK';
    const serverStatus = 'OK';

    try {
        await db.execute(sql`SELECT 1`);
    } catch (error: unknown) {
        databaseStatus = 'ERROR';
    }
    return c.json({
        server: serverStatus,
        database: databaseStatus,
    });
});
