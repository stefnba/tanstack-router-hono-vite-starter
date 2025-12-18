/**
 * Empty object type used as the initial state in repository builders.
 * Using `{}` (not `Record<string, never>`) is intentional because:
 * - `Record<string, never>` creates index signatures that make `keyof` resolve to `string`
 * - `{}` has no index signature, allowing TypeScript to infer actual property keys from intersections
 * - When intersected: `{} & { create: Fn } & { getById: Fn }` → `{ create: Fn, getById: Fn }`
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EmptyRepositoryOperations = {};
