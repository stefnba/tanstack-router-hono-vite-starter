import { createFileRoute } from '@tanstack/react-router';

import { getSessionData } from '@/lib/auth';
import { useAuth } from '@/lib/auth/hooks';

export const Route = createFileRoute('/_auth/auth/status')({
    component: RouteComponent,
    loader: async ({ context }) => {
        return { session: await getSessionData(context) };
    },
});

function RouteComponent() {
    const { user, session, isAuthenticated, status, error } = useAuth();
    const { session: loaderSession } = Route.useLoaderData();
    return (
        <div className="flex flex-col gap-4 p-4">
            <div>
                <h1 className="text-2xl font-bold mb-4">Auth Status from hook</h1>
                <p>Status: {status}</p>
                <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
                <p>User: {user?.email}</p>
                <p>Session: {session?.id}</p>
                <p>Error: {error?.message}</p>
            </div>
            <div>
                <h1 className="text-2xl font-bold mb-4">Auth Status from loader</h1>
                <p>Status: {loaderSession?.session ? 'loggedIn' : 'loggedOut'}</p>
                <p>User: {loaderSession?.user?.email}</p>
                <p>Session: {loaderSession?.session?.id}</p>
            </div>
        </div>
    );
}
