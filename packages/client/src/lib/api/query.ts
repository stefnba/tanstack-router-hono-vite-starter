import { UndefinedInitialDataOptions, queryOptions } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';
import { InferRequestType, InferResponseType } from 'hono/client';
import { StatusCode } from 'hono/utils/http-status';

import { TQueryKeyString } from '@/lib/api/types';
import { buildQueryKey } from '@/lib/api/utils';

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
