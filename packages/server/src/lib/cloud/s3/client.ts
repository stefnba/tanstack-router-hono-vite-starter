import { S3Client } from '@aws-sdk/client-s3';

import { env } from '@app/server/lib/env';

const { AWS_BUCKET_REGION, AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY } = env;

/**
 * S3 client for interacting with the S3 API.
 */
export const s3Client = new S3Client({
    region: AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});
