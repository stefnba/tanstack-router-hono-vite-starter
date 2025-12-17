/**
 * Prettify a type for better readability. Forces TypeScript to expand object types
 */
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

/**
 * Type guard: checks if `key` is actually a key of `obj`.
 *
 * - At runtime: just `key in obj`
 * - At type level: narrows `key` to `keyof T`
 */
export const objectHasKey = <T extends object>(obj: T, key: PropertyKey): key is keyof T => {
    return key in obj;
};

/**
 * Extracts only required keys (non-optional) from a type
 */
export type ExtractRequiredKeys<T> = {
    [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

/**
 * Removes string index signatures from a type and prettifies the result.
 * Useful for builder pattern return types where we want to remove constraints like `Record<string, never>`
 * and return a clean object type with only the specific keys.
 */
export type StripIndexSignature<T> = Prettify<{
    [K in keyof T as string extends K ? never : K]: T[K];
}>;
