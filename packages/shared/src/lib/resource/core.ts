import { Table } from 'drizzle-orm';
import z from 'zod';

import { RawTableShapes, ResourceBuilderConfig } from '@shared/lib/resource/types';

export class DrizzleTableSchemas<T extends Table, C extends TableSchemasBuilderConfig<T>> {
    private keys = {
        input: 'input',
        identifiers: 'ids',
        data: 'data',
        pagination: 'pagination',
        filters: 'filters',
        ordering: 'ordering',
    } as const;

    constructor(private readonly config: C) {}

    // ========================================
    // Table
    // ========================================

    /**
     * Get the table.
     *
     * Returns the table object.
     */
    getTable(): T {
        if (!this.config.table) {
            console.error('FeatureTableConfig: table is undefined in config', this.config);
        }
        return this.config.table;
    }

    getRawTableSchemas(): {
        create: z.ZodObject<C['raw']['create']>;
        select: z.ZodObject<C['raw']['select']>;
        update: z.ZodObject<C['raw']['update']>;
    } {
        return {
            create: z.object(this.config.raw.create),
            select: z.object(this.config.raw.select),
            update: z.object(this.config.raw.update),
        };
    }

    getRawTableSchema<O extends keyof RawTableShapes<T> & string>(operation: O) {
        const raw = this.config.raw[operation];
        return z.object(raw);
    }

    // ========================================
    // Base
    // ========================================

    /**
     * Get the base schema for the table.
     *
     * This schema represents the foundational structure of the table data,
     * often used as a starting point for other operations.
     */
    getBaseSchema(): z.ZodObject<C['base']> {
        return z.object(this.config.base);
    }

    // ========================================
    // User ID
    // ========================================

    getUserIdSchema(): z.ZodObject<C['userId']> {
        return z.object(this.config.userId);
    }

    // ========================================
    // Other ID fields
    // ========================================

    getIdsSchema(): z.ZodObject<C['id']> {
        return z.object(this.config.id);
    }

    getUpdateDataSchema(): z.ZodObject<C['updateData']> {
        return z.object(this.config.updateData);
    }

    getCreateDataSchema(): z.ZodObject<C['createData']> {
        return z.object(this.config.createData);
    }

    getReturnColsSchema(): z.ZodObject<C['returnCols']> {
        return z.object(this.config.returnCols);
    }

    mergeIdentifierSchema() {
        const idsShape = this.getIdsSchema().shape;
        const userIdShape = this.getUserIdSchema().shape;
        const mergedShape = Object.assign(idsShape, userIdShape);

        return z.object({
            [this.keys.identifiers]: z.object(mergedShape),
        });
    }

    mergeCreateInputSchema() {
        const dataShape = this.getCreateDataSchema().shape;

        return z.object({
            [this.keys.data]: z.object(dataShape),
        });
    }

    mergeUpdateInputSchema() {
        return z.object({
            [this.keys.data]: this.getUpdateDataSchema(),
            ...this.mergeIdentifierSchema().shape,
        });
    }

    buildUserIdSchema() {
        return z.object({
            [this.keys.identifiers]: this.getUserIdSchema(),
        });
    }

    buildIdsSchema() {
        return z.object({
            [this.keys.identifiers]: this.getIdsSchema(),
        });
    }

    done() {
        return {
            table: this.getTable(),
            rawTableSchemas: {
                create: this.getRawTableSchema('create'),
                update: this.getRawTableSchema('update'),
                select: this.getRawTableSchema('select'),
            },
            operationSchemas: {
                create: {
                    [this.keys.input]: this.mergeCreateInputSchema(),
                    [this.keys.data]: this.getRawTableSchema('create'),
                },
                update: {
                    input: this.mergeUpdateInputSchema(),
                    [this.keys.data]: this.getRawTableSchema('update'),
                    [this.keys.identifiers]: this.mergeIdentifierSchema(),
                },
                getMany: {
                    [this.keys.identifiers]: this.buildUserIdSchema(),
                    // [this.keys.filters]: this.getFiltersSchema(),
                    // ordering: this.getOrderingSchema(),
                    // [this.keys.pagination]: this.getPaginationSchema(),
                },
                getById: {
                    [this.keys.identifiers]: this.mergeIdentifierSchema(),
                },
            },
            baseSchema: this.getBaseSchema(),
            identifierSchemas: {
                [this.keys.identifiers]: this.mergeIdentifierSchema(),
                onlyIds: this.buildIdsSchema(),
                userId: this.buildUserIdSchema(),
            },
        } as const;
    }
}
