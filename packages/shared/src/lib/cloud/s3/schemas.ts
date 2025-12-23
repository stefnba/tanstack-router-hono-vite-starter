import { z } from 'zod';

export const UploadFileTypes = z.enum([
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
]);
export type UploadFileTypes = z.infer<typeof UploadFileTypes>;

export const CreateUploadRecordSchema = z.object({
    url: z.string(),
    type: z.string(),
    filename: z.string(),
});

export const SignedS3UrlInputSchema = z.object({
    fileType: UploadFileTypes,
    fileSize: z.coerce.number(),
    checksum: z.string(),
    key: z.string().optional(),
});

export const DeleteS3FileSchema = z.object({
    key: z.string(),
    bucket: z.string(),
});

/**
 * Schema for the configuration of the S3 upload.
 */
export const S3UploadConfigSchema = z.object({
    allowedFileTypes: z.array(UploadFileTypes),
    maxFileSize: z.number(),
    bucket: z.string().optional(),
});
export type TS3UploadConfig = z.infer<typeof S3UploadConfigSchema>;
