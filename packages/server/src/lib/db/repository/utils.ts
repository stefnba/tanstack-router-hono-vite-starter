import { StandardOperationKeys } from '@app/shared/lib/resource/types';

/**
 * Get the name of a standard operation key as string literal.
 */
export const getStandardOperationKey = <const K extends StandardOperationKeys>(key: K): K => {
    return key;
};
