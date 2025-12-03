import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './styles.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { authState } from './lib/auth';

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {
        // auth will be passed down from App component
        auth: undefined!,
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
                auth: authState,
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
