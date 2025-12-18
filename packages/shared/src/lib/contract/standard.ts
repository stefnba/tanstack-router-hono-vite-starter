import z from 'zod';

import { ContractOperationSchemas } from '@app/shared/lib/contract/types';
import { SCHEMA_KEYS } from '@app/shared/lib/resource/builder';
import { orderingSchema } from '@app/shared/lib/resource/common';
import {
    AnyDrizzleResourceBuilderReturn,
    DrizzleResourceBuilderReturn,
} from '@app/shared/lib/resource/types';
import { StripIndexSignature } from '@app/shared/types/utils';

export class ContractStandardOperationsBuilder<
    S extends Record<string, ContractOperationSchemas>,
    R extends DrizzleResourceBuilderReturn,
> {
    private schemas: S;
    private resource: AnyDrizzleResourceBuilderReturn<R>;

    constructor({
        schemas,
        resource,
    }: {
        schemas: S;
        resource: AnyDrizzleResourceBuilderReturn<R>;
    }) {
        this.schemas = schemas;
        this.resource = resource;
    }

    static create<R extends DrizzleResourceBuilderReturn>(resource: R) {
        return new ContractStandardOperationsBuilder<Record<string, ContractOperationSchemas>, R>({
            schemas: {},
            resource: {
                table: resource.table,
                base: resource.base,
                rawTable: resource.rawTable,
                returnCols: resource.returnCols,
                operation: resource.operation,
                identifier: resource.identifier,
            },
        });
    }

    /**
     * Adds standard schemas for creating a single record.
     *
     * - **Endpoint (JSON)**: Requires only data.
     * - **Form**: Uses the create data schema for client-side form validation.
     * - **Service**: Requires full input (data + userId).
     * - **Query**: Uses the full create input schema for internal queries.
     */
    create() {
        const createInputSchema = this.resource.operation.create.input;
        const createDataSchema = this.resource.operation.create.data;

        const schema = {
            create: {
                service: createInputSchema,
                query: createInputSchema,
                endpoint: {
                    json: createDataSchema,
                },
                form: createDataSchema,
            },
        };

        return new ContractStandardOperationsBuilder<S & typeof schema, R>({
            schemas: { ...this.schemas, ...schema },
            resource: this.resource,
        });
    }

    createMany() {
        const createManyInputSchema = this.resource.operation.createMany.input;
        const createManyDataSchema = this.resource.operation.createMany.data;

        const schema = {
            createMany: {
                service: createManyInputSchema,
                query: createManyInputSchema,
                endpoint: {
                    json: createManyDataSchema,
                },
                form: createManyDataSchema,
            },
        };

        return new ContractStandardOperationsBuilder<S & typeof schema, R>({
            schemas: { ...this.schemas, ...schema },
            resource: this.resource,
        });
    }

    getMany() {
        const manyInputSchema = this.resource.operation.getMany.input.and(
            z.object({ [SCHEMA_KEYS.ordering]: orderingSchema(this.resource.table).optional() })
        );

        const paginationSchema = this.resource.operation.getMany.pagination;
        const filtersSchema = this.resource.operation.getMany.filters;

        const schema = {
            getMany: {
                service: manyInputSchema,
                endpoint: {
                    query: paginationSchema.and(filtersSchema),
                },
                query: manyInputSchema,
            },
        };

        return new ContractStandardOperationsBuilder<S & typeof schema, R>({
            schemas: { ...this.schemas, ...schema },
            resource: this.resource,
        });
    }

    /**
     * Adds standard schemas for updating a record by ID.
     *
     * - **Service**: Requires full update input (data, ids, userId).
     * - **Endpoint (JSON)**: Requires partial update data.
     * - **Endpoint (Param)**: Requires ID path parameter.
     * - **Query**: Uses the full update input schema.
     */
    updateById() {
        const updateInputSchema = this.resource.operation.updateById.input;

        const updateDataSchema = this.resource.operation.updateById.data;

        const publicIdentifiers = this.resource.identifier.otherIds;

        const schema = {
            updateById: {
                service: updateInputSchema,
                query: updateInputSchema,
                endpoint: {
                    json: updateDataSchema,
                    param: publicIdentifiers,
                },
                form: updateDataSchema,
            },
        };

        return new ContractStandardOperationsBuilder<S & typeof schema, R>({
            schemas: { ...this.schemas, ...schema },
            resource: this.resource,
        });
    }

    /**
     * Adds standard schemas for retrieving a single record by ID.
     *
     * - **Service**: Requires identifier input (ids + userId).
     * - **Endpoint (Param)**: Requires ID path parameter.
     * - **Query**: Uses the full identifier schema.
     */
    getById() {
        const getByIdInputSchema = this.resource.operation.getById.ids;

        const publicIdentifiers = this.resource.identifier.otherIds;

        const schema = {
            getById: {
                service: getByIdInputSchema,
                endpoint: {
                    param: getByIdInputSchema,
                },
                query: getByIdInputSchema,
            },
        };

        return new ContractStandardOperationsBuilder<S & typeof schema, R>({
            schemas: { ...this.schemas, ...schema },
            resource: this.resource,
        });
    }

    removeById() {
        const removeByIdInputSchema = this.resource.operation.removeById.input;
        const publicIdentifiers = this.resource.identifier.otherIds;

        const schema = {
            removeById: {
                query: removeByIdInputSchema,
                service: removeByIdInputSchema,
                endpoint: {
                    param: publicIdentifiers,
                },
            },
        };

        return new ContractStandardOperationsBuilder<S & typeof schema, R>({
            schemas: { ...this.schemas, ...schema },
            resource: this.resource,
        });
    }

    /**
     * Adds all standard operation schemas (create, createMany, updateById, getById, removeById, getMany).
     */
    all() {
        return this.create().createMany().getMany().updateById().getById().removeById();
    }

    /**
     * Finalizes the builder and returns the accumulated schemas.
     */
    done(): StripIndexSignature<S> {
        return this.schemas;
    }
}
