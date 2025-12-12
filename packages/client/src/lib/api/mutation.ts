import { UseMutationOptions } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { StatusCode } from 'hono/utils/http-status';

import { ErrorStatusCode } from '@shared/lib/error/types';

import { AnyEndpoint, TQueryKeyString } from '@/lib/api/types';
import { buildQueryKey } from '@/lib/api/utils';
import { handleApiError } from '@/lib/error/handler';
import { TErrorHandler } from '@/lib/error/types';

import { queryClientInstance } from './client';

/**
 * Configuration options for our mutation options factory.
 * Builds on `UseMutationOptions` from TanStack Query but omits `mutationKey` and `mutationFn`
 * as they are handled by the factory.
 */
export type TApiMutationOptions<TEndpoint extends AnyEndpoint, TResponse, TResponseError> = Omit<
    UseMutationOptions<TResponse, TResponseError, InferRequestType<TEndpoint>>,
    'mutationKey' | 'mutationFn'
>;

/**
 * The factory function type returned by `createMutationOptions`.
 * Allows overriding default options and providing custom error handlers at the usage site.
 */
export type ApiMutationOptionsFunction<
    TEndpoint extends AnyEndpoint,
    TStatus extends StatusCode = 201,
    TResponse = InferResponseType<TEndpoint, TStatus>,
    TResponseError = InferResponseType<TEndpoint, ErrorStatusCode>,
> = (
    options?: TApiMutationOptions<TEndpoint, TResponse, TResponseError> & {
        errorHandlers?: TErrorHandler;
    }
) => UseMutationOptions<TResponse, TResponseError, InferRequestType<TEndpoint>>;

/**
 * Creates a factory function that generates strongly-typed `mutationOptions` for TanStack Query,
 * automatically inferring types from the Hono endpoint.
 *
 * This helper simplifies creating type-safe mutations by:
 * 1. Inferring request/response types from the Hono endpoint
 * 2. Handling error responses automatically (rejecting with JSON)
 * 3. Providing smart cache invalidation for related queries
 *
 * @template TEndpoint - The Hono endpoint function type
 * @template TStatus - The expected success status code (default: 201)
 *
 * @param endpoint - The API endpoint function (e.g. `client.posts.$post`)
 * @param defaultQueryKey - Optional base query key(s) to invalidate on success
 * @param defaultOptions - Optional default options for the mutation
 *
 * @example
 * // Define the mutation options
 * const createPost = createMutationOptions(
 *   client.posts.$post,
 *   'posts', // Invalidates 'posts' queries on success
 *   {
 *     onError: (error) => toast.error(error.message)
 *   }
 * );
 *
 * // Use in component
 * const mutation = useMutation(createPost({
 *   errorHandlers: {
 *     default: (error) => toast.error(error.message)
 *   }
 * }));
 * mutation.mutate({ json: { title: 'Hello' } });
 */
export const createMutationOptions = <
    TEndpoint extends AnyEndpoint,
    TStatus extends StatusCode = 201,
    TResponse = InferResponseType<TEndpoint, TStatus>,
    TResponseError = InferResponseType<TEndpoint, ErrorStatusCode>,
>(
    endpoint: TEndpoint,
    defaultQueryKey?: TQueryKeyString,
    defaultOptions?: TApiMutationOptions<TEndpoint, TResponse, TResponseError>
): ApiMutationOptionsFunction<TEndpoint, TStatus, TResponse, TResponseError> => {
    return (
        options?: TApiMutationOptions<TEndpoint, TResponse, TResponseError> & {
            errorHandlers?: TErrorHandler;
        }
    ) => {
        const { errorHandlers, ...instanceOptions } = options || {};

        //
        return {
            ...defaultOptions,
            ...instanceOptions,
            onError: (error, variables, result, context) => {
                // Handle the error
                handleApiError(error, errorHandlers);

                // call the onError callback
                return instanceOptions?.onError?.(error, variables, result, context);
            },
            mutationFn: async (params: InferRequestType<TEndpoint>) => {
                const response = await endpoint(params);

                if (!response.ok) {
                    const errorData = await response.json();
                    return Promise.reject(errorData);
                }

                // Smart invalidation using parameter extraction
                if (defaultQueryKey) {
                    const baseKeys = Array.isArray(defaultQueryKey)
                        ? defaultQueryKey
                        : [defaultQueryKey];

                    // Invalidate each base key
                    baseKeys.forEach((key) => {
                        // For mutations, usually just invalidate the base key without mutation params
                        const queryKey = buildQueryKey({
                            defaultKey: key,
                            // Don't include mutation variables in query keys for invalidation
                        });

                        // TanStack Query will match prefixes automatically
                        queryClientInstance.invalidateQueries({ queryKey });
                    });
                }

                return response.json();
            },
        };
    };
};
