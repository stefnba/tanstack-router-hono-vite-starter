import { useQuery } from '@tanstack/react-query';
import { sessionQueryOptions } from './query-options';

export const useAuth = () => {
    const { data: auth, error } = useQuery(sessionQueryOptions);
    return {
        user: auth?.user,
        session: auth?.session,
        isAuthenticated: !!auth?.session,
        status: auth?.session ? 'loggedIn' : 'loggedOut',
        error: error,
    };
};
