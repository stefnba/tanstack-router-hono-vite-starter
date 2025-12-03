import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { getEnvVariables } from '../env';
import postgres from 'postgres';

const { DATABASE_URL } = getEnvVariables();

// Create connection with connection pooling
const client = postgres(DATABASE_URL, {
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 30, // Max seconds a connection can be idle before being removed
    connect_timeout: 10, // Max seconds to wait for a connection
});

export const db = drizzle(client);
