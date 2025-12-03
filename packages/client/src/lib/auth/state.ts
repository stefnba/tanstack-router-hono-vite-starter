import type { TAuthSession, TAuthUser } from './client';

export const authState: AuthState = {
    status: 'loggedOut',
    user: undefined,
    session: undefined,
    isAuthenticated: false,
};

export type AuthState = {
    session: TAuthSession | undefined;
    user: TAuthUser | undefined;
    isAuthenticated: boolean;
    status: 'loggedOut' | 'loggedIn';
};
