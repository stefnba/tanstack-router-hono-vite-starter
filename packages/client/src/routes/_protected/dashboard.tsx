import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';
import { createFileRoute, useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/dashboard')({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = Route.useNavigate();
    const { queryClient } = Route.useRouteContext();
    const router = useRouter();

    const handleLogout = async () => {
        const response = await authClient.signOut({
            fetchOptions: {
                onRequest() {
                    // Security-first approach: Clear all cache to prevent data leakage
                    // 1. First set session to null to prevent immediate refetch
                    const queryCache = queryClient.getQueryCache();
                    // iterate over all queries and set them to null
                    for (const query of queryCache.findAll()) {
                        console.log('clearing query', query);
                        const queryKey = query.queryKey;
                        queryClient.setQueryData(queryKey, null);
                    }
                },
                onResponse() {
                    // 2. Then clear all cache after a brief delay to prevent race conditions
                    setTimeout(() => {
                        queryClient.clear();
                    }, 500);
                },
            },
        });
        if (response.error) {
            console.error('logout error', response.error);
            return;
        }

        router.invalidate();

        navigate({ to: '/' });
    };

    return (
        <div className="p-4">
            <div className="text-lg font-medium mb-4">Hello "/_protected/dashboard"!</div>
            <Button onClick={handleLogout}>Logout</Button>
        </div>
    );
}
