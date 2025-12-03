import { createAuthClient } from 'better-auth/react';
import {
    customSessionClient,
    emailOTPClient,
    inferAdditionalFields,
} from 'better-auth/client/plugins';
import type { auth } from '@app/server/src/lib/auth';

// ================================
// Client
// ================================
export const authClient = createAuthClient({
    plugins: [
        emailOTPClient(),
        customSessionClient<typeof auth>(),
        inferAdditionalFields<typeof auth>(),
    ],
});

// ================================
// Types
// ================================
export type TAuthErrorCodes = keyof typeof authClient.$ERROR_CODES;
export type { TAuthSession, TAuthUser } from '@app/server/src/lib/auth';
