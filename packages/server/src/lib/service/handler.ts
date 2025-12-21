import { appError } from '@app/server/lib/error';

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
export const serviceHandler = <I, O>(params: ServiceHandlerParams<I, O>): ServiceFn<I, O> => {
    const { serviceFn, operation, onNull, resource } = params;

    return async (input: I): Promise<O> => {
        const operationName = operation || 'unknown operation';
        const resourceName = resource ? `${resource} ` : '';

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
    };
};
