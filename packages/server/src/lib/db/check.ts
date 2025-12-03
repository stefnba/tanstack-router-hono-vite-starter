import { sql } from 'drizzle-orm';
import { db } from '.';

/**
 * Checks the database connection by executing a simple query.
 * Throws an error if the connection fails. This is intended to be called at server startup.
 */
export async function checkDbConnection() {
    try {
        console.log('🔍 Checking database connection...');
        await db.execute(sql`SELECT 1`);
        console.log('✅ Database connection successful.');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
}
