import { AnyContract, InferContractInput } from '@app/shared/lib/contract/types';
import {
    AnyDrizzleResourceBuilderReturn,
    DrizzleResourceBuilderReturn,
} from '@app/shared/lib/resource/types';
import { Prettify, StripIndexSignature } from '@app/shared/types/utils';

import { QueryFn } from '@app/server/lib/db/operation';
import { dbQueryFnHandler } from '@app/server/lib/db/operation/handler';
import { TableOperationsBuilder } from '@app/server/lib/db/operation/table';
import { appError } from '@app/server/lib/error';

export class RepositoryBuilder<
    R extends AnyDrizzleResourceBuilderReturn<DrizzleResourceBuilderReturn>,
    C extends AnyContract,
    Q extends Record<string, QueryFn>,
> {
    private resource: R;
    private contract: C;
    private repositoryOperations: Q;
    private tableOperations: TableOperationsBuilder<R['table']>;

    constructor({
        resource,
        contract,
        repositoryOperations,
    }: {
        resource: R;
        contract: C;
        repositoryOperations: Q;
    }) {
        this.resource = resource;
        this.contract = contract;
        this.repositoryOperations = repositoryOperations;
        this.tableOperations = new TableOperationsBuilder(resource.table);
    }

    /**
     * Registers the contract (API interface) for this repository.
     * This provides the schema definitions for query operations.
     */
    registerContract<NewC extends AnyContract>(contract: NewC) {
        return new RepositoryBuilder<R, NewC, Q>({
            resource: this.resource,
            contract,
            repositoryOperations: this.repositoryOperations,
        });
    }

    /**
     * Adds a new query operation to the repository.
     *
     * @param key - The key of the operation (must be defined in contract if it exists)
     * @param config - The configuration for the operation
     * @returns A new RepositoryBuilder instance with the added operation
     */
    addQuery<
        const K extends Exclude<keyof C & string, keyof Q> | (string & {}),
        I = InferContractInput<C, K, 'query'>,
        O = unknown,
    >(
        key: K,
        config:
            | {
                  fn: QueryFn<I, O>;
                  operation?: string;
              }
            | ((args: {
                  tableOps: TableOperationsBuilder<R['table']>;
                  resource: R;
                  contract: C;
                  error: typeof appError;
              }) => {
                  fn: QueryFn<I, O>;
                  operation?: string;
              })
    ) {
        // Extract fn and operation from config (handle both object and function)
        const { fn, operation } =
            typeof config === 'function'
                ? config({
                      tableOps: this.tableOperations,
                      resource: this.resource,
                      contract: this.contract,
                      error: appError,
                  })
                : config;

        // Wrap the query with error handling (custom queries need this layer)
        const wrappedQueryFn = dbQueryFnHandler({
            queryFn: fn,
            operation: operation || `${String(key)} operation`,
        });

        const newRepositoryOperations = {
            ...this.repositoryOperations,
            [key]: wrappedQueryFn,
        };

        // Return a new builder with the wrapped query added
        return new RepositoryBuilder<R, C, Omit<Q, K> & Record<K, QueryFn<I, O>>>({
            resource: this.resource,
            contract: this.contract,
            repositoryOperations: newRepositoryOperations,
        });
    }

    /**
     * Finalizes the repository definition.
     * @returns The configuration object containing the resource and contract.
     */
    done(): StripIndexSignature<Q> {
        return this.repositoryOperations;
    }
}
