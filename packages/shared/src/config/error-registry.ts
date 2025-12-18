import { HTTP_STATUS_CODES } from '@app/shared/lib/error/config';
import { createPublicErrorRecord } from '@app/shared/lib/error/registry/public';

/**
 * Public error registry containing user-facing error definitions
 *
 * These error definitions are safe to expose to clients and contain:
 * - User-friendly error messages
 * - HTTP status codes
 * - i18n keys for translation
 *
 * Used by internal error definitions to map to public-facing errors.
 */
export const PUBLIC_ERROR_REGISTRY = createPublicErrorRecord({
    // Operation
    OPERATION_FAILED: {
        message: 'Operation failed',
        httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
    },

    // Resource
    NOT_FOUND: {
        message: 'Resource does not exist',
        httpStatus: HTTP_STATUS_CODES.NOT_FOUND,
    },
    ALREADY_EXISTS: {
        message: 'Resource already exists',
        httpStatus: HTTP_STATUS_CODES.CONFLICT,
    },

    // Permission
    UNAUTHORIZED: {
        message: 'Unauthorized',
        httpStatus: HTTP_STATUS_CODES.UNAUTHORIZED,
    },
    FORBIDDEN: {
        message: 'Forbidden',
        httpStatus: HTTP_STATUS_CODES.FORBIDDEN,
    },

    // Validation
    INVALID_INPUT: {
        message: 'Invalid input',
        httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
    },
    MISSING_FIELD: {
        message: 'Missing field',
        httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
    },
    INVALID_FORMAT: {
        message: 'Invalid format',
        httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
    },

    // Rate limit
    TOO_MANY_REQUESTS: {
        message: 'Too many requests',
        httpStatus: HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
    },

    // Server
    INTERNAL_ERROR: {
        message: 'Internal server error',
        httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    },
});

/**
 * Union type of all valid public error codes in the registry
 *
 */
export type TPublicErrorCode = keyof typeof PUBLIC_ERROR_REGISTRY;
