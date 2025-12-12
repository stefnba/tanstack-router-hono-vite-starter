export type TQueryKey = readonly unknown[];

export type TQueryKeyString = string | TQueryKey;

/**
 * Generic constraint for Hono endpoints.
 * Uses `any` for args to allow compatibility with all endpoint signatures (contravariance).
 * Type safety is preserved by `InferRequestType` at usage sites.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyEndpoint = (args?: any) => Promise<Response>;
