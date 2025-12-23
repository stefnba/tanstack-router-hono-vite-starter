import { defineSharedS3UploadConfig } from '@app/shared/lib/cloud/s3/config';

export const avatarUploadConfig = defineSharedS3UploadConfig({
    allowedFileTypes: ['image/png', 'image/jpeg', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
});
