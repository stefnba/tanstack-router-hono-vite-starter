import { z } from 'zod';

/**
 * Type constraint for all Zod types. This is using zod core since z.ZodType is not working.
 * @see https://zod.dev/library-authors#how-to-accept-user-defined-schemas
 */
export type AnyZodType = z.core.$ZodType;

/**
 * Type constraint for all Zod objects
 */
export type AnyZodObject = z.ZodObject;

/**
 * Type constraint for all Zod core objects.
 * This has fewer methods than z.ZodObject.
 */
export type AnyZodCoreObject = z.core.$ZodObject;

/**
 * Type constraint for all Zod shapes used in the layer system. This is more flexible than directly using z.ZodObject.
 */
export type AnyZodShape = z.ZodRawShape;

/**
 * Type constraint for all Zod arrays.
 */
export type AnyZodArray = z.ZodArray;

/**
 * Sentinel value representing an empty Zod schema.
 *
 * **Why use this instead of `undefined`?**
 * Using `Record<never, never>` enables zero-assertion type safety by ensuring
 * `keyof TEmptySchema` evaluates to `never`. This allows type guards and conditional
 * types to work correctly without runtime type assertions.
 */
export type EmptyZodSchema = Readonly<Record<never, never>>;

/**
 * Type constraint for an empty Zod object.
 */
export type EmptyZodObject = z.ZodObject<EmptyZodSchema>;

/**
 * Type predicate to check if a type is an empty Zod shape.
 */
export type IsEmptyZodShape<T extends AnyZodShape> = keyof T extends never ? true : false;
