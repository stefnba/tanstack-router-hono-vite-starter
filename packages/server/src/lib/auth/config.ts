import { BetterAuthOptions, betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
// !!! relative import required because of better-auth bug !!!
import { customSession, openAPI } from 'better-auth/plugins';

import { db } from '../db';
import { getEnvVariables } from '../env';
import { SESSION_COOKIE, SESSION_DATA } from './constants';

const { CLIENT_URL } = getEnvVariables();

const options = {
    database: drizzleAdapter(db, {
        provider: 'pg',
    }),
    trustedOrigins: [CLIENT_URL],
    emailAndPassword: {
        enabled: true,
    },
    advanced: {
        cookies: {
            session_token: {
                name: SESSION_COOKIE.NAME,
            },
            session_data: {
                name: SESSION_DATA.NAME,
            },
        },
        cookiePrefix: '',
    },
    verification: {
        modelName: 'authVerification',
    },
    session: {
        modelName: 'authSession',
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes cache duration in seconds
        },
    },
    account: {
        modelName: 'authAccount',
    },
    plugins: [openAPI()],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
    ...options,
    plugins: [
        ...options.plugins,
        customSession(async ({ user, session }) => {
            // remove ban-related fields
            const { ...restUser } = user;

            return {
                user: {
                    ...restUser,
                },
                session,
            };
        }, options),
    ],
});
