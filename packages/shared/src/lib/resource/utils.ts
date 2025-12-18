import { Table } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

import { RawTableShapes } from '@app/shared/lib/resource/types';
import type { AnyZodShape, AnyZodType } from '@app/shared/lib/validation/zod/types';

/**
 * Gets the raw create, select, and update schemas for a given table.
 */
export const getTableShapes = <T extends Table>(table: T): RawTableShapes<T> => {
    const create = createInsertSchema(table);
    const select = createSelectSchema(table);
    const update = createUpdateSchema(table);

    return {
        create: create.shape,
        select: select.shape,
        update: update.shape,
    };
};

/**
 * Conditionally adds a single schema with a key to the result if the provided shape is not empty.
 *
 * Used to build input schemas for operations like getMany (filters, pagination, ordering, etc.).
 */
export function conditionalZodField<
    TShapeToCheck extends AnyZodShape,
    TKey extends string,
    TReturnSchema extends AnyZodType,
>(params: { shapeToCheck: TShapeToCheck; key: TKey; returnSchema: TReturnSchema }) {
    const hasKeys = Object.keys(params.shapeToCheck).length > 0;

    const result = hasKeys ? { [params.key]: params.returnSchema } : {};

    // We always return `{}` or `{ [key]: schema }` at runtime.
    // The generic conditional type chooses between these two shapes
    // based solely on `keyof TShapeToCheck`.
    //
    // TypeScript cannot relate the runtime `hasKeys` check to `keyof TShapeToCheck`,
    // so we assert that the static type of `shapeToCheck` matches its runtime shape.
    return result as [keyof TShapeToCheck] extends [never]
        ? Record<never, never>
        : { [K in TKey]: TReturnSchema };
}
