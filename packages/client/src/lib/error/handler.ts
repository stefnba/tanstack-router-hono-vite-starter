import { type TAPIErrorResponse, errorResponseApiSchema } from '@shared/lib/error/response';

import { TErrorHandler } from './types';

/**
 * Normalizes any error into a standardized API error response
 *
 * Attempts to parse the error as an API error response. If parsing fails,
 * wraps it in a default error structure for consistent handling.
 *
 * @param error - Any error object (API response, network error, etc.)
 * @returns Standardized API error response
 *
 * @example
 * ```typescript
 * // In createMutation/createQuery:
 * const errorObj = normalizeApiError(error);
 * return Promise.reject(errorObj);
 * ```
 */
export const normalizeApiError = (error: unknown): TAPIErrorResponse => {
    // Try to parse as our standardized error format
    const parsedResult = errorResponseApiSchema.safeParse(error);

    if (parsedResult.success) {
        return parsedResult.data;
    }

    // Fallback: wrap unknown errors
    return {
        success: false,
        error: {
            message: 'An unknown error occurred',
            code: 'INTERNAL_ERROR',
            details: { originalError: error },
        },
        request_id: 'client-generated',
    };
};

/**
 * Executes error handlers based on error code
 *
 * Routes the error to a specific handler (if defined) or the default handler.
 * Used by createQuery and createMutation to process the errorHandlers option.
 *
 * @param error - Any error object
 * @param handlers - Error handler configuration
 *
 * @example
 * ```ts
 * handleApiError(error, {
 *     'VALIDATION.INVALID_INPUT': (error) => {
 *         console.error(error);
 *     },
 *     default: (error) => {
 *         console.error(error);
 *     },
 * });
 * ```
 */
export const handleApiError = (error: unknown, handlers?: TErrorHandler) => {
    if (!handlers) return;

    const errorObj = normalizeApiError(error);
    const errorCode = errorObj.error.code;

    // Execute specific handler or fallback to default
    const handler = handlers[errorCode] ?? handlers.default;

    if (handler) {
        handler(errorObj);
    }
};
