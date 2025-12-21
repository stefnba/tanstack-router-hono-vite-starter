import { appError } from '@app/server/lib/error';
import { BaseError } from '@app/server/lib/error/base';

import { ServiceFn } from './types';

type ServiceHandlerParams<I, O> = {
    serviceFn: ServiceFn<I, O>;
    // throwOnNull: boolean;
    operation?: string;
    onNull: 'throw' | 'return';
    resource?: string;
};

/**
 * Wraps a service function with additional logic for error handling and null checks.
 *
 * @param params - Configuration for the service handler.
 * @returns A wrapped service function.
 */
// Overload for throw on null
export function serviceHandler<I, O>(
    params: ServiceHandlerParams<I, O> & { onNull: 'throw' }
): ServiceFn<I, NonNullable<O>>;
// Overload for return on null
export function serviceHandler<I, O>(
    params: ServiceHandlerParams<I, O> & { onNull: 'return' }
): ServiceFn<I, O>;
// Overload for union of throw and return
export function serviceHandler<I, O>(params: ServiceHandlerParams<I, O>): ServiceFn<I, O>;
// Implementation
export function serviceHandler<I, O>(params: ServiceHandlerParams<I, O>): ServiceFn<I, O> {
    const { serviceFn, operation, onNull, resource } = params;

    return async (input: I): Promise<O> => {
        const operationName = operation || 'unknown operation';
        const resourceName = resource ? `${resource} ` : '';

        try {
            const result = await serviceFn(input);

            if (onNull === 'throw' && (result === null || result === undefined)) {
                // Throw a resource not found error.
                // In a real app, you might want to customize the error code or message based on context.
                // But 'NOT_FOUND' is the standard semantic for "I expected something but got null".
                throw appError
                    .resource('NOT_FOUND')
                    .message(`${operationName} returned null`)
                    .withResource(resourceName)
                    .get();
            }

            return result;
        } catch (error) {
            // 1. Pass through existing AppErrors (they already have context/status)
            if (error instanceof BaseError) {
                throw error;
            }

            // 2. Wrap unknown errors (DB errors, etc.) with context
            // This ensures the global handler receives a BaseError with a clear operation chain
            throw appError
                .server('INTERNAL_ERROR')
                .message(`Failed to ${operationName} for resource ${resourceName}`.trim())
                .cause(error instanceof Error ? error : new Error(String(error)))
                .withLayer('service')
                .get();
        }
    };
}
