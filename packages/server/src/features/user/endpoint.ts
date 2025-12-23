import { avatarUploadConfig } from '@app/shared/features/user/config';

import { createUploadToS3Endpoints } from '@app/server/lib/cloud/s3/factory';
import { env } from '@app/server/lib/env';
import { createHonoRouter } from '@app/server/lib/router';

const router = createHonoRouter({ isProtected: true });

export const endpoints = router.route(
    '/avatar',
    createUploadToS3Endpoints({
        sharedConfig: avatarUploadConfig,
        bucket: env.AWS_BUCKET_NAME_PUBLIC_UPLOAD,
        generateKey: ({ user, helpers }) => {
            // e.g. avatars/userId/timestamp-randomString
            return ['avatars', user?.id, Date.now(), helpers.generateRandomString()];
        },
    })
);
