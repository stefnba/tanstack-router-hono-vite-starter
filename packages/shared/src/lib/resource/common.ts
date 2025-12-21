import { Table, getTableColumns } from 'drizzle-orm';
import z from 'zod';

import { typedKeys } from '@app/shared/lib/utils';

/**
 * Type for the pagination input schema.
 */
export const paginationSchema = z.object({
    page: z.union([z.string(), z.number()]).pipe(z.coerce.number()).default(1),
    pageSize: z.union([z.string(), z.number()]).pipe(z.coerce.number()).default(10),
});

export type PaginationOutput = z.output<typeof paginationSchema>;
export type PaginationInput = z.input<typeof paginationSchema>;
/**
 * Type for the ordering input schema.
 * @param T - The table to get the ordering schema for.
 */
export const orderingSchema = <T extends Table>(table: T) => {
    const cols = typedKeys(getTableColumns(table)) as Array<keyof T['_']['columns'] & string>;

    return z.array(
        z
            .union([
                z.object({
                    field: z.enum(cols),
                    direction: z.enum(['asc', 'desc']).optional(),
                }),
                z.enum(cols),
            ])
            .optional()
    );
};

/**
 * Type for the ordering input schema.
 * @param T - The table to get the ordering schema for. If undefined, the ordering schema for any table is returned.
 */
export type OrderingInput<T extends Table | undefined = undefined> = T extends Table
    ? z.infer<ReturnType<typeof orderingSchema<T>>>
    : z.infer<ReturnType<typeof orderingSchema>>;

/**
 * Type for the ordering output schema without a table.
 */
export type OrderingOutputWithoutTable = z.output<ReturnType<typeof orderingSchema>>;
/**
 * Type for the ordering output schema with a table.
 * @param T - The table to get the ordering output schema for.
 */
export type OrderingOutputWithTable<T extends Table> = z.output<
    ReturnType<typeof orderingSchema<T>>
>;
