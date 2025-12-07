/**
 * Prettify a type for better readability. Forces TypeScript to expand object types
 */
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
