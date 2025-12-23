import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { s3Contract } from '@app/shared/lib/cloud/s3/contract';

import { defineService } from '@app/server/lib/service';

import { s3Client } from './client';

export const s3Service = defineService('s3')
    .registerContract(s3Contract)
    /**
     * Generate a signed URL for a file to be uploaded to S3.
     * @param bucket - The bucket to upload the file to.
     * @param key - The key of the file to upload.
     * @param fileType - The type of the file to upload.
     * @param fileSize - The size of the file to upload.
     * @param checksum - The checksum of the file to upload.
     * @param expiresIn - The number of seconds the signed URL will be valid for. Defaults to 600 seconds (10 minutes).
     * @returns The signed URL for the file to be uploaded to S3.
     */
    .addService('generateSignedUrl', () => ({
        fn: async ({ bucket, key, fileType, fileSize, checksum, expiresIn = 600 }) => {
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                ContentType: fileType,
                ContentLength: fileSize,
                ChecksumSHA256: checksum,
            });

            const url = await getSignedUrl(s3Client, command, { expiresIn });

            return url;
        },
        onNull: 'throw',
    }))
    /**
     * Delete a file from S3.
     * @param bucket - The bucket to delete the file from.
     * @param key - The key of the file to delete.
     * @returns True if the file was deleted successfully, false otherwise.
     */
    .addService('deleteFile', () => ({
        fn: async ({ bucket, key }) => {
            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            await s3Client.send(command);
            return true;
        },
        onNull: 'return',
    }))
    /**
     * Read a file from S3.
     * @param bucket - The bucket to read the file from.
     * @param key - The key of the file to read.
     * @returns The file content.
     */
    .addService('readFile', () => ({
        fn: async ({ bucket, key }) => {
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });

            const response = await s3Client.send(command);
            return response.Body;
        },
        onNull: 'throw',
    }))
    .done();
