import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { Header } from '@app/client/components/layout/header';
import { Toaster } from '@app/client/components/ui/sonner';
import { checkProtectedRoute } from '@app/client/lib/auth/protected';
import { ThemeProvider } from '@app/client/lib/theme';

export interface RouterContext {
    queryClient: QueryClient;
}

const RootLayout = () => {
    const { isAuthenticated } = Route.useRouteContext();
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <Header isAuthenticated={isAuthenticated} />
            <hr />
            <Outlet />
            <Toaster />
            <ReactQueryDevtools />
            <TanStackRouterDevtools />
        </ThemeProvider>
    );
};

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootLayout,
    beforeLoad: async ({ context }) => {
        const isAuthenticated = await checkProtectedRoute(context);
        return {
            isAuthenticated,
        };
    },
});
