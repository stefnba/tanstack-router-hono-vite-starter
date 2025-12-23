import { FileWithPath } from 'react-dropzone';
import z from 'zod';

import { SharedS3UploadReturn } from '@app/shared/lib/cloud/s3';
import { UploadFileTypes } from '@app/shared/lib/cloud/s3/schemas';

/**
 * Create a file upload form schema.
 * @param params - The parameters for the file upload form schema.
 * @returns The file upload form schema.
 */
export const createFileUploadFormSchema = (params: SharedS3UploadReturn) => {
    const { maxFileSize, allowedFileTypes, maxFiles = 1, minFiles = 1 } = params;

    return z
        .array(z.custom<FileWithPath>())
        .min(minFiles, { message: `You must upload at least ${minFiles} files` })
        .max(maxFiles, { message: `You can only upload up to ${maxFiles} files` })
        .refine((files) => files.every((file) => file.size <= maxFileSize), {
            message: `File size must be less than ${maxFileSize / 1024 / 1024} MB`,
        })
        .refine(
            (files) =>
                files.every((file) => allowedFileTypes.includes(file.type as UploadFileTypes)),
            {
                message: `File type must be one of the following: ${allowedFileTypes.join(', ')}`,
            }
        );
};
