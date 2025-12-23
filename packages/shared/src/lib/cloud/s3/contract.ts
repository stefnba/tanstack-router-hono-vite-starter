import { z } from 'zod';

import { DeleteS3FileSchema, SignedS3UrlInputSchema } from './schemas';

/**
 * Manually defined contract for S3 operations.
 * Mimics the output of ContractBuilder without requiring a database resource.
 */
export const s3Contract = {
    /**
     * Generate a signed URL for a file to be uploaded to S3.
     */
    generateSignedUrl: {
        /**
         * Service input schema.
         */
        service: SignedS3UrlInputSchema.extend({
            bucket: z.string(),
            expiresIn: z.number().optional(),
        }),
        /**
         * Endpoint validation schema.
         */
        endpoint: {
            json: SignedS3UrlInputSchema,
        },
    },
    /**
     * Delete a file from S3.
     */
    deleteFile: {
        service: DeleteS3FileSchema,
    },
    readFile: {
        service: z.object({
            key: z.string(),
            bucket: z.string(),
        }),
    },
} as const;
