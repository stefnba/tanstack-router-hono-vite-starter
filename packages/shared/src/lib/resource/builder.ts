import { Table } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import z from 'zod';

import { SYSTEM_TABLE_CONFIG_KEYS } from '@shared/lib/db/system-fields';
import { paginationSchema } from '@shared/lib/resource/common';
import {
    DrizzleResourceBuilderReturn,
    RawTableShapes,
    ResourceBuilderConfig,
} from '@shared/lib/resource/types';
import { omitFromObject, pickFromObject } from '@shared/lib/utils';
import { AnyZodArray, AnyZodType, EmptyZodSchema } from '@shared/lib/validation/zod/types';

export const SCHEMA_KEYS = {
    input: 'input',
    identifiers: 'ids',
    data: 'data',
    pagination: 'pagination',
    filters: 'filters',
    ordering: 'ordering',
} as const;

class DrizzleResourceBuilder<T extends Table, C extends ResourceBuilderConfig<T>> {
    config: C;

    constructor(config: C) {
        this.config = config;
    }

    static create<T extends Table>(table: T) {
        const raw = this.getTableShapes(table);

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

    static getTableShapes<T extends Table>(table: T): RawTableShapes<T> {
        const create = createInsertSchema(table);
        const select = createSelectSchema(table);
        const update = createUpdateSchema(table);

        return {
            create: create.shape,
            select: select.shape,
            update: update.shape,
        };
    }

    setUserId<const F extends keyof C['raw']['select'] & string>(field: F) {
        const selectSchema = this.config.raw.select;
        const userIdSchema = pickFromObject(selectSchema, [field]);

        if (!userIdSchema) {
            throw new Error(`Field ${String(field)} is not a valid user ID field`);
        }

        return new DrizzleResourceBuilder<T, Omit<C, 'userId'> & { userId: typeof userIdSchema }>({
            ...this.config,
            userId: userIdSchema,
        });
    }

    setIds<const F extends keyof C['raw']['select'] & string>(fields: F[]) {
        const selectSchema = this.config.raw.select;
        const idsSchema = pickFromObject(selectSchema, fields);

        return new DrizzleResourceBuilder<T, Omit<C, 'id'> & { id: typeof idsSchema }>({
            ...this.config,
            id: idsSchema,
        });
    }

    pickBaseSchema<const F extends keyof C['raw']['create'] & string>(fields: F[]) {
        const shape = this.config.raw.create;
        const schema = pickFromObject(shape, fields);

        return new DrizzleResourceBuilder<T, Omit<C, 'base'> & { base: typeof schema }>({
            ...this.config,
            base: schema,
        });
    }

    // ========================================
    // Restrict
    // ========================================

    restrictBaseSchema<
        const F extends keyof C['raw']['create'] & keyof C['raw']['update'] & string,
    >(fields: F[]) {
        const shape = this.config.raw.create;
        const schema = pickFromObject(shape, fields);

        return new DrizzleResourceBuilder<T, Omit<C, 'base'> & { base: typeof schema }>({
            ...this.config,
            base: schema,
        });
    }

    restrictUpdateDataFields<const F extends keyof C['raw']['update'] & string>(fields: F[]) {
        const shape = this.config.raw.update;
        const schema = pickFromObject(shape, fields);

        return new DrizzleResourceBuilder<T, Omit<C, 'updateData'> & { updateData: typeof schema }>(
            {
                ...this.config,
                updateData: schema,
            }
        );
    }

    restrictCreateDataFields<const F extends keyof C['raw']['create'] & string>(fields: F[]) {
        const shape = this.config.raw.create;
        const schema = pickFromObject(shape, fields);

        return new DrizzleResourceBuilder<T, Omit<C, 'createData'> & { createData: typeof schema }>(
            {
                ...this.config,
                createData: schema,
            }
        );
    }

    restrictUpsertDataFields<
        const F extends keyof C['raw']['update'] & keyof C['raw']['create'] & string,
    >(fields: F[]) {
        return new DrizzleResourceBuilder<T, C>(this.config)
            .restrictUpdateDataFields(fields)
            .restrictCreateDataFields(fields);
    }

    restrictReturnColsFields<const F extends keyof C['raw']['select'] & string>(fields: F[]) {
        const shape = this.config.raw.select;
        const schema = pickFromObject(shape, fields);

        return new DrizzleResourceBuilder<T, Omit<C, 'returnCols'> & { returnCols: typeof schema }>(
            {
                ...this.config,
                returnCols: schema,
            }
        );
    }

    restrictAllFields<const F extends keyof C['raw']['create'] & keyof C['raw']['update'] & string>(
        fields: F[]
    ) {
        return new DrizzleResourceBuilder<T, C>(this.config)
            .restrictBaseSchema(fields)
            .restrictUpdateDataFields(fields)
            .restrictCreateDataFields(fields);
    }

    allowSystemFields() {
        const raw = DrizzleResourceBuilder.getTableShapes(this.config.table);

        return new DrizzleResourceBuilder<
            T,
            Omit<C, 'create' | 'update' | 'base'> & {
                create: typeof raw.create;
                update: typeof raw.update;
                base: typeof raw.create;
            }
        >({
            ...this.config,
            create: raw.create,
            update: raw.update,
            base: raw.create,
        });
    }

    // ========================================
    // GetMany
    // ========================================

    enablePagination() {
        const shape = paginationSchema.shape;

        return new DrizzleResourceBuilder<T, Omit<C, 'pagination'> & { pagination: typeof shape }>({
            ...this.config,
            pagination: shape,
        });
    }

    enableOrdering<const Col extends keyof C['raw']['select'] & string>(columns: Col[]) {
        const shape = z.array(
            z.object({
                field: z.enum(columns),
                direction: z.enum(['asc', 'desc']),
            })
        );

        return new DrizzleResourceBuilder<T, Omit<C, 'ordering'> & { ordering: typeof shape }>({
            ...this.config,
            ordering: shape,
        });
    }

    enableFilters<
        S extends Partial<Record<keyof C['raw']['select'], AnyZodType>> &
            Record<string, AnyZodType>,
    >(schema: S) {
        const shape = z.object(schema).shape;
        return new DrizzleResourceBuilder<T, Omit<C, 'filters'> & { filters: typeof shape }>({
            ...this.config,
            filters: shape,
        });
    }

    // ========================================
    // Done
    // ========================================

    done() {
        // base schema
        const base: z.ZodObject<C['base']> = z.object(this.config.base);

        // raw table schemas
        const rawCreate: z.ZodObject<C['raw']['create']> = z.object(this.config.raw.create);
        const rawSelect: z.ZodObject<C['raw']['select']> = z.object(this.config.raw.select);
        const rawUpdate: z.ZodObject<C['raw']['update']> = z.object(this.config.raw.update);

        // identifier schemas
        const identifiers: z.ZodObject<C['id']> = z.object(this.config.id);
        const userId: z.ZodObject<C['userId']> = z.object(this.config.userId);

        const userOnlyIdentifiers = z.object({
            [SCHEMA_KEYS.identifiers]: userId,
        });

        const fullIdentifiers = z.object({
            ...identifiers.shape,
            ...userId.shape,
        });

        // data schemas
        const createData: z.ZodObject<C['createData']> = z.object(this.config.createData);
        const updateData: z.ZodObject<C['updateData']> = z.object(this.config.updateData);

        // getMany filters
        const ordering: C['ordering'] = this.config.ordering;
        const filters: z.ZodObject<C['filters']> = z.object(this.config.filters);
        const pagination: z.ZodOptional<z.ZodObject<C['pagination']>> = z
            .object(this.config.pagination)
            .optional();

        // return cols
        const returnCols: z.ZodObject<C['returnCols']> = z.object(this.config.returnCols);

        return {
            base: base,
            rawTable: {
                create: rawCreate,
                select: rawSelect,
                update: rawUpdate,
            },
            returnCols: returnCols,
            operation: {
                create: {
                    [SCHEMA_KEYS.input]: z.object({
                        [SCHEMA_KEYS.data]: createData,
                    }),
                    [SCHEMA_KEYS.data]: createData,
                },
                update: {
                    [SCHEMA_KEYS.input]: z.object({
                        [SCHEMA_KEYS.data]: updateData,
                        [SCHEMA_KEYS.identifiers]: fullIdentifiers,
                    }),
                    [SCHEMA_KEYS.data]: updateData,
                    [SCHEMA_KEYS.identifiers]: fullIdentifiers,
                },
                getMany: {
                    [SCHEMA_KEYS.identifiers]: userOnlyIdentifiers,
                    [SCHEMA_KEYS.input]: userOnlyIdentifiers,
                    [SCHEMA_KEYS.pagination]: pagination,
                    [SCHEMA_KEYS.filters]: filters,
                    [SCHEMA_KEYS.ordering]: ordering,
                },
                getById: {
                    [SCHEMA_KEYS.identifiers]: fullIdentifiers,
                },
            },
            identifier: {
                userId: userId,
                otherIds: identifiers,
            },
        } as const satisfies DrizzleResourceBuilderReturn;
    }
}

export const defineResource = DrizzleResourceBuilder.create;
