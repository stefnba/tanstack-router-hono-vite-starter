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
