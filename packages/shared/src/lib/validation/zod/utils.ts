import z, { util } from 'zod';

import { typedFromEntries } from '@app/shared/lib/utils';
import { AnyZodShape } from '@app/shared/lib/validation/zod/types';
import { Prettify } from '@app/shared/types/utils';

/**
 * Utility to pick specific fields from a Zod object schema.
 *
 * This is a type-safe wrapper around Zod's .pick() method that ensures
 * proper inference of the picked fields.
 *
 * @param schema - The source ZodObject to pick fields from
 * @param fields - Array of field names to include in the result
 *
 * @example
 * ```ts
 * const fullSchema = z.object({
 *   id: z.string(),
 *   name: z.string(),
 *   email: z.string(),
 *   password: z.string(),
 * });
 *
 * const publicSchema = pickFields(fullSchema, ['id', 'name', 'email']);
 * // Result: ZodObject<{ id: string; name: string; email: string }>
 * ```
 */
export function pickFields<TSchema extends AnyZodShape, TKeys extends Array<keyof TSchema>>(
    schema: z.ZodObject<TSchema>,
    fields: TKeys
): z.ZodObject<
    util.Flatten<Pick<TSchema, Extract<keyof TSchema, keyof { [K in TKeys[number]]: true }>>>,
    z.core.$strip
> {
    const mask: util.Mask<keyof TSchema> = typedFromEntries(fields.map((field) => [field, true]));
    return schema.pick(mask);
}

/**
 * Utility to omit specific fields from a Zod object schema.
 *
 * This is a type-safe wrapper around Zod's .omit() method that ensures
 * proper inference of the remaining fields.
 *
 * @param schema - The source ZodObject to omit fields from
 * @param fields - Array of field names to exclude from the result
 *
 * @example
 * ```ts
 * const fullSchema = z.object({
 *   id: z.string(),
 *   name: z.string(),
 *   email: z.string(),
 *   password: z.string(),
 * });
 *
 * const publicSchema = omitFields(fullSchema, ['password']);
 * // Result: ZodObject<{ id: string; name: string; email: string }>
 * ```
 */
export function omitFields<TSchema extends AnyZodShape, TKeys extends Array<keyof TSchema>>(
    schema: z.ZodObject<TSchema>,
    fields: TKeys
): z.ZodObject<Prettify<Omit<TSchema, Extract<keyof TSchema, TKeys[number]>>>, z.core.$strip> {
    const mask: { [K in TKeys[number]]: true } = typedFromEntries(
        fields.map((field) => [field, true])
    );
    return schema.omit(mask);
}
