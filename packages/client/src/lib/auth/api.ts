import { queryOptions } from '@tanstack/react-query';

import { authClient } from './client';

export const sessionQueryOptions = queryOptions({
    queryKey: ['auth_session'],
    queryFn: async () => {
        const session = await authClient.getSession();
        console.log(
            '⭐️ getting auth session...',
            session.data?.session !== undefined ? 'logged in' : 'logged out'
        );
        if (!session.error) {
            console.log('sessionQueryOptions', session.error);
        }
        return session.data;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
});
