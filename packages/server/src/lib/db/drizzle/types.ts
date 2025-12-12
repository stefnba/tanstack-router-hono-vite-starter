import { GetColumnData, Table } from 'drizzle-orm';
import { BuildSchema } from 'drizzle-zod';
import z from 'zod';

import { Prettify } from '@shared/types/utils';

/**
 * Get the full column definitions of a drizzle table
 * @param T - The table to get the column definitions from
 * @example
 * ```typescript
 * type T = GetTableColumnDefinitions<typeof tag>;
* {
    name: PgColumn<{
        name: "name";
        tableName: "tag";
        dataType: "string";
        columnType: "PgText";
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
    }, {}, {}>;
    ... 6 more ...;
    updatedAt: PgColumn<...>;
}
 * ```
 */
export type GetTableColumnDefinitions<T extends Table> = T['_']['columns'];

/**
 * Get the keys of the columns of a drizzle table
 * @param T - The table to get the column keys from
 * @example
 * ```typescript
 * type T = GetTableColumnKeys<typeof tag>;
 * // 'id' | 'name' | 'description' | 'createdAt' | 'updatedAt'
 * ```
 */
export type GetTableColumnKeys<T extends Table> = keyof GetTableColumnDefinitions<T>;

/**
 * Get the keys of columns that can be inserted in a drizzle table
 *
 * This differs from GetTableColumnKeys for columns with defaults or auto-generation:
 * - GetTableColumnKeys returns all columns (for SELECT)
 * - GetTableInsertKeys returns insertable columns (for INSERT)
 *
 * @param T - The table to get the insert column keys from
 * @example
 * ```typescript
 * type T = GetTableInsertKeys<typeof tag>;
 * // 'name' | 'email' | 'description' | ...
 * // May exclude auto-generated columns like 'id', 'createdAt'
 * ```
 */
export type GetTableInsertKeys<T extends Table> = keyof T['$inferInsert'];

/**
 * Infer the types of the columns of a drizzle table
 * @param T - The table to infer the column types from
 * @param M - The mode to infer the column types in ('query' | 'raw')
 * @example
 * ```typescript
 * type T = InferTableColumnTypes<typeof tag>;
 * // {
 * //   id: string;
 * //   name: string;
 * //   description: string | null;
 * //   createdAt: Date;
 * //   updatedAt: Date;
 * // }
 * ```
 */
export type InferTableColumnTypes<T extends Table, M extends 'query' | 'raw' = 'query'> = {
    [K in GetTableColumnKeys<T>]: GetColumnData<GetTableColumnDefinitions<T>[K], M>;
};

/**
 * Infer the type of a column of a drizzle table
 * @param T - The table to infer the column type from
 * @param C - The column to infer the type from
 * @param M - The mode to infer the column type in ('query' | 'raw')
 * @example
 * ```typescript
 * type T = InferTableColumnType<typeof tag, 'createdAt'>;
 * // Date
 * ```
 */
export type InferTableColumnType<
    T extends Table,
    C extends GetTableColumnKeys<T>,
    M extends 'query' | 'raw' = 'query',
> = InferTableColumnTypes<T, M>[C];

/**
 * Infer the type of a column of a drizzle table as an object
 * @param T - The table to infer the column type from
 * @param C - The column to infer the type from
 * @param M - The mode to infer the column type in ('query' | 'raw')
 * @example
 * ```typescript
 * type T = InferTableColumnTypeAsObject<typeof tag, 'userId'>;
 * // {
 * //   userId: string;
 * // }
 * ```
 */
export type InferTableColumnTypeAsObject<
    T extends Table,
    C extends GetTableColumnKeys<T>,
    M extends 'query' | 'raw' = 'query',
> = {
    [K in C]: InferTableColumnType<T, K, M>;
};

/**
 * Infer the Zod schema shape for a Drizzle table operation.
 *
 * Extracts the appropriate schema type (insert/select/update) from a Drizzle table
 * definition. Uses Drizzle's BuildSchema utility to generate the correct Zod shape.
 *
 * **Operation Types:**
 * - `insert`: Schema for creating new records (required fields, no defaults)
 * - `select`: Schema for reading records (all fields, as stored in DB)
 * - `update`: Schema for updating records (all fields partial/optional)
 *
 * @template TTable - Drizzle table type
 * @template TType - Operation type (insert/select/update)
 *
 * @example
 * ```ts
 * type InsertSchema = InferTableSchema<typeof userTable, 'insert'>;
 * // Result: { name: z.ZodString, email: z.ZodString, ... }
 *
 * type SelectSchema = InferTableSchema<typeof userTable, 'select'>;
 * // Result: { id: z.ZodString, name: z.ZodString, createdAt: z.ZodDate, ... }
 * ```
 */
export type InferTableSchema<
    TTable extends Table,
    TType extends 'insert' | 'select' | 'update' = 'insert',
> = Prettify<BuildSchema<TType, TTable['_']['columns'], undefined, undefined>>;

/**
 * Infers the raw TypeScript shape for a Drizzle table operation (insert, select, or update).
 *
 * Given a Drizzle table type, extracts the plain TypeScript object type (not a Zod schema)
 * for a specific operation type. This enables strongly typed values for database
 * create, update, and select operations, directly linked to table schema definitions.
 *
 * @typeParam TTable - A Drizzle Table type (e.g., typeof userTable)
 * @typeParam TOperation - The kind of DB operation: 'insert', 'select', or 'update'
 *
 * @example
 * type InsertType = InferTableTypes<typeof userTable, 'insert'>;
 * //    ^? { name: string; email: string; ... }
 *
 * type UpdateType = InferTableTypes<typeof userTable, 'update'>;
 * //    ^? { name?: string; email?: string; ... }
 *
 * // For quick access to default 'insert' type:
 * type InsertTypeDefault = InferTableTypes<typeof userTable>;
 */
export type InferTableTypes<
    TTable extends Table,
    TOperation extends 'insert' | 'select' | 'update' = 'insert',
> = z.infer<InferTableSchema<TTable, TOperation>>;
