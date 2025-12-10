import { TAppErrorParams } from '@server/lib/error/base';
import { BaseError } from '@server/lib/error/base/error';
import { TErrorCategory, TErrorCodeByCategory } from '@server/lib/error/registry/infer';
import { getErrorCategory } from '@server/lib/error/registry/private';

/**
 * Type helper for creating domain error classes (ValidationError, AuthError, etc.)
 * that automatically set the category and constrain code to that category's valid codes.
 */
export type TDomainErrorParams<C extends TErrorCategory> = Omit<
    TAppErrorParams,
    'category' | 'code'
> & {
    code: TErrorCodeByCategory<C>;
};

/**
 * Validation error class for input validation failures
 *
 * Use this for errors related to invalid user input, missing fields, or format violations.
 * These are expected errors that occur during normal operation and typically return 400 status.
 *
 * @example
 * ```typescript
 * throw new ValidationError({
 *   code: 'INVALID_INPUT',
 *   message: 'Email is required',
 *   httpStatus: 400,
 *   public: PUBLIC_ERROR_REGISTRY.INVALID_INPUT,
 *   isExpected: true,
 *   details: { field: 'email' }
 * });
 * ```
 */
export class ValidationError extends BaseError {
    constructor(params: TDomainErrorParams<'VALIDATION'>) {
        super({
            ...params,
            category: getErrorCategory('VALIDATION'),
        });
    }
}

/**
 * Server error class for internal server failures
 *
 * Use this for unexpected internal errors, service unavailable, or infrastructure
 * failures. Typically returns 500 or 503 status.
 *
 * @example
 * ```typescript
 * throw new ServerError({
 *   code: 'INTERNAL_ERROR',
 *   message: 'Database connection failed',
 *   httpStatus: 500,
 *   public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,
 *   isExpected: false,
 *   cause: connectionError
 * });
 * ```
 */
export class ServerError extends BaseError {
    constructor(params: TDomainErrorParams<'SERVER'>) {
        super({
            ...params,
            category: getErrorCategory('SERVER'),
        });
    }
}

/**
 * Resource error class for resource-related failures
 *
 * Use this for errors related to resource existence like not found, already exists,
 * or conflicts. Typically returns 404 or 409 status.
 *
 * @example
 * ```typescript
 * throw new ResourceError({
 *   code: 'NOT_FOUND',
 *   message: 'User not found',
 *   httpStatus: 404,
 *   public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
 *   isExpected: true,
 *   details: { userId: '123' }
 * });
 * ```
 */
export class ResourceError extends BaseError {
    constructor(params: TDomainErrorParams<'RESOURCE'>) {
        super({
            ...params,
            category: 'RESOURCE',
        });
    }
}

/**
 * Operation error class for operation failures
 *
 * Use this for errors during CRUD operations like create, update, or delete failures.
 * These are unexpected errors that typically return 500 status.
 *
 * @example
 * ```typescript
 * throw new OperationError({
 *   code: 'CREATE_FAILED',
 *   message: 'Failed to create user',
 *   httpStatus: 500,
 *   public: PUBLIC_ERROR_REGISTRY.OPERATION_FAILED,
 *   isExpected: false,
 *   cause: dbError
 * });
 * ```
 */
export class OperationError extends BaseError {
    constructor(params: TDomainErrorParams<'OPERATION'>) {
        super({
            ...params,
            category: 'OPERATION',
        });
    }
}

/**
 * Permission error class for authorization failures
 *
 * Use this for errors related to insufficient permissions, roles, or scopes.
 * Typically returns 403 status.
 *
 * @example
 * ```typescript
 * throw new PermissionError({
 *   code: 'ACCESS_DENIED',
 *   message: 'You do not have permission to access this resource',
 *   httpStatus: 403,
 *   public: PUBLIC_ERROR_REGISTRY.FORBIDDEN,
 *   isExpected: true,
 *   details: { requiredRole: 'admin' }
 * });
 * ```
 */
export class PermissionError extends BaseError {
    constructor(params: TDomainErrorParams<'PERMISSION'>) {
        super({
            ...params,
            category: 'PERMISSION',
        });
    }
}

/**
 * Database error class for database-related failures
 *
 * Use this for low-level database errors like connection failures, query errors,
 * or constraint violations. Often wrapped by OperationError, but can be used directly
 * for specific handling.
 *
 * @example
 * ```typescript
 * throw new DbError({
 *   code: 'UNIQUE_VIOLATION',
 *   message: 'Email already exists',
 *   httpStatus: 409,
 *   public: PUBLIC_ERROR_REGISTRY.ALREADY_EXISTS,
 *   isExpected: true,
 *   details: { table: 'users', constraint: 'email_unique' }
 * });
 * ```
 */
export class DbError extends BaseError {
    constructor(params: TDomainErrorParams<'DB'>) {
        super({
            ...params,
            category: 'DB',
        });
    }
}
