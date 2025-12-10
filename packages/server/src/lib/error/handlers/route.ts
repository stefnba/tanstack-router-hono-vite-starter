import { Context } from 'hono';
import {
    ClientErrorStatusCode,
    ContentfulStatusCode,
    ServerErrorStatusCode,
} from 'hono/utils/http-status';

import { BaseError } from '@server/lib/error/base';

/**
 * Type narrowing function to ensure we only return error status codes
 * This helps with RPC type inference by ensuring success and error types don't overlap
 */
export function ensureErrorStatusCode(
    statusCode: ContentfulStatusCode | number
): ClientErrorStatusCode | ServerErrorStatusCode {
    if (statusCode === 400) return 400;
    if (statusCode === 401) return 401;
    if (statusCode === 403) return 403;
    if (statusCode === 404) return 404;
    if (statusCode === 409) return 409;
    if (statusCode === 422) return 422;
    if (statusCode === 429) return 429;
    if (statusCode === 502) return 502;

    return 500; // Default to 500 for any other status code
}

export const handleRouteError = async (error: unknown, c: Context) => {
    // IMPORTANT: This conditional block is required for Hono RPC type safety
    // It's never executed at runtime, but provides necessary type information
    // for the RPC client to properly infer error response types
    if (false as boolean) {
        const appError = BaseError.fromUnknown(error);
        return c.json(appError.toResponse(), ensureErrorStatusCode(appError.httpStatus));
    }

    // re-throw the error to be handled by the global error handler
    throw error;
};
