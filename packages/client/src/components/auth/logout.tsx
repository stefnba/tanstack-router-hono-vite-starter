import { useRouter } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { queryClientInstance } from '@/lib/api/client';
import { authClient } from '@/lib/auth/client';

export const Logout = () => {
    const router = useRouter();

    const handleLogout = async () => {
        const response = await authClient.signOut({
            fetchOptions: {
                onRequest() {
                    // Security-first approach: Clear all cache to prevent data leakage
                    // 1. First set session to null to prevent immediate refetch
                    const queryCache = queryClientInstance.getQueryCache();
                    // iterate over all queries and set them to null
                    for (const query of queryCache.findAll()) {
                        console.log('clearing query', query);
                        const queryKey = query.queryKey;
                        queryClientInstance.setQueryData(queryKey, null);
                    }
                },
                onResponse() {
                    // 2. Then clear all cache after a brief delay to prevent race conditions
                    setTimeout(() => {
                        queryClientInstance.clear();
                    }, 500);
                },
            },
        });
        if (response.error) {
            console.error('logout error', response.error);
            return;
        }

        router.invalidate();

        router.navigate({ to: '/' });
    };
    return (
        <Button className="ml-auto" variant="outline" onClick={handleLogout}>
            Logout
        </Button>
    );
};
