import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import { Header } from '@/components/header';

const RootLayout = () => {
    return (
        <>
            <Header />
            <hr />
            <Outlet />
            <ReactQueryDevtools />
            <TanStackRouterDevtools />
        </>
    );
};

export interface RouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({ component: RootLayout });
