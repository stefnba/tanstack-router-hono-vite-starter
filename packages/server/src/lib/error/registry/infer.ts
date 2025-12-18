import { ERROR_REGISTRY } from '@app/server/config/error-registry';
import {
    InferErrorCategoriesFromRegistry,
    InferErrorKeysFromRegistry,
} from '@app/server/lib/error/registry/types';

/**
 * Union type of all valid error keys in the registry
 *
 * Represents all possible error keys in dot-notation format (e.g., 'VALIDATION.INVALID_INPUT')
 *
 * @example
 * ```typescript
 * const key: TErrorKeys = 'VALIDATION.INVALID_INPUT'; // ✓ Valid
 * const invalid: TErrorKeys = 'INVALID.KEY'; // ✗ Type error
 * ```
 */
export type TErrorKeys = InferErrorKeysFromRegistry<typeof ERROR_REGISTRY.registry>;

/**
 * Union type of all error categories in the registry
 *
 * Represents top-level error categories (e.g., 'VALIDATION', 'AUTH', 'RESOURCE')
 *
 * @example
 * ```typescript
 * const category: TErrorCategory = 'VALIDATION'; // ✓ Valid
 * const invalid: TErrorCategory = 'INVALID'; // ✗ Type error
 * ```
 */
export type TErrorCategory = InferErrorCategoriesFromRegistry<typeof ERROR_REGISTRY.registry>;

/**
 * Extract valid error codes for a specific category
 *
 * Returns a union of error codes that belong to the specified category.
 *
 * @template C - The error category
 *
 * @example
 * ```typescript
 * type ValidationCodes = TErrorCodeByCategory<'VALIDATION'>;
 * // Result: 'INVALID_INPUT' | 'MISSING_FIELD' | 'INVALID_FORMAT'
 *
 * const code: ValidationCodes = 'INVALID_INPUT'; // ✓ Valid
 * const invalid: ValidationCodes = 'NOT_FOUND'; // ✗ Type error
 * ```
 */
export type TErrorCodeByCategory<C extends TErrorCategory> =
    keyof (typeof ERROR_REGISTRY.registry)[C] & string;
