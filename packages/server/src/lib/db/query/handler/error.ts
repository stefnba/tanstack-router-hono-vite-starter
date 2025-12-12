import { DrizzleQueryError } from 'drizzle-orm';
import postgres from 'postgres';

import { appError } from '@server/lib/error';

export type THandleDbQueryDetailsParams = {
    /** The table name being queried (for error context) */
    table?: string;
    /** The operation being performed (for error context) */
    operation?: string;
};

/**
 * Handle database query errors with PostgreSQL-specific error code detection
 *
 * Detects common PostgreSQL error codes and maps them to appropriate error types:
 * - 23505: Unique constraint violation
 * - 23503: Foreign key constraint violation
 * - 23502: Not-null constraint violation
 * - 42601: Syntax error
 * - ECONNREFUSED: Database connection refused
 *
 * @param error - The error thrown from database query
 * @param operation - Optional operation description for better error messages
 * @throws AppError with appropriate error code and details
 *
 * @example
 * ```typescript
 * try {
 *   await db.insert(users).values({ email: 'test@example.com' });
 * } catch (error) {
 *   handleDbQueryError(error, 'create user');
 * }
 * ```
 */
export const handleDbQueryError = (
    error: unknown,
    details: THandleDbQueryDetailsParams = {}
): never => {
    const operationContext = details.operation ? ` during '${details.operation}'` : '';
    const tableContext = details.table ? ` in table '${details.table}'` : '';

    // check for drizzle query error
    if (error instanceof DrizzleQueryError) {
        const drizzleError = error;

        // todo clean sensitive data from params
        const errorObj = {
            drizzleError: { query: drizzleError.query, params: drizzleError.params },
            table: details.table,
            operation: details.operation,
        };

        // check for postgres error
        if (drizzleError.cause instanceof postgres.PostgresError) {
            const postgresError = drizzleError.cause;
            const {
                code,
                column_name: column,
                table_name: table,
                detail,
                constraint_name: constraint,
                message,
            } = postgresError;

            Object.assign(errorObj, {
                postgresError: {
                    table,
                    column,
                    code,
                    message,
                    constraint,
                    detail,
                },
            });

            switch (postgresError.code) {
                // Unique constraint violation
                case '23505':
                    throw appError
                        .db('UNIQUE_VIOLATION', {
                            message: `Unique constraint violation${operationContext}${tableContext}: ${message}`,
                            cause: error,
                            layer: 'db',
                            details: { ...errorObj },
                        })
                        .get();
                // Foreign key constraint violation
                case '23503':
                    throw appError
                        .db('FOREIGN_KEY_VIOLATION', {
                            message: `Foreign key constraint violation${operationContext}${tableContext}: ${message}`,
                            cause: error,
                            layer: 'db',
                            details: { ...errorObj },
                        })
                        .get();
                // Not-null constraint violation
                case '23502':
                    throw appError
                        .db('QUERY_FAILED', {
                            message: `Not-null constraint violation${operationContext}${tableContext}: ${message}`,
                            cause: error,
                            layer: 'db',
                            details: { ...errorObj },
                        })
                        .get();
                // Syntax error
                case '42601':
                    console.log('Syntax error', error);
                    throw appError
                        .db('SYNTAX_ERROR', {
                            message: `Syntax error${operationContext}${tableContext}: ${message}`,
                            cause: error,
                            layer: 'db',
                            details: {
                                ...errorObj,
                            },
                        })
                        .get();
                default:
                    throw appError
                        .db('QUERY_FAILED', {
                            message: `Database query failed${operationContext}${tableContext}: ${message}`,
                            cause: error,
                            layer: 'db',
                            details: { ...errorObj },
                        })
                        .get();
            }
        }

        throw appError
            .db('QUERY_FAILED', {
                message: `Database query failed${operationContext}${tableContext}: ${error.message}`,
                cause: error,
                layer: 'db',
            })
            .get();
    }

    // Handle connection errors
    if (error instanceof Error && 'code' in error && error.code === 'ECONNREFUSED') {
        throw appError
            .db('CONNECTION_ERROR', {
                message: `Database connection refused${operationContext}${tableContext}: ${error.message}`,
                cause: error,
                layer: 'db',
            })
            .get();
    }

    // else throw generic database error
    throw error;
};
