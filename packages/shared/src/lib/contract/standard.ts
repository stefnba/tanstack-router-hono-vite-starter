import { TFeatureSchemaObject } from '@shared/lib/contract/types';
import { DrizzleResourceBuilderReturn } from '@shared/lib/resource/types';
import { Prettify } from '@shared/types/utils';

export class ContractStandardOperationsBuilder<
    S extends Record<string, TFeatureSchemaObject>,
    C extends DrizzleResourceBuilderReturn,
> {
    private schemas: S;
    private config: C;

    constructor({ schemas, config }: { schemas: S; config: C }) {
        this.schemas = schemas;
        this.config = config;
    }

    static create<C extends DrizzleResourceBuilderReturn>(config: C) {
        return new ContractStandardOperationsBuilder<Record<string, TFeatureSchemaObject>, C>({
            schemas: {},
            config: config,
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
        const createInputSchema: C['operation']['create']['input'] =
            this.config.operation.create.input;

        const createDataSchema: C['operation']['create']['data'] =
            this.config.operation.create.data;

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

        return new ContractStandardOperationsBuilder<S & typeof schema, C>({
            schemas: { ...this.schemas, ...schema },
            config: this.config,
        });
    }

    createMany() {
        const createInputSchema: C['operation']['create']['input'] =
            this.config.operation.create.input;

        const createDataSchema: C['operation']['create']['data'] =
            this.config.operation.create.data;

        const schema = {
            create: {
                service: createInputSchema,
                query: createInputSchema,
                endpoint: {
                    json: createDataSchema,
                },
                format: createDataSchema,
            },
        };

        return new ContractStandardOperationsBuilder<S & typeof schema, C>({
            schemas: { ...this.schemas, ...schema },
            config: this.config,
        });
    }

    getMany() {
        const manyInputSchema: C['operation']['getMany']['input'] =
            this.config.operation.getMany.input;

        const schema = {
            getMany: {
                service: manyInputSchema,
                endpoint: {
                    query: manyInputSchema,
                },
                query: manyInputSchema,
            },
        };

        return new ContractStandardOperationsBuilder<S & typeof schema, C>({
            schemas: { ...this.schemas, ...schema },
            config: this.config,
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
        const updateInputSchema: C['operation']['update']['input'] =
            this.config.operation.update.input;

        const updateDataSchema: C['operation']['update']['data'] =
            this.config.operation.update.data;

        const publicIdentifiers: C['identifier']['otherIds'] = this.config.identifier.otherIds;

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

        return new ContractStandardOperationsBuilder<S & typeof schema, C>({
            schemas: { ...this.schemas, ...schema },
            config: this.config,
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
        const getByIdInputSchema: C['operation']['getById']['ids'] =
            this.config.operation.getById.ids;

        const publicIdentifiers: C['identifier']['otherIds'] = this.config.identifier.otherIds;

        const schema = {
            getById: {
                service: getByIdInputSchema,
                endpoint: {
                    param: publicIdentifiers,
                },
                query: getByIdInputSchema,
            },
        };

        return new ContractStandardOperationsBuilder<S & typeof schema, C>({
            schemas: { ...this.schemas, ...schema },
            config: this.config,
        });
    }

    removeById() {
        const publicIdentifiers: C['identifier']['otherIds'] = this.config.identifier.otherIds;

        const schema = {
            removeById: {
                service: publicIdentifiers,
                endpoint: {
                    param: publicIdentifiers,
                },
            },
        };

        return new ContractStandardOperationsBuilder<S & typeof schema, C>({
            schemas: { ...this.schemas, ...schema },
            config: this.config,
        });
    }

    /**
     * Adds all standard operation schemas (create, createMany, updateById, getById, removeById, getMany).
     */
    all() {
        return this.create().getMany().updateById().getById();
    }

    /**
     * Finalizes the builder and returns the accumulated schemas.
     */
    done(): Prettify<S> {
        return this.schemas;
    }
}
