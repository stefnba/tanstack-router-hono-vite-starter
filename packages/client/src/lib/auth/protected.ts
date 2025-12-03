import { RouterContext } from '@/routes/__root';
import { sessionQueryOptions } from './query-options';
import { redirect } from '@tanstack/react-router';

/**
 * Ensures that the user is authenticated and redirects to the signin page if not
 * @param context - The router context
 * @param redirectTo - The redirect to path
 * @returns The session
 */
export const ensureProtectedRoute = async (
    context: RouterContext,
    redirectTo: string = '/signin'
) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions);
    if (!session) {
        throw redirect({
            to: redirectTo,
            search: {
                redirect: location.pathname,
            },
        });
    }
    return session;
};
