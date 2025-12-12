/**
 * Standard function signature for all database query functions.
 * All query functions must be async and return a Promise.
 *
 * The bivariance hack is required here to allow functions with specific input types
 * to be assignable to the generic `QueryFn` constraint (which defaults to `any`).
 * Without this, `(args: { id: string }) => ...` is not assignable to `(args: any) => ...`
 * in strict mode due to parameter contravariance.
 *
 * @template Input - The input parameter type (defaults to any for constraint compatibility)
 * @template Output - The return type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryFn<Input = any, Output = unknown> = {
    bivarianceHack(args: Input): Promise<Output>;
}['bivarianceHack'];
