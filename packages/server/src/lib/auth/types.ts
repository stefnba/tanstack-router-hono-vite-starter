import { type auth } from './config';

export type TAuthSession = typeof auth.$Infer.Session.session;
export type TAuthUser = typeof auth.$Infer.Session.user;

export type TAuthContext = {
    user: TAuthUser | null;
    session: TAuthSession | null;
};
