import { Prettify, objectHasKey } from '@app/shared/types/utils';

/**
 * Type-safe wrapper for Object.entries
 *
 * This function provides better type inference for Object.entries,
 * returning a properly typed array of [key, value] tuples.
 *
 * @param obj - The object to get entries from
 * @returns A properly typed array of [key, value] tuples
 */
export function typedEntries<T extends object>(obj: T): Array<[keyof T, T[keyof T]]> {
    return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Type-safe wrapper for Object.fromEntries with uniform value types
 *
 * This function provides better type inference for Object.fromEntries,
 * preserving the key types and ensuring uniform value types across all keys.
 * Use this when all values in the resulting object have the same type.
 *
 * @param entries - A typed array of [key, value] tuples
 * @returns A properly typed object constructed from the entries
 */
export function typedFromEntries<K extends PropertyKey, V>(
    entries: ReadonlyArray<readonly [K, V]>
): Record<K, V> {
    return Object.fromEntries(entries) as Record<K, V>;
}

/**
 * Type-safe wrapper for Object.keys
 *
 * This function provides better type inference for Object.keys,
 * returning a properly typed array of keys.
 *
 * @param obj - The object to get keys from
 * @returns A properly typed array of keys
 */
export function typedKeys<T extends object>(obj: T): Array<keyof T> {
    return Object.keys(obj) as Array<keyof T>;
}

/**
 * Utility to pick specific keys from an object.
 *
 * Mode:
 * - If the mode is 'strict' (default), the keys must be a subset of the object keys.
 * - If the mode is 'loose', the keys can be a subset of the object keys.
 *
 * @example
 * ```ts
 * const obj = { a: 1, b: 2, c: 3 };
 * const picked = pickFromObject(obj, ['a', 'b'], 'strict');
 * // picked: { a: 1, b: 2 }
 *
 * const obj = { a: 1, b: 2, c: 3 };
 * const picked = pickFromObject(obj, ['a', 'd'], 'loose');
 * // picked: { a: 1 }
 * ```
 *
 * @param obj - The object to pick from.
 * @param keys - The keys to pick.
 * @param mode - The mode to pick the keys: 'strict' (default) or 'loose'.
 */
// Overload for keyof T keys (default mode)
export function pickFromObject<T extends object, const K extends readonly (keyof T)[]>(
    obj: T,
    keys: K
): Prettify<{ [P in K[number]]: T[P] }>;
// Overload for keyof T keys
export function pickFromObject<T extends object, const K extends readonly (keyof T)[]>(
    obj: T,
    keys: K,
    mode: 'strict'
): Prettify<{ [P in K[number]]: T[P] }>;
// Overload for string keys
export function pickFromObject<T extends object, const K extends readonly string[]>(
    obj: T,
    keys: K,
    mode: 'loose'
): Prettify<Pick<T, Extract<keyof T, K[number]>>>;
// Implementation
export function pickFromObject<T extends object>(
    obj: T,
    keys: readonly (string | keyof T)[],
    _mode?: 'strict' | 'loose'
) {
    const result: Partial<T> = {};

    for (const key of keys) {
        if (objectHasKey(obj, key)) {
            result[key] = obj[key];
        }
    }

    return result;
}

/**
 * Utility to omit specific keys from an object.
 *
 * Mode:
 * - If the mode is 'strict' (default), the keys must be a subset of the object keys.
 * - If the mode is 'loose', the keys can be a subset of the object keys.
 *
 * @example
 * ```ts
 * const obj = { a: 1, b: 2, c: 3 };
 * const picked = pickFromObject(obj, ['a', 'b'], 'strict');
 * // picked: { a: 1, b: 2 }
 *
 * const obj = { a: 1, b: 2, c: 3 };
 * const picked = pickFromObject(obj, ['a', 'd'], 'loose');
 * // picked: { a: 1 }
 * ```
 *
 * @param obj - The object to pick from.
 * @param keys - The keys to pick.
 * @param mode - The mode to pick the keys: 'strict' (default) or 'loose'.
 */
// Overload for keyof T keys (default mode)
export function omitFromObject<T extends object, const K extends readonly (keyof T)[]>(
    obj: T,
    keys: K
): Prettify<Omit<T, K[number]>>;
// Overload for keyof T keys
export function omitFromObject<T extends object, const K extends readonly (keyof T)[]>(
    obj: T,
    keys: K,
    mode: 'strict'
): Prettify<Omit<T, K[number]>>;
// Overload for string keys
export function omitFromObject<T extends object, const K extends readonly string[]>(
    obj: T,
    keys: K,
    mode: 'loose'
): Prettify<Omit<T, Extract<keyof T, K[number]>>>;
// Implementation
export function omitFromObject<T extends object>(
    obj: T,
    keys: readonly (string | keyof T)[],
    _mode?: 'strict' | 'loose'
) {
    const result: Partial<T> = {};

    for (const key of keys) {
        if (objectHasKey(obj, key) && !keys.includes(key)) {
            result[key] = obj[key];
        }
    }

    return result;
}
