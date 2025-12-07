import { UndefinedInitialDataOptions, queryOptions } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';
import { InferRequestType, InferResponseType } from 'hono/client';
import { StatusCode } from 'hono/utils/http-status';

import { TQueryKeyString } from '@/lib/api/types';
import { buildQueryKey } from '@/lib/api/utils';

/**
 * Creates a factory function that generates strongly-typed `queryOptions` for TanStack Query,
 * inferred directly from the Hono endpoint.
 *
 * This helper bridges Hono client endpoints with TanStack Query by:
 * 1. Inferring types for parameters, response, and errors
 * 2. Automatically generating consistent query keys
 * 3. Handling 401 redirects and error parsing
 * 4. Returning a factory that accepts endpoint params
 *
 * @template TEndpoint - The Hono endpoint function type
 * @template TStatus - The expected success status code (default: 200)
 *
 * @param endpoint - The API endpoint function (e.g. `client.posts.$get`)
 * @param defaultQueryKey - Base query key to use for this endpoint
 * @param defaultOptions - Optional default options for the query
 *
 * @returns A function that takes endpoint params and returns `queryOptions`
 *
 * @example
 * // Define the query options factory
 * const getPosts = createQueryOptions(
 *   client.posts.$get,
 *   'posts',
 *   { staleTime: 5000 }
 * );
 *
 * // Use in component
 * const { data } = useQuery(getPosts({
 *   query: { page: '1' }
 * }));
 *
 * // Use in loader
 * loader: ({ context: { queryClient } }) =>
 *   queryClient.ensureQueryData(getPosts({ ... }))
 */
export const createQueryOptions = <
    TEndpoint extends (args: InferRequestType<TEndpoint>) => Promise<Response>,
    TStatus extends StatusCode = 200,
    TResponse = InferResponseType<TEndpoint, TStatus>,
    TResponseError = InferResponseType<
        TEndpoint,
        400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502
    >,
>(
    endpoint: TEndpoint,
    defaultQueryKey?: TQueryKeyString,
    defaultOptions?: Omit<
        UndefinedInitialDataOptions<TResponse, TResponseError>,
        'queryKey' | 'queryFn'
    >
) => {
    return (params: InferRequestType<TEndpoint>) => {
        // Use custom key extractor or default extraction logic
        const queryKey = buildQueryKey({ defaultKey: defaultQueryKey, params });

        console.log('queryKey', queryKey);

        return queryOptions<TResponse, TResponseError>({
            ...defaultOptions,
            queryKey: queryKey,
            queryFn: async () => {
                try {
                    const response = await endpoint(params);

                    if (!response.ok) {
                        if (response.status === 401) {
                            redirect({ to: '/signin' });
                        }

                        const errorData = await response.json();

                        return Promise.reject(errorData);
                    }

                    return response.json();
                } catch (error) {
                    console.error('Query error:', error);

                    return Promise.reject(error);
                }
            },
        });
    };
};
