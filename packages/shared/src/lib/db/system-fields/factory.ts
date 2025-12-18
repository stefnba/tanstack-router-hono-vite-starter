import { SYSTEM_TABLE_CONFIG } from '@app/shared/lib/db/system-fields/config';
import { pickFromObject, typedKeys } from '@app/shared/lib/utils';
import { Prettify } from '@app/shared/types/utils';

/**
 * Factory function to generate system-managed fields for tables.
 *
 * These fields are:
 * - `id`: The primary key of the table
 * - `userId`: The user id of the table
 * - `isActive`: The active status of the table (soft delete)
 * - `createdAt`: The creation timestamp of the table
 * - `updatedAt`: The last update timestamp of the table
 *
 *  **Important:** These fields are typically system-managed and should NOT be included in
 * `allowedUpsertColumns` for create/update operations.
 *
 * @param fields - The fields to include in the system-managed fields. If empty, all fields will be included.
 *
 *  @example
 * ```typescript
 * const tag = pgTable('tag', {
 *     ...createSystemTableFields(),
 *     name: text().notNull(),
 * });
 * ```
 */
export const createSystemTableFields = <
    const T extends keyof typeof SYSTEM_TABLE_CONFIG = keyof typeof SYSTEM_TABLE_CONFIG,
>(
    fields?: readonly T[]
): Prettify<Pick<typeof SYSTEM_TABLE_CONFIG, T>> => {
    return pickFromObject(SYSTEM_TABLE_CONFIG, fields ?? typedKeys(SYSTEM_TABLE_CONFIG), 'strict');
};
