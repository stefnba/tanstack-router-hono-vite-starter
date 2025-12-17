import { QueryClient } from '@tanstack/react-query';
import { hc } from 'hono/client';

import type { AppType } from '@app/server';

// Pre-calculated type following Hono's recommendation for large apps
// This prevents TypeScript from re-inferring the complex app type on every import
export type Client = ReturnType<typeof hc<AppType>>;

// Helper function that returns pre-calculated type instead of inferring
// Provides faster type performance compared to direct hc<typeof routes>()
export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<AppType>(...args);

// API client with optimized type performance
export const apiClient = hcWithType('/').api;

export const queryClientInstance = new QueryClient({
    defaultOptions: {
        queries: {
            // Data is fresh for 1 minute (no refetching on component mount/remount)
            staleTime: 1000 * 60 * 1,
            // Do NOT refetch when the window gains focus (avoids distracting spinners)
            refetchOnWindowFocus: false,
            // Fail faster: Retry only once (default is 3), reducing wait time for 404s/500s
            retry: 1,
        },
    },
});

const a = apiClient.test.$get;
