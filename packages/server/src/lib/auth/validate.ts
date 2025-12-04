import { Context } from 'hono';

/**
 * Get the current user without throwing an error
 * @returns User
 * @throws AuthError if user is not found in context
 */
export const getUser = (c: Context) => {
    const user = c.get('user');

    if (!user) {
        // todo return 401
        throw new Error('User not found in context');
    }

    return user;
};

/**
 * Get the current session without throwing an error
 * @returns Session
 * @throws AuthError if session is not found in context
 */
export const getSession = (c: Context) => {
    const session = c.get('session');

    if (!session) {
        // todo return 401
        throw new Error('Session not found in context');
    }

    return session;
};
