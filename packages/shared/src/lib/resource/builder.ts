import { Table } from 'drizzle-orm';
import z from 'zod';

import { SYSTEM_TABLE_CONFIG_KEYS } from '@app/shared/lib/db/system-fields';
import { paginationSchema } from '@app/shared/lib/resource/common';
import {
    DrizzleResourceBuilderReturn,
    ResourceBuilderConfig,
} from '@app/shared/lib/resource/types';
import { conditionalZodField, getTableShapes } from '@app/shared/lib/resource/utils';
import { omitFromObject, pickFromObject } from '@app/shared/lib/utils';

import {
    AnyZodArray,
    AnyZodShape,
    AnyZodType,
    EmptyZodSchema,
} from '../../lib/validation/zod/types';

export const SCHEMA_KEYS = {
    input: 'input',
    identifiers: 'ids',
    data: 'data',
    pagination: 'pagination',
    filters: 'filters',
    ordering: 'ordering',
} as const;

class DrizzleResourceBuilder<T extends Table, C extends ResourceBuilderConfig<T>> {
    config: {
        base: C['base'];
        table: C['table'];
        raw: C['raw'];
        userId: C['userId'];
        id: C['id'];
        updateData: C['updateData'];
        createData: C['createData'];
        returnCols: C['returnCols'];
        filters: C['filters'];
        pagination: C['pagination'];
        ordering: C['ordering'];
    };

    constructor(config: C) {
        this.config = config;
    }

    /**
     * Creates a new resource builder for a given table.
     *
     * This is the entry point for defining a resource. It initializes the builder with the table's raw schemas
     * and sets up default configurations for base, update, create, and return fields.
     */
    static create<T extends Table>(table: T) {
        const raw = getTableShapes(table);

        const base = omitFromObject(raw.create, SYSTEM_TABLE_CONFIG_KEYS, 'loose');
        const updateData = omitFromObject(raw.update, SYSTEM_TABLE_CONFIG_KEYS, 'loose');

        return new DrizzleResourceBuilder<
            T,
            {
                base: typeof base;
                table: typeof table;
                raw: typeof raw;
                userId: EmptyZodSchema;
                id: EmptyZodSchema;
                updateData: typeof updateData;
                createData: typeof base;
                returnCols: typeof raw.select;
                filters: EmptyZodSchema;
                pagination: EmptyZodSchema;
                ordering: AnyZodArray;
            }
        >({
            raw,
            base,
            table,
            userId: {},
            id: {},
            updateData: updateData,
            createData: base,
            returnCols: raw.select,
            filters: {},
            pagination: z.object({}),
            ordering: z.array(z.never()),
        });
    }

    // ========================================
    // Set Identifiers
    // ========================================

