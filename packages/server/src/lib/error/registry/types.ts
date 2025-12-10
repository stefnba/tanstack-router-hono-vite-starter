import { ContentfulStatusCode } from 'hono/utils/http-status';

import { TErrorLayer } from '@server/lib/error/base/types';

import { TPublicErrorRegistryDefinition } from '@shared/lib/error/registry/types';

/**
 * Definition for a single error in the registry
 *
 * @property message - Human-readable error message (optional)
 * @property httpStatus - HTTP status code to return for this error (optional)
 * @property layers - Application layers where this error can be thrown (optional)
 * @property isExpected - Indicates whether this error is expected during normal operation (optional)
 * @property public - Public error definition (required)
 */
export type TErrorRegistryDefinition = Readonly<{
    message?: string;
    httpStatus?: ContentfulStatusCode;
    layers?: ReadonlyArray<TErrorLayer>;
    isExpected: boolean;
    public: TPublicErrorRegistryDefinition;
}>;

/**
 * Structure of the error registry object
 *
 * A nested object where:
 * - First level keys are categories (e.g., 'AUTH', 'VALIDATION')
 * - Second level keys are error codes (e.g., 'INVALID_TOKEN', 'MISSING_FIELD')
 * - Values are error definitions
 *
 * @example
 * ```typescript
 * const registry = {
 *   AUTH: {
 *     INVALID_TOKEN: { message: 'Invalid token', httpStatus: 401 }
 *   }
 * }
 * ```
 */
export type TErrorRegistryObject = Readonly<
    Record<string, Readonly<Record<string, TErrorRegistryDefinition>>>
>;

// ==================================================
// UTILITIES
// ==================================================

/**
 * Infer all possible error keys from a registry object
 *
 * Transforms nested structure into flat dot-notation keys
 *
 * @example
 * ```typescript
 * type Registry = { AUTH: { INVALID_TOKEN: {...} } }
 * type Keys = InferErrorKeys<Registry>
 * // Result: "AUTH.INVALID_TOKEN"
 * ```
 */
export type InferErrorKeys<R extends TErrorRegistryObject> = {
    [K in keyof R & string]: { [S in keyof R[K] & string]: `${K}.${S}` }[keyof R[K] & string];
}[keyof R & string];

/**
 * Extract error definition for a specific key from the registry
 *
 * Splits dot-notation key into category and code, then retrieves the definition
 *
 * @example
 * ```typescript
 * type Registry = { AUTH: { INVALID_TOKEN: { message: 'Invalid' } } }
 * type Def = InferErrorDefinitionFromKey<Registry, 'AUTH.INVALID_TOKEN'>
 * // Result: { message: 'Invalid' }
 * ```
 */
export type InferErrorDefinitionFromKey<
    R extends TErrorRegistryObject,
    K extends string,
> = K extends `${infer Category}.${infer Code}`
    ? Category extends keyof R
        ? Code extends keyof R[Category]
            ? R[Category][Code]
            : never
        : never
    : never;

/**
 * Extract all category names from a registry object
 *
 * Helper type that avoids circular reference to ErrorRegistry class.
 * Use this when you need to extract categories from typeof ERROR_REGISTRY.registry
 *
 * @example
 * ```typescript
 * type Categories = InferErrorCategoriesFromRegistry<typeof ERROR_REGISTRY.registry>
 * // Result: "AUTH" | "VALIDATION" | "RESOURCE" | ...
 * ```
 */
export type InferErrorCategoriesFromRegistry<R extends TErrorRegistryObject> = keyof R;

/**
 * Union of all error definitions in a registry
 *
 * Used internally for Map value type - avoids recomputing complex conditional type
 */
export type FlattenedRegistryValue<R extends TErrorRegistryObject> = InferErrorDefinitionFromKey<
    R,
    InferErrorKeys<R>
>;

/**
 * Extract all possible error keys from a registry object
 *
 * Helper type that avoids circular reference to ErrorRegistry class.
 * Use this when you need to extract keys from typeof ERROR_REGISTRY.registry
 *
 * @example
 * ```typescript
 * type Keys = InferErrorKeysFromRegistry<typeof ERROR_REGISTRY.registry>
 * // Result: "AUTH.INVALID_TOKEN" | "VALIDATION.INVALID_FORMAT" | ...
 * ```
 */
export type InferErrorKeysFromRegistry<R extends TErrorRegistryObject> = InferErrorKeys<R>;
