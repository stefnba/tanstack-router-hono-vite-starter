/**
 * Standard function signature for all service functions.
 * All service functions must be async and return a Promise.
 * Uses contravariance hack (input: any) to allow specific service functions to be assignable
 * to the generic constraint Record<string, ServiceFn>.
 *
 * @template Input - The input parameter type
 * @template Output - The return type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ServiceFn<Input = any, Output = unknown> = {
    bivarianceHack(args: Input): Promise<Output>;
}['bivarianceHack'];

/**
 * Empty object type used as the initial state in service builders.
 * Using `{}` (not `Record<string, never>`) is intentional because:
 * - `Record<string, never>` creates index signatures that make `keyof` resolve to `string`
 * - `{}` has no index signature, allowing TypeScript to infer actual property keys from intersections
 * - When intersected: `{} & { create: Fn } & { getById: Fn }` → `{ create: Fn, getById: Fn }`
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EmptyServices = {};
