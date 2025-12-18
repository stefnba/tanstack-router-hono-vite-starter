import { ValidationTargets } from 'hono';
import { z } from 'zod';

import { AnyZodType } from '../../lib/validation/zod/types';

/**
 * Endpoint schema object supporting Hono validation targets
 * Each target is optional to allow flexible endpoint definitions
 */
export type TEndpointSchemaObject = Partial<Record<keyof ValidationTargets, AnyZodType>>;

/**
 * Defines the schemas for a single operation across all architectural layers.
 *
 * This type acts as the central contract for an operation, specifying:
 * - `query`: The input schema for the Data Access Layer (Repository).
 * - `service`: The input schema for the Business Logic Layer (Service).
 * - `endpoint`: The validation schemas for the Transport Layer (HTTP/Hono).
 * - `form`: Optional schema for form handling (if different from endpoint).
 */
export type ContractOperationSchemas = {
    query?: AnyZodType;
    service?: AnyZodType | Record<string, AnyZodType>;
    endpoint?: TEndpointSchemaObject;
    form?: AnyZodType;
};

export type AnyContract = Record<string, ContractOperationSchemas>;

/**
 * Infers the input type from a contract schema for a specific layer.
 *
 * @template C - The contract type
 * @template K - The key of the operation
 * @template Layer - The layer to infer from (query, service, endpoint, etc.)
 */
export type InferContractInput<
    C extends AnyContract,
    K extends keyof C | string,
    Layer extends keyof ContractOperationSchemas,
> = K extends keyof C ? (C[K][Layer] extends AnyZodType ? z.infer<C[K][Layer]> : unknown) : unknown;

/**
 * Empty object type used as the initial state in contract builders.
 * Using `{}` (not `Record<string, never>`) is intentional because:
 * - `Record<string, never>` creates index signatures that make `keyof` resolve to `string`
 * - `{}` has no index signature, allowing TypeScript to infer actual property keys from intersections
 * - When intersected: `{} & { create: Fn } & { getById: Fn }` → `{ create: Fn, getById: Fn }`
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type EmptyContract = {};
