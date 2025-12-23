import { apiClient } from '@app/client/lib/api/client';
import { createMutationOptions } from '@app/client/lib/api/mutation';

const KEYS = {
    AVATAR: 'avatar',
} as const;

export const userApiEndpoints = {
    getAvatarUploadUrl: createMutationOptions(
        // The path is derived from how we mounted it in server/src/features/user/endpoint.ts
        // .route('/avatar', uploadAvatarEndpoints) which has .post('/signed-url', ...)
        apiClient.users.avatar['signed-url'].$post,
        KEYS.AVATAR
    ),
};
