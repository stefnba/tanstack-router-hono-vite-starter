import { FileWithPath } from 'react-dropzone';
import z from 'zod';

import { TS3UploadConfig } from '@app/shared/lib/cloud/s3/schemas';
import { UploadFileTypes } from '@app/shared/lib/cloud/s3/schemas';

export type SharedS3UploadConfig = Omit<TS3UploadConfig, 'bucket' | 'generateKey'> & {
    maxFiles?: number;
    minFiles?: number;
};

export type SharedS3UploadReturn = SharedS3UploadConfig & {
    multiple: boolean;
    dropzoneConfig: {
        multiple: boolean;
        maxFiles: number;
        maxSize: number;
        accept: Record<string, string[]>;
    };
    formSchema: ReturnType<typeof createFileUploadFormSchema>;
};

/**
 * Define a shared S3 upload config.
 *
 * This utility function takes a shared S3 upload configuration and returns an enhanced object
 * that includes configuration for `react-dropzone`.
 *
 * It automatically:
 * 1. Calculates the `multiple` boolean based on `maxFiles`.
 * 2. Generates the `accept` object for `react-dropzone` from `allowedFileTypes` (MIME types).
 * 3. Creates a nested `dropzoneConfig` object to be spread directly onto the `<FileUpload />` component.
 * 4. Generates a Zod `formSchema` for validating the uploaded files.
 *
 * @example
 * ```ts
 * export const avatarUploadConfig = defineSharedS3UploadConfig({
 *     allowedFileTypes: ['image/png', 'image/jpeg'],
 *     maxFileSize: 5 * 1024 * 1024,
 *     maxFiles: 1,
 *     minFiles: 1,
 * });
 *
 * // Usage in React component:
 * <FileUpload
 *     name="files"
 *     config={avatarUploadConfig.dropzoneConfig}
 *     // ... other props
 * />
 *
 * // Usage in Zod schema:
 * const schema = z.object({
 *    files: avatarUploadConfig.formSchema,
 * });
 * ```
 */
export const defineSharedS3UploadConfig = <const T extends SharedS3UploadConfig>(
    config: T
): SharedS3UploadReturn => {
    const accept = config.allowedFileTypes.reduce(
        (acc, type) => {
            acc[type] = [];
            return acc;
        },
        {} as Record<string, string[]>
    );

    const maxFiles = config.maxFiles ?? 1;
    const minFiles = config.minFiles ?? 1;

    return {
        ...config,
        maxFiles,
        minFiles,
        multiple: maxFiles > 1,
        dropzoneConfig: {
            multiple: maxFiles > 1,
            maxFiles: maxFiles,
            maxSize: config.maxFileSize,
            accept,
        },
        formSchema: createFileUploadFormSchema(config),
    };
};

/**
 * Create a file upload form schema.
 * @param params - The parameters for the file upload form schema.
 * @returns The file upload form schema.
 */
export const createFileUploadFormSchema = (params: SharedS3UploadConfig) => {
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
