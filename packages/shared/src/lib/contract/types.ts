import { ValidationTargets } from 'hono';

import { AnyZodType } from '@shared/lib/validation/zod/types';

/**
 * Endpoint schema object supporting Hono validation targets
 * Each target is optional to allow flexible endpoint definitions
 */
export type TEndpointSchemaObject = Partial<Record<keyof ValidationTargets, AnyZodType>>;

/**
 * Object with schemas for query, service, and endpoint layers.
 * The endpoint layer supports Hono validation targets (json, query, param, etc.)
 */
export type TFeatureSchemaObject = {
    query?: AnyZodType;
    service?: AnyZodType | Record<string, AnyZodType>;
    endpoint?: TEndpointSchemaObject;
    form?: AnyZodType;
};
