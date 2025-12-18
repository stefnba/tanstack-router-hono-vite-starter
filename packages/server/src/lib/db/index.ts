import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from '@app/server/db/tables';
import { env } from '@app/server/lib/env';

const { DATABASE_URL } = env;

// Create connection with connection pooling
const client = postgres(DATABASE_URL, {
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 30, // Max seconds a connection can be idle before being removed
    connect_timeout: 10, // Max seconds to wait for a connection
});

export const db = drizzle(client, { schema, casing: 'snake_case' });
