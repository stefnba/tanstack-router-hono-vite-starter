import { redirect } from '@tanstack/react-router';

import { RouterContext } from '@app/client/routes/__root';

import { sessionQueryOptions } from './api';

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
    const session = await getSessionData(context);
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

/**
 * Checks if the user is authenticated and returns true if they are, false if they are not
 * @param context - The router context
 * @returns True if the user is authenticated, false if they are not
 */
export const checkProtectedRoute = async (context: RouterContext) => {
    const session = await getSessionData(context);
    if (!session) {
        return false;
    }
    return true;
};

/**
 */
export const getSessionData = async (context: RouterContext) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions);
    return session;
};
