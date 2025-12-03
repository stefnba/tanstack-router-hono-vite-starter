import { createFileRoute } from '@tanstack/react-router';

import { useAuth } from '@/lib/auth/hooks';

export const Route = createFileRoute('/_auth/auth/status')({
    component: RouteComponent,
});

function RouteComponent() {
    const { user, session, isAuthenticated, status, error } = useAuth();
    return (
        <div>
            <h1>Auth Status</h1>
            <p>Status: {status}</p>
            <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>User: {user?.email}</p>
            <p>Session: {session?.id}</p>
            <p>Error: {error?.message}</p>
        </div>
    );
}
