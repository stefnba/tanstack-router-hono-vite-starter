import { Table, getTableColumns } from 'drizzle-orm';
import z from 'zod';

import { typedKeys } from '../../lib/utils';

/**
 * Type for the pagination input schema.
 */
export const paginationSchema = z.object({
    page: z.union([z.string(), z.number()]).pipe(z.coerce.number()).default(1),
    pageSize: z.union([z.string(), z.number()]).pipe(z.coerce.number()).default(10),
});

/**
 * Type for the ordering input schema.
 * @param T - The table to get the ordering schema for.
 */
export const orderingSchema = <T extends Table>(table: T) => {
    const cols = typedKeys(getTableColumns(table)) as Array<keyof T['_']['columns'] & string>;

    return z.array(
        z
            .union([
                z
                    .object({
                        field: z.enum(cols),
                        direction: z.enum(['asc', 'desc']),
                    })
                    .partial(),
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
