import { UseMutationOptions } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { StatusCode } from 'hono/utils/http-status';

import { TQueryKeyString } from '@/lib/api/types';
import { buildQueryKey } from '@/lib/api/utils';
import { queryClientInstance } from '@/main';

/**
 * Creates a pre-configured mutation options object for use with `useMutation`.
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
 * const mutation = useMutation(createPost);
 * mutation.mutate({ json: { title: 'Hello' } });
 */
export const createMutationOptions = <
    TEndpoint extends (args: InferRequestType<TEndpoint>) => Promise<Response>,
    TStatus extends StatusCode = 201,
    TResponse = InferResponseType<TEndpoint, TStatus>,
    TResponseError = InferResponseType<
        TEndpoint,
        400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502
    >,
>(
    endpoint: TEndpoint,
    defaultQueryKey?: TQueryKeyString,
    defaultOptions?: Omit<
        UseMutationOptions<TResponse, TResponseError, InferRequestType<TEndpoint>>,
        'mutationKey' | 'mutationFn'
    >
): UseMutationOptions<TResponse, TResponseError, InferRequestType<TEndpoint>> => {
    return {
        ...defaultOptions,
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

            return response.json() as Promise<TResponse>;
        },
    };
};
