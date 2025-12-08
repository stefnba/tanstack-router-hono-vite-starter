import { z } from 'zod';

import { PUBLIC_ERROR_REGISTRY, TPublicErrorCode } from '@shared/config/error-registry';
import { typedKeys } from '@shared/lib/utils';

/**
 * Zod schema for the public error codes
 */
export const PublicErrorCodesSchema = z.enum(
    typedKeys(PUBLIC_ERROR_REGISTRY).map((category) => category) as [
        TPublicErrorCode,
        ...TPublicErrorCode[],
    ]
);

/**
 * Zod schema for the API error response
 */
export const errorResponseApiSchema = z.object({
    success: z.literal(false),
    error: z.object({
        code: PublicErrorCodesSchema,
        message: z.string(),
        details: z.record(z.string(), z.unknown()).optional(),
    }),
    request_id: z.string(),
});

/**
 * Type for the API error response
 */
export type TAPIErrorResponse = z.infer<typeof errorResponseApiSchema>;
