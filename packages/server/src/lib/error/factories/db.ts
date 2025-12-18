import { DbError } from '@app/server/lib/error/error-type';

import { AppErrorFactory } from './base';

/**
 * Factory for creating Database Errors.
 *
 * Use this for database-specific errors like constraint violations or connection issues.
 */
export class DbErrorFactory extends AppErrorFactory<DbError> {
    /**
     * Specifies the table involved in the error.
     *
     * @param table - The table name
     */
    table(table: string): this {
        this.details({ table });
        return this;
    }

    /**
     * Specifies the query that failed (be careful not to expose sensitive data in production).
     *
     * @param query - The SQL query or operation description
     */
    query(query: string): this {
        this.details({ query: query.substring(0, 200) }); // Truncate for safety
        return this;
    }

    /**
     * Specifies the constraint that was violated.
     *
     * @param constraint - The constraint name
     */
    constraint(constraint: string): this {
        this.details({ constraint });
        return this;
    }
}
