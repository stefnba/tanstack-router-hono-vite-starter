import { TS3UploadConfig } from '@app/shared/lib/cloud/s3/schemas';

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
    };
};
