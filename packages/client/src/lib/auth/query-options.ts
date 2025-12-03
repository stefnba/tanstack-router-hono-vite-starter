import { queryOptions } from '@tanstack/react-query';
import { authClient } from './client';

export const sessionQueryOptions = queryOptions({
    queryKey: ['auth_session'],
    queryFn: async () => {
        const session = await authClient.getSession();
        if (!session.error) {
            console.log('sessionQueryOptions', session.error);
        }
        return session.data;
    },
});
