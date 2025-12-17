import type { TPublicErrorCode } from '@app/shared/config/error-registry';
import type { TAPIErrorResponse } from '@app/shared/lib/error/response';

/**
 * Maps public error codes to handler functions.
 * Used in createQuery and createMutation's errorHandlers option.
 */
export type TErrorHandler<T = void> = {
    [key in TPublicErrorCode]?: (error: TAPIErrorResponse) => T;
} & {
    default?: (error: TAPIErrorResponse) => T;
};
