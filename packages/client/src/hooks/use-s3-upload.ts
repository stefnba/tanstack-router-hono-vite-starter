import { UseMutationOptions, useMutation } from '@tanstack/react-query';
import { FileWithPath } from 'react-dropzone';
import z from 'zod';

import { UploadFileTypes, s3Contract } from '@app/shared/lib/cloud/s3';
import { SharedS3UploadConfig } from '@app/shared/lib/cloud/s3/config';

import '@app/client/api';
import { computeChecksum } from '@app/client/lib/upload/utils';

interface UseS3UploadOptions {
    onSuccess?: () => void;
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
/**
 * Hook to upload a file to S3.
 */
export const useS3Upload = (params: {
    config: SharedS3UploadConfig;
    endpoint: UploadEndpoint;
    options: UseS3UploadOptions;
}) => {
    const { config } = params;

    const mutate = useMutation(params.endpoint);

    const upload = async (file: FileWithPath) => {
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
        const {
            data: { url, key, bucket },
        } = await mutate.mutateAsync(
            {
                json: { fileType: validatedFileType.data, fileSize: file.size, checksum },
            },
            {
                onError: (error) => {
                    console.error(error);
                },
            }
        );

        // todo upload file to S3
        // await uploadFileToS3(url, file, (p) => setProgress(p));
    };

    return {
        upload,
        isUploading: mutate.isPending,
        error: mutate.error,
    };
};
