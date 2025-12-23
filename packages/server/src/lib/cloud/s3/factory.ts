import { zValidator } from '@hono/zod-validator';
import { Context, Hono } from 'hono';
import { z } from 'zod';

import { SharedS3UploadConfig, s3Contract } from '@app/shared/lib/cloud/s3';
import { generateUniqueId, generateUuid } from '@app/shared/lib/utils/misc';

import { TAuthUser, getUser } from '@app/server/lib/auth';
import { s3Service } from '@app/server/lib/cloud/s3/service';

type SignedUrlInput = z.infer<typeof s3Contract.generateSignedUrl.endpoint.json>;

type UploadToS3EndpointFactoryConfigParams = {
    /**
     * Shared configuration for the S3 upload. Includes the allowed file types and max file size.
     */
    sharedConfig: SharedS3UploadConfig;
    /**
     * Bucket to upload the file to.
     */
    bucket: string;
    /**
     * Function to generate the key (path) for the uploaded file.
     * If not provided, the key provided in the input will be used (and validated if required).
     */
    generateKey?: (params: {
        c: Context;
        user: TAuthUser;
        input: SignedUrlInput;
        helpers: {
            generateRandomString: () => string;
        };
    }) => string | Promise<string> | Array<string | number> | Promise<Array<string | number>>;
};

export const createUploadToS3Endpoints = (config: UploadToS3EndpointFactoryConfigParams) => {
    return new Hono().post(
        '/signed-url',
        zValidator('json', s3Contract.generateSignedUrl.endpoint.json),
        async (c) => {
            const input = c.req.valid('json');
            const user = getUser(c);

            const { sharedConfig, bucket, generateKey } = config;
            const { allowedFileTypes, maxFileSize } = sharedConfig;

            // Validate file type
            if (!allowedFileTypes.includes(input.fileType)) {
                return c.json({ success: false, error: 'Invalid file type' }, 400);
            }

            // Validate file size
            if (input.fileSize > maxFileSize) {
                return c.json({ success: false, error: 'File too large' }, 400);
            }

            let key = input.key;
            if (generateKey) {
                const generatedKey = await generateKey({
                    c,
                    user,
                    input,
                    helpers: { generateRandomString: () => generateUuid() },
                });
                if (Array.isArray(generatedKey)) {
                    // remove all leading and trailing slashes
                    key = generatedKey.map((k) => String(k).replace(/^\/+|\/+$/g, '')).join('/');
                } else {
                    key = generatedKey;
                }
                // replace all whitespace with hyphens
                key = key.replace(/\s+/g, '-');
            }

            if (!key) {
                return c.json({ success: false, error: 'Key is required' }, 400);
            }

            try {
                const url = await s3Service.generateSignedUrl({
                    bucket,
                    key,
                    fileType: input.fileType,
                    fileSize: input.fileSize,
                    checksum: input.checksum,
                });

                return c.json({
                    success: true,
                    data: {
                        url,
                        key,
                        bucket,
                    },
                });
            } catch (error) {
                console.error('Error generating signed URL:', error);
                return c.json({ success: false, error: 'Failed to generate signed URL' }, 500);
            }
        }
    );
};
