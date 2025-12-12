import { UndefinedInitialDataOptions, queryOptions } from '@tanstack/react-query';
import { isRedirect, redirect } from '@tanstack/react-router';
import { InferRequestType, InferResponseType } from 'hono/client';
import { StatusCode } from 'hono/utils/http-status';

import { ErrorStatusCode } from '@shared/lib/error/types';

import { AnyEndpoint, TQueryKeyString } from '@/lib/api/types';
import { buildQueryKey } from '@/lib/api/utils';
import { handleApiError, normalizeApiError } from '@/lib/error/handler';
import { TErrorHandler } from '@/lib/error/types';

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
 * // Use in loader (Render-as-you-fetch)
 * // Prefetch without awaiting to allow the route to render immediately
 * loader: ({ context: { queryClient } }) => {
 *   void queryClient.prefetchQuery(getPosts({ ... }));
 *   return { ... };
 * },
 *
 * // Use in component (Suspense)
 * // Wrap component in <AsyncBoundary> to handle loading/error states
 * <AsyncBoundary>
 *   <MyComponent />
 * </AsyncBoundary>
 *
 * function MyComponent() {
 *   const { data } = useSuspenseQuery(getPosts({
 *     query: { page: '1' }
 *   }));
 *   return <div>{data.title}</div>;
 * }
 */
export const createQueryOptions = <
    TEndpoint extends AnyEndpoint,
    TStatus extends StatusCode = 200,
    TResponse = InferResponseType<TEndpoint, TStatus>,
    TResponseError = InferResponseType<TEndpoint, ErrorStatusCode>,
>(
    endpoint: TEndpoint,
    defaultQueryKey?: TQueryKeyString,
    defaultOptions?: Omit<
        UndefinedInitialDataOptions<TResponse, TResponseError>,
        'queryKey' | 'queryFn'
    >
) => {
    return (params: InferRequestType<TEndpoint>, options?: { errorHandlers?: TErrorHandler }) => {
        // Use custom key extractor or default extraction logic
        const queryKey = buildQueryKey({ defaultKey: defaultQueryKey, params });

        // Extract errorHandlers from options
        const { errorHandlers } = options || {};

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

                        // Normalize the error
                        const normalizedError = normalizeApiError(errorData);

                        // Handle the error
                        handleApiError(normalizedError, errorHandlers);

                        // Reject the promise with the normalized error
                        return Promise.reject(normalizedError);
                    }

                    return response.json();
                } catch (error) {
                    // Re-throw redirects so TanStack Router can handle them
                    if (isRedirect(error)) {
                        throw error;
                    }

                    // For other errors, just reject the promise.
                    // useSuspenseQuery will throw this to the nearest ErrorBoundary/AsyncBoundary.
                    return Promise.reject(error);
                }
            },
        });
    };
};
