import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, createRootRouteWithContext, useLoaderData } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { Header } from '@/components/layout/header';
import { checkProtectedRoute } from '@/lib/auth/protected';

export interface RouterContext {
    queryClient: QueryClient;
}

const RootLayout = () => {
    const { isAuthenticated } = Route.useRouteContext();
    return (
        <>
            <Header isAuthenticated={isAuthenticated} />
            <hr />
            <Outlet />
            <ReactQueryDevtools />
            <TanStackRouterDevtools />
        </>
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
