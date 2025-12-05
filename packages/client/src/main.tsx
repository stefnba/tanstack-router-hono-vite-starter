import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

// Import the generated route tree
import { routeTree } from '@/routeTree.gen';
import './styles.css';

const queryClient = new QueryClient({
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

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {
        queryClient: queryClient,
    },
    defaultPreload: 'intent',
    // Since we're using React Query, we don't want loader calls to ever be stale
    // This will ensure that the loader is always called when the route is preloaded or visited
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export const App = () => {
    return (
        <RouterProvider
            router={router}
            context={{
                queryClient: queryClient,
            }}
        />
    );
};

// Render the app
const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </StrictMode>
    );
}