    /**
     * Define which field contains the user ID for row-level security (RLS).
     *
     * This field will be automatically used to filter queries so users only
     * see/modify their own data.
     */
    setUserId<const F extends keyof C['raw']['select'] & string>(field: F) {
        const selectSchema = this.config.raw.select;
        const userIdSchema = pickFromObject(selectSchema, [field]);

        if (!userIdSchema) {
            throw new Error(`Field ${String(field)} is not a valid user ID field`);
        }

        const newConfig = {
            ...this.config,
            userId: userIdSchema,
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    /**
     * Define which field(s) are used as primary keys.
     *
     * Used for operations like getById, deleteById, etc.
     * Supports composite keys by passing multiple fields.
     */
    setIds<const F extends keyof C['raw']['select'] & string>(fields: F[]) {
        const idsSchema = pickFromObject(this.config.raw.select, fields);

        const newConfig = {
            ...this.config,
            id: idsSchema,
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    // ========================================
    // Restrict / pick
    // ========================================

    /**
     * Restricts the fields that are allowed in the base schema. Only the specified fields are allowed.
     *
     * This only affects the base schema, not the create or update schemas.
     */
    restrictBaseSchema<
        const F extends keyof C['raw']['create'] & keyof C['raw']['update'] & string,
    >(fields: F[]) {
        const shape = this.config.raw.create;
        const schema = pickFromObject(shape, fields);

        const newConfig = {
            ...this.config,
            base: schema,
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    /**
     * Restricts the fields that are allowed in the base, create, and update schemas.  Only the specified fields are allowed.
     *
     * This affects also the create and update schemas, not just the base schema.
     */
    restrictAllFields<const F extends keyof C['base'] & string>(fields: F[]) {
        const newConfig = {
            ...this.config,
            base: pickFromObject(this.config.base, fields),
            updateData: pickFromObject(this.config.updateData, fields),
            createData: pickFromObject(this.config.createData, fields),
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    /**
     * Restricts the fields that are allowed for update operations.
     *
     * Use this when update fields differ from create fields.
     * For same fields in both, use `.restrictUpsertDataFields()` instead.
     */
    restrictUpdateDataFields<const F extends keyof C['base'] & string>(fields: F[]) {
        const shape = this.config.raw.update;
        const schema = pickFromObject(shape, fields);

        const newConfig = {
            ...this.config,
            updateData: schema,
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    /**
     * Restricts the fields that are allowed for create operations.
     *
     * Use this when insert fields differ from update fields.
     * For same fields in both, use `.restrictUpsertDataFields()` instead.
     */
    restrictCreateDataFields<const F extends keyof C['base'] & string>(fields: F[]) {
        const shape = this.config.raw.create;
        const schema = pickFromObject(shape, fields);

        const newConfig = {
            ...this.config,
            createData: schema,
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    /**
     * Restricts the fields that are allowed for both create and update operations.
     *
     * If update and create fields are different, use `.restrictUpdateDataFields()` and `.restrictCreateDataFields()` instead.
     */
    restrictUpsertDataFields<const F extends keyof C['base'] & string>(fields: F[]) {
        const newConfig = {
            ...this.config,
            updateData: pickFromObject(this.config.updateData, fields),
            createData: pickFromObject(this.config.createData, fields),
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    /**
     * Restricts the fields that are allowed to be returned from the database.
     */
    restrictReturnColsFields<const F extends keyof C['raw']['select'] & string>(fields: F[]) {
        const shape = this.config.raw.select;
        const schema = pickFromObject(shape, fields);

        const newConfig = {
            ...this.config,
            returnCols: schema,
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    /**
     * Allows all system fields to be included in the base, update, and create data.
     *
     * Resets any field restrictions set via `.restrictUpsertDataFields()`, `.restrictCreateDataFields()`,
     * or `.restrictUpdateDataFields()`.
     *
     * **Warning:** This overwrites previously specified create/update schemas.
     */
    allowSystemFields() {
        const raw = getTableShapes(this.config.table);

        const newConfig = {
            ...this.config,
            base: raw.create,
            updateData: raw.update,
            createData: raw.create,
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    // ========================================
    // Transform
    // ========================================

    /**
     * Transform the current base, createData, and updateData schemas using a custom transformation function.
     * This allows you to extend, modify, or completely reshape the schema.
     *
     * **Note:** This overwrites previously specified base, createData, and updateData schemas.
     *
     * @param transformer - Function that takes the current base schema and returns a new schema
     * @returns New builder instance with the transformed schema
     *
     * @example
     * ```typescript
     * const builder = createFeatureTableConfig(userTable)
     *   .transform(schema =>
     *     schema.extend({
     *       fullName: z.string().min(1),
     *     })
     *   )
     *   .done();
     * ```
     */
    transform<TOut extends AnyZodShape>(
        transformer: (schema: z.ZodObject<C['base']>) => z.ZodObject<TOut>
    ) {
        const transformed = transformer(z.object(this.config.base));
        const transformedPartial = transformed.partial();

        const newConfig = {
            ...this.config,
            base: transformed.shape,
            createData: transformed.shape,
            updateData: transformedPartial.shape,
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    // ========================================
    // GetMany
    // ========================================

    enablePagination() {
        const shape = paginationSchema.shape;

        const newConfig = {
            ...this.config,
            pagination: shape,
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    enableOrdering<const Col extends keyof C['raw']['select'] & string>(columns: Col[]) {
        const shape = z.array(
            z.object({
                field: z.enum(columns),
                direction: z.enum(['asc', 'desc']),
            })
        );

        const newConfig = {
            ...this.config,
            ordering: shape,
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    enableFilters<
        S extends Partial<Record<keyof C['raw']['select'], AnyZodType>> &
            Record<string, AnyZodType>,
    >(schema: S) {
        const shape = z.object(schema).shape;
        const newConfig = {
            ...this.config,
            filters: shape,
        };

        return new DrizzleResourceBuilder<T, typeof newConfig>(newConfig);
    }

    // ========================================
    // Done
    // ========================================

    done() {
        // identifier schemas
        // const identifiers = z.object(this.config.id);
        // const userId = z.object(this.config.userId);

        // const fullIdentifiers = z.object({
        //     ...identifiers.shape,
        //     ...userId.shape,
        // });

        // data for create and update operations
        const createData = z.object(this.config.createData);
        const updateData = z.object(this.config.updateData);

        // getMany filters
        const ordering = this.config.ordering;
        const filters = z.object(this.config.filters).partial();
        const pagination = z.object(this.config.pagination);

        // identifiers
        const allIdentifiersShapes = { ...this.config.userId, ...this.config.id };
        const allIdentifiersSchema = z.object(allIdentifiersShapes);

        const userOnlyIdentifierSchema = z.object(this.config.userId);
        const otherIdsIdentifierSchema = z.object(this.config.id);

        const allIdentifiersForInput = conditionalZodField({
            shapeToCheck: allIdentifiersShapes,
            key: SCHEMA_KEYS.identifiers,
            returnSchema: allIdentifiersSchema,
        });

        const userIdIdentifierForInput = conditionalZodField({
            shapeToCheck: this.config.userId,
            key: SCHEMA_KEYS.identifiers,
            returnSchema: userOnlyIdentifierSchema,
        });

        return {
            table: this.config.table,
            base: z.object(this.config.base),
            rawTable: {
                create: z.object(this.config.raw.create),
                select: z.object(this.config.raw.select),
                update: z.object(this.config.raw.update),
            },
            returnCols: z.object(this.config.returnCols),
            operation: {
                // create
                create: {
                    [SCHEMA_KEYS.input]: z.object({
                        [SCHEMA_KEYS.data]: createData,
                        ...userIdIdentifierForInput,
                    }),
                    [SCHEMA_KEYS.data]: createData,
                },
                createMany: {
                    [SCHEMA_KEYS.input]: z.object({
                        [SCHEMA_KEYS.data]: z.array(createData),
                    }),
                    [SCHEMA_KEYS.data]: z.array(createData),
                },
                // update
                updateById: {
                    [SCHEMA_KEYS.input]: z.object({
                        [SCHEMA_KEYS.data]: updateData,
                        ...allIdentifiersForInput,
                    }),
                    [SCHEMA_KEYS.data]: updateData,
                    [SCHEMA_KEYS.identifiers]: allIdentifiersSchema,
                },
                // get
                getMany: {
                    [SCHEMA_KEYS.input]: z.object({
                        ...userIdIdentifierForInput,
                        ...conditionalZodField({
                            shapeToCheck: this.config.pagination,
                            key: SCHEMA_KEYS.pagination,
                            returnSchema: pagination.optional(),
                        }),
                        ...conditionalZodField({
                            shapeToCheck: this.config.filters,
                            key: SCHEMA_KEYS.filters,
                            returnSchema: filters.optional(),
                        }),
                        // [SCHEMA_KEYS.ordering]: ordering.optional(),
                    }),
                    [SCHEMA_KEYS.identifiers]: userOnlyIdentifierSchema,
                    [SCHEMA_KEYS.pagination]: pagination,
                    [SCHEMA_KEYS.filters]: filters,
                    [SCHEMA_KEYS.ordering]: ordering,
                },
                getById: {
                    [SCHEMA_KEYS.input]: z.object({ ...allIdentifiersForInput }),
                    [SCHEMA_KEYS.identifiers]: z.object({
                        ...this.config.id,
                        ...this.config.userId,
                    }),
                },
                // remove
                removeById: {
                    [SCHEMA_KEYS.input]: z.object({ ...allIdentifiersForInput }),
                    [SCHEMA_KEYS.identifiers]: allIdentifiersSchema,
                },
            },
            identifier: {
                userId: userOnlyIdentifierSchema,
                otherIds: otherIdsIdentifierSchema,
            },
        } as const satisfies DrizzleResourceBuilderReturn;
    }
}

/**
 * Defines a resource from a Drizzle table.
 *
 * This builder allows you to:
 * - Define user identifiers (e.g., `userId`).
 * - Define primary keys.
 * - Restrict or pick fields for base, create, and update operations.
 * - Enable filtering, pagination, and ordering capabilities.
 *
 * @example
 * ```ts
 * const postResource = defineResource(postTable)
 *     .setUserId('authorId')
 *     .setIds(['id'])
 *     .enableFilters({
 *         status: z.string(),
 *         createdAt: z.date(),
 *     })
 *     .done();
 * ```
 */
export const defineResource = DrizzleResourceBuilder.create;
