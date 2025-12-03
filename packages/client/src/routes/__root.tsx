import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthState } from '@/lib/auth';
import { QueryClient } from '@tanstack/react-query';

const RootLayout = () => (
    <>
        <div className="p-4 gap-2 flex">
            <Link to="/" className="[&.active]:font-bold">
                Home
            </Link>
            <Link to="/about" className="[&.active]:font-bold">
                About
            </Link>
            <Link to="/posts" className="[&.active]:font-bold">
                Posts
            </Link>
            <Link to="/dashboard" className="[&.active]:font-bold">
                Dashboard (protected)
            </Link>
            <Link to="/signin" className="[&.active]:font-bold">
                Signin
            </Link>
            <Link to="/signup" className="[&.active]:font-bold">
                Signup
            </Link>
        </div>
        <hr />
        <Outlet />
        <ReactQueryDevtools />
        <TanStackRouterDevtools />
    </>
);

export interface RouterContext {
    // auth
    auth: AuthState;
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({ component: RootLayout });
