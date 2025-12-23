import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { FileWithPath } from 'react-dropzone';
import z from 'zod';

import { UploadFileTypes, s3Contract } from '@app/shared/lib/cloud/s3';
import { SharedS3UploadConfig } from '@app/shared/lib/cloud/s3/config';

import { computeChecksum, uploadFileToS3 } from '@app/client/lib/upload/utils';

interface UseS3UploadOptions {
    onSuccess?: (data: { url: string; key: string; bucket: string }) => void;
    onError?: (error: Error) => void;
}

type UploadEndpoint = UseMutationOptions<
    {
        success: true;
        data: {
            url: string;
            key: string;
            bucket: string;
        };
    },
    { success: false; error: string },
    { json: z.infer<typeof s3Contract.generateSignedUrl.endpoint.json> }
>;

type UploadActionResult = {
    url: string;
    key: string;
    bucket: string;
};

/**
 * Hook to upload a file to S3.
 */
export const useS3Upload = (params: {
    /**
     * Shared configuration for the S3 upload.
     */
    config: SharedS3UploadConfig;
    /**
     * Endpoint for signed URL.
     */
    endpoint: UploadEndpoint;
    /**
     * Options for the hook.
     */
    options?: UseS3UploadOptions;
}) => {
    const { config } = params;
    const [progress, setProgress] = useState(0);

    const mutate = useMutation(params.endpoint);

    const upload = async (file: FileWithPath): Promise<UploadActionResult> => {
        try {
            setProgress(0);

            // validate file size
            if (config.maxFileSize && file.size > config.maxFileSize) {
                throw new Error('File too large');
            }

            // validate file type
            const validatedFileType = z.safeParse(UploadFileTypes, file.type);
            if (!validatedFileType.success) {
                throw new Error('Invalid file type');
            }

            // compute checksum
            const checksum = await computeChecksum(file);

            // get signed URL
            const { data: signedUrlData } = await mutate.mutateAsync(
                {
                    json: { fileType: validatedFileType.data, fileSize: file.size, checksum },
                },
                {
                    onError: (error) => {
                        console.error(error);
                    },
                }
            );

            // Set progress to 25% to indicate that the signed URL is being generated
            setProgress(25);

            // Upload file to S3
            await uploadFileToS3(signedUrlData.url, file, (uploadProgress) => {
                // Map progress from 25-100% (0-25% was getting signed URL)
                setProgress(25 + uploadProgress * 0.75);
            });

            setProgress(100);

            const { key, bucket } = signedUrlData;
            const url = signedUrlData.url.split('?')[0];

            // Call success callback
            params.options?.onSuccess?.({ url, key, bucket });

            // Return upload details
            return { url, key, bucket };
        } catch (error) {
            const errorObj = error instanceof Error ? error : new Error('Upload failed');
            params.options?.onError?.(errorObj);
            throw errorObj;
        }
    };

    return {
        progress,
        upload,
    };
};
