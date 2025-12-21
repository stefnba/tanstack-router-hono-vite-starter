import z from 'zod';

import { InferTableTypes } from '@app/shared/lib/db/drizzle/types';
import { DrizzleResourceBuilderReturn } from '@app/shared/lib/resource';
import { SCHEMA_KEYS } from '@app/shared/lib/resource/builder';
import { PaginationOutput } from '@app/shared/lib/resource/common';
import { AnyDrizzleResourceBuilderReturn } from '@app/shared/lib/resource/types';
import { typedEntries, typedKeys } from '@app/shared/lib/utils';
import { Prettify, StripIndexSignature } from '@app/shared/types/utils';

import { DrizzleBooleanFilter, QueryFn, TableOperationBuilder } from '@app/server/lib/db/operation';
import { EmptyRepositoryOperations } from '@app/server/lib/db/repository/types';

/**
 * The repository builder used to build the standard operations, e.g. create, getById, etc. for a resource.
 */
export class RepositoryStandardOperationsBuilder<
    R extends DrizzleResourceBuilderReturn,
    Q extends Record<string, QueryFn>,
> {
    /**
     * The resource to build the operations for.
     */
    private resource: AnyDrizzleResourceBuilderReturn<R>;
    /**
     * The repository operations to build the operations for.
     */
    private repositoryOperations: Q;
    /**
     * The table operations to build the operations for.
     */
    private tableOperations: TableOperationBuilder<R['table']>;

    /**
     * Constructor for the RepositoryStandardOperationsBuilder.
     * @param resource - The resource to build the operations for.
     * @param repositoryOperations - The repository operations to build the operations for.
     */
    constructor({
        resource,
        repositoryOperations,
    }: {
        resource: AnyDrizzleResourceBuilderReturn<R>;
        repositoryOperations: Q;
    }) {
        this.resource = resource;
        this.repositoryOperations = repositoryOperations;
        this.tableOperations = new TableOperationBuilder(resource.table);
    }

    /**
     * Initializes a new repository standard operations builder.
     * @param resource - The resource to build the operations for.
     */
    static init<R extends DrizzleResourceBuilderReturn>(resource: R) {
        return new RepositoryStandardOperationsBuilder<R, EmptyRepositoryOperations>({
            resource,
            repositoryOperations: {},
        });
    }

    /**
     * Builds the boolean filters for the identifiers.
     * Maps the input identifiers (e.g., { id: 1, userId: 10 }) to the DrizzleBooleanFilter format used by the TableOperationBuilder.
     */
    private buildAllIdentifiers<const O extends keyof typeof this.resource.schemas.operation>(
        // operation: O,
        input: z.infer<(typeof this.resource.schemas.operation)[O]['input']>
    ): Array<DrizzleBooleanFilter<R['table']>> {
        const identifiers: Array<DrizzleBooleanFilter<R['table']>> = [
            // default filters
        ];

        if (input && SCHEMA_KEYS.identifiers in input) {
            // TypeScript infers 'inputIds' as 'unknown' here because it cannot guarantee
            // the existence of 'identifiers' on the generic Input type at compile time.
            // However, the check 'SCHEMA_KEYS.identifiers in input' ensures it exists,
            // and the subsequent 'typeof' check ensures runtime safety.
            const inputIds = input[SCHEMA_KEYS.identifiers];

            if (inputIds && typeof inputIds === 'object') {
                // 3. Use typedEntries to iterate safely without manual indexing
                for (const [key, value] of typedEntries(inputIds)) {
                    identifiers.push({
                        field: key,
                        value: value,
                    });
                }
            }
        }

        return identifiers;
    }

    /**
     * Builds the return columns based on specified schema fields.
     */
    private buildReturnCols(): Prettify<(keyof R['schemas']['returnCols']['shape'])[]> {
        return typedKeys(this.resource.schemas.returnCols.shape);
    }

    /**
     * Adds the getById operation to the repository.
     */
    getById() {
        const key = 'getById' as const;
        type Input = z.infer<
            (typeof this.resource.schemas.operation)[typeof key][typeof SCHEMA_KEYS.input]
        >;

        const query = async (args: Input) => {
            const identifiers = this.buildAllIdentifiers<typeof key>(args);
            return this.tableOperations.getFirstRecord({
                identifiers,
                columns: this.buildReturnCols(),
            });
        };

        return new RepositoryStandardOperationsBuilder<
            R,
            Omit<Q, typeof key> & Record<typeof key, typeof query>
        >({
            resource: this.resource,
            repositoryOperations: {
                ...this.repositoryOperations,
                [key]: query,
            },
        });
    }
    getMany() {
        const key = 'getMany' as const;
        type Input = z.infer<
            (typeof this.resource.schemas.operation)[typeof key][typeof SCHEMA_KEYS.input]
        >;

        const query = async (args: Input) => {
            const identifiers = this.buildAllIdentifiers<typeof key>(args);

            // Safe cast: "args" is a complex generic union from Zod, so TS infers properties as unknown.
            // We trust the upstream Resource/Contract validation to ensure that if pagination exists,
            // it matches the PaginationOutput shape required by getManyRecords.
            const pagination = args[SCHEMA_KEYS.pagination] as PaginationOutput | undefined;

            return this.tableOperations.getManyRecords({
                identifiers,
                columns: this.buildReturnCols(),
                pagination,
            });
        };

        return new RepositoryStandardOperationsBuilder<
            R,
            Omit<Q, typeof key> & Record<typeof key, typeof query>
        >({
            resource: this.resource,
            repositoryOperations: {
                ...this.repositoryOperations,
                [key]: query,
            },
        });
    }

    /**
     * Extracts and builds the userId data based on the input arguments.
     * If userId schema is not specified, we return an empty object.
     */
    private buildUserIdData<const K extends keyof typeof this.resource.schemas.operation>(
        args: z.infer<(typeof this.resource.schemas.operation)[K]['input']>
    ) {
        const userIdKey = this.resource.keys.userId;
        const userId = userIdKey && userIdKey in args ? args[userIdKey] : undefined;
        return userIdKey ? { [userIdKey]: userId } : {};
    }

    /**
     * Adds the create operation to the repository.
     */
    create() {
        const key = 'create' as const;
        type Input = z.infer<
            (typeof this.resource.schemas.operation)[typeof key][typeof SCHEMA_KEYS.input]
        >;
        const query = async (args: Input) => {
            // input data
            const data = args[SCHEMA_KEYS.data] || {};

            // userId
            const userIdData = this.buildUserIdData<typeof key>(args);

            // when building the resouce, we call .ensureCreateInputColumns() within done() to ensure that all
            // required columns are present in the create input.
            const fullData = {
                ...data,
                ...userIdData,
            } as InferTableTypes<R['table'], 'insert'>;

            return this.tableOperations.createRecord({
                data: fullData,
                returnColumns: this.buildReturnCols(),
            });
        };

        return new RepositoryStandardOperationsBuilder<
            R,
            Omit<Q, typeof key> & Record<typeof key, typeof query>
        >({
            resource: this.resource,
            repositoryOperations: {
                ...this.repositoryOperations,
                [key]: query,
            },
        });
    }

    /**
     * Adds the createMany operation to the repository.
     */
    createMany() {
        const key = 'createMany' as const;
        type Input = z.infer<
            (typeof this.resource.schemas.operation)[typeof key][typeof SCHEMA_KEYS.input]
        >;
        const query = async (args: Input) => {
            // input data
            // createMany input schema is an array of objects, so we need to convert it to an array of objects.
            const data = args[SCHEMA_KEYS.data];
            const dataArray = Array.isArray(data) ? data : [data];

            // userId
            const userIdData = this.buildUserIdData<typeof key>(args);

            // when building the resouce, we call .ensureCreateInputColumns() within done() to ensure that all
            // required columns are present in the create input.
            // we need to merge the userId data with the input data for each record.
            const fullData = dataArray.map((r) => ({
                ...r,
                ...userIdData,
            })) as Array<InferTableTypes<R['table'], 'insert'>>;

            return this.tableOperations.createManyRecords({
                data: fullData,
                returnColumns: this.buildReturnCols(),
            });
        };

        return new RepositoryStandardOperationsBuilder<
            R,
            Omit<Q, typeof key> & Record<typeof key, typeof query>
        >({
            resource: this.resource,
            repositoryOperations: {
                ...this.repositoryOperations,
                [key]: query,
            },
        });
    }

    updateById() {
        const key = 'updateById' as const;
        type Input = z.infer<
            (typeof this.resource.schemas.operation)[typeof key][typeof SCHEMA_KEYS.input]
        >;

        const query = async (args: Input) => {
            // when building the resouce, we ensure that only allowed fields are present in the update input.
            const data = (args[SCHEMA_KEYS.data] || {}) as InferTableTypes<R['table'], 'update'>;

            return this.tableOperations.updateRecord({
                identifiers: this.buildAllIdentifiers<typeof key>(args),
                data,
                returnColumns: this.buildReturnCols(),
            });
        };

        return new RepositoryStandardOperationsBuilder<
            R,
            Omit<Q, typeof key> & Record<typeof key, typeof query>
        >({
            resource: this.resource,
            repositoryOperations: {
                ...this.repositoryOperations,
                [key]: query,
            },
        });
    }

    // updateMany() {}

    /**
     * Adds the removeById operation to the repository.
     */
    removeById() {
        const key = 'removeById' as const;
        type Input = z.infer<
            (typeof this.resource.schemas.operation)[typeof key][typeof SCHEMA_KEYS.input]
        >;
        const query = async (args: Input) => {
            return this.tableOperations.removeRecord({
                identifiers: this.buildAllIdentifiers<typeof key>(args),
            });
        };

        return new RepositoryStandardOperationsBuilder<
            R,
            Omit<Q, typeof key> & Record<typeof key, typeof query>
        >({
            resource: this.resource,
            repositoryOperations: {
                ...this.repositoryOperations,
                [key]: query,
            },
        });
    }

    all() {
        return this.create().createMany().getById().getMany().updateById().removeById();
    }

    /**
     * Finalizes the repository builder and returns the repository operations.
     * @returns The repository operations.
     */
    done(): StripIndexSignature<Q> {
        return this.repositoryOperations;
    }
}
