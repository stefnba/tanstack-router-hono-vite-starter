import { ErrorRegistry } from '@server/lib/error/registry/private';

import { PUBLIC_ERROR_REGISTRY } from '@shared/config/error-registry';
import { HTTP_STATUS_CODES } from '@shared/lib/error/config';

/**
 * Internal error registry containing detailed error definitions
 *
 * This registry maps error categories and codes to their complete definitions including:
 * - Application layers where the error can be thrown
 * - HTTP status codes
 * - Whether the error is expected during normal operation
 * - Public error mapping for client responses
 *
 * Error keys follow the pattern: CATEGORY.CODE (e.g., 'VALIDATION.INVALID_INPUT')
 *
 * @example
 * ```typescript
 * // Access error definition
 * const definition = ERROR_REGISTRY.get('VALIDATION.INVALID_INPUT');
 * // { layers: ['endpoint'], public: {...}, isExpected: true, httpStatus: 400 }
 * ```
 */
export const ERROR_REGISTRY = ErrorRegistry.fromObject({
    // Validation
    VALIDATION: {
        INVALID_INPUT: {
            layers: ['endpoint'],
            public: PUBLIC_ERROR_REGISTRY.INVALID_INPUT,
            isExpected: true,
        },
        MISSING_FIELD: {
            layers: ['endpoint'],
            public: PUBLIC_ERROR_REGISTRY.MISSING_FIELD,
            isExpected: true,
        },
        INVALID_FORMAT: {
            layers: ['endpoint'],
            public: PUBLIC_ERROR_REGISTRY.INVALID_FORMAT,
            isExpected: true,
        },
    },

    // Resource
    RESOURCE: {
        NOT_FOUND: {
            layers: ['endpoint', 'db'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.NOT_FOUND,
            isExpected: true,
        },
        ALREADY_EXISTS: {
            layers: ['endpoint', 'db'],
            public: PUBLIC_ERROR_REGISTRY.ALREADY_EXISTS,
            httpStatus: HTTP_STATUS_CODES.CONFLICT,
            isExpected: true,
        },
    },

    // Operation
    OPERATION: {
        CREATE_FAILED: {
            layers: ['endpoint', 'db'],
            public: PUBLIC_ERROR_REGISTRY.OPERATION_FAILED,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            isExpected: false,
        },
        UPDATE_FAILED: {
            layers: ['endpoint', 'db'],
            public: PUBLIC_ERROR_REGISTRY.OPERATION_FAILED,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            isExpected: false,
        },
        DELETE_FAILED: {
            layers: ['endpoint', 'db'],
            public: PUBLIC_ERROR_REGISTRY.OPERATION_FAILED,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            isExpected: false,
        },
    },

    // Permission: What can you do?
    PERMISSION: {
        ACCESS_DENIED: {
            layers: ['auth', 'endpoint'],
            public: PUBLIC_ERROR_REGISTRY.FORBIDDEN,
            httpStatus: HTTP_STATUS_CODES.FORBIDDEN,
            isExpected: true,
        },
        INSUFFICIENT_ROLE: {
            layers: ['auth', 'endpoint'],
            public: PUBLIC_ERROR_REGISTRY.FORBIDDEN,
            httpStatus: HTTP_STATUS_CODES.FORBIDDEN,
            isExpected: true,
        },
    },

    SERVER: {
        INTERNAL_ERROR: {
            layers: ['service', 'db', 'integration', 'infra'],
            public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            isExpected: false,
        },
        SERVICE_UNAVAILABLE: {
            layers: ['service', 'integration', 'infra'],
            public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,
            httpStatus: HTTP_STATUS_CODES.SERVICE_UNAVAILABLE,
            isExpected: false,
        },
        MAINTENANCE_MODE: {
            layers: ['service', 'infra'],
            public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,
            httpStatus: HTTP_STATUS_CODES.SERVICE_UNAVAILABLE,
            isExpected: false,
        },
    },

    // Authentication: Who are you?
    AUTH: {
        UNAUTHORIZED: {
            layers: ['auth', 'endpoint'],
            public: PUBLIC_ERROR_REGISTRY.UNAUTHORIZED,
            httpStatus: HTTP_STATUS_CODES.UNAUTHORIZED,
            isExpected: true,
        },
        SESSION_NOT_FOUND: {
            layers: ['auth'],
            public: PUBLIC_ERROR_REGISTRY.UNAUTHORIZED,
            httpStatus: HTTP_STATUS_CODES.UNAUTHORIZED,
            isExpected: true,
        },
        INVALID_CREDENTIALS: {
            layers: ['auth'],
            public: PUBLIC_ERROR_REGISTRY.UNAUTHORIZED,
            httpStatus: HTTP_STATUS_CODES.UNAUTHORIZED,
            isExpected: true,
        },
        SESSION_CONTEXT_ERROR: {
            layers: ['auth'],
            public: PUBLIC_ERROR_REGISTRY.UNAUTHORIZED,
            httpStatus: HTTP_STATUS_CODES.UNAUTHORIZED,
            isExpected: false,
        },
    },

    DB: {
        CONNECTION_ERROR: {
            layers: ['db'],
            public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            isExpected: false,
        },
        QUERY_FAILED: {
            layers: ['db'],
            public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            isExpected: false,
        },
        UNIQUE_VIOLATION: {
            layers: ['db'],
            public: PUBLIC_ERROR_REGISTRY.ALREADY_EXISTS,
            httpStatus: HTTP_STATUS_CODES.CONFLICT,
            isExpected: true,
        },
        FOREIGN_KEY_VIOLATION: {
            layers: ['db'],
            public: PUBLIC_ERROR_REGISTRY.INVALID_INPUT,
            httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
            isExpected: true,
        },
        TRANSACTION_FAILED: {
            layers: ['db'],
            public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            isExpected: false,
        },
        INVALID_OUTPUT: {
            layers: ['db'],
            public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            isExpected: false,
        },
        SYNTAX_ERROR: {
            layers: ['db'],
            public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            isExpected: false,
        },
    },

    COOKIE: {
        INVALID_VALUE: {
            layers: ['auth'],
            public: PUBLIC_ERROR_REGISTRY.UNAUTHORIZED,
            httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
            isExpected: true,
        },
        MISSING: {
            layers: ['auth'],
            public: PUBLIC_ERROR_REGISTRY.UNAUTHORIZED,
            httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
            isExpected: true,
        },
        EXPIRED: {
            layers: ['auth'],
            public: PUBLIC_ERROR_REGISTRY.UNAUTHORIZED,
            httpStatus: HTTP_STATUS_CODES.UNAUTHORIZED,
            isExpected: true,
        },
        TAMPERED: {
            layers: ['auth'],
            public: PUBLIC_ERROR_REGISTRY.UNAUTHORIZED,
            httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
            isExpected: true,
        },
    },
});
