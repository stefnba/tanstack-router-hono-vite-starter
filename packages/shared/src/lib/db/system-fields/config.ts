import { createId } from '@paralleldrive/cuid2';
import { boolean, text, timestamp } from 'drizzle-orm/pg-core';

import { user } from '@app/shared/features/auth/table';
import { typedKeys } from '@app/shared/lib/utils';

/**
 * System-managed fields included in tables.
 *
 * - id: The primary key of the table
 * - userId: The user id of the table
 * - isActive: The active status of the table (soft delete)
 * - createdAt: The creation timestamp of the table
 * - updatedAt: The last update timestamp of the table
 *
 */
export const SYSTEM_TABLE_CONFIG = {
    id: text()
        .primaryKey()
        .notNull()
        .$defaultFn(() => createId()),
    // use references to user table
    userId: text()
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull()
        .$onUpdate(() => new Date()),
} as const;

export const SYSTEM_TABLE_CONFIG_KEYS = typedKeys(SYSTEM_TABLE_CONFIG);
export type SystemTableConfigKeys = (typeof SYSTEM_TABLE_CONFIG_KEYS)[number];
