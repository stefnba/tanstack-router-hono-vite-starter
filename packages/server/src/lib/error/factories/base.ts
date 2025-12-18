import { BaseError } from '@app/server/lib/error/base';

/**
 * Abstract Base Factory for all application errors.
 *
 * Provides a fluent API for building and throwing errors.
 * Wraps a specific Error instance (T extends BaseError) and allows modifying it
 * before throwing.
 */
export class AppErrorFactory<T extends BaseError> {
    /**
     * @param error - The underlying error instance being built
     */
    constructor(protected readonly error: T) {}

    /**
     * Add contextual details to the error.
     * Merges with any existing details.
     *
     * @param details - Key-value pairs of debug information
     */
    details(details: Record<string, unknown>): this {
        this.error.details = { ...this.error.details, ...details };
        return this;
    }

    /**
     * Override the default error message from the registry.
     *
     * @param message - The new error message
     */
    message(message: string): this {
        this.error.message = message;
        return this;
    }

    /**
     * Attach the underlying cause of this error.
     * Useful for error chaining (wrapping low-level errors).
     *
     * @param cause - The original error (if valid Error object)
     */
    cause(cause: unknown): this {
        if (cause instanceof Error) {
            this.error.cause = cause;
        }
        return this;
    }

    /**
     * Returns the built error instance.
     * Use this with the 'throw' keyword to ensure TypeScript control flow analysis works correctly.
     *
     * @example throw appError.server('ERROR').get();
     */
    get(): T {
        return this.error;
    }

    /**
     * Throws the built error immediately.
     * Useful for one-liners or expressions.
     *
     * Note: TypeScript Control Flow Analysis (CFA) may not detect unreachable code after this call
     * due to a known limitation with method calls returning 'never' (https://github.com/microsoft/TypeScript/issues/56049).
     *
     * To ensure correct type narrowing, use one of these patterns:
     * 1. `return appError...throw()`
     * 2. `throw appError...get()`
     */
    throw(): never {
        throw this.error;
    }
}
