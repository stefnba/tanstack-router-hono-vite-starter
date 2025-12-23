import { TS3UploadConfig } from '@app/shared/lib/cloud/s3/schemas';

export type SharedS3UploadConfig = Omit<TS3UploadConfig, 'bucket' | 'generateKey'>;

/**
 * Define a shared S3 upload config.
 */
export const defineSharedS3UploadConfig = <const T extends SharedS3UploadConfig>(config: T): T => {
    return config;
};
