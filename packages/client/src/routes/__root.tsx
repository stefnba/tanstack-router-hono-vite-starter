import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthState } from '@/lib/auth';
import { QueryClient } from '@tanstack/react-query';
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
    // auth
    auth: AuthState;
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({ component: RootLayout });
