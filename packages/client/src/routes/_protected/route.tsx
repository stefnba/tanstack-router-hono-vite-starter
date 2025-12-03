import { sessionQueryOptions } from '@/lib/auth/query-options';

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { RouterContext } from '../__root';
import { ensureProtectedRoute } from '@/lib/auth/protected';

export const Route = createFileRoute('/_protected')({
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        await ensureProtectedRoute(context);
    },
});

function RouteComponent() {
    return <Outlet />;
}
