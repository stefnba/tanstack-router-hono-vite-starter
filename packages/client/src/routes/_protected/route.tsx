import { Outlet, createFileRoute } from '@tanstack/react-router';

import { ensureProtectedRoute } from '@/lib/auth/protected';

export const Route = createFileRoute('/_protected')({
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        const session = await ensureProtectedRoute(context);
        return {
            session: session,
        };
    },
});

function RouteComponent() {
    return <Outlet />;
}
