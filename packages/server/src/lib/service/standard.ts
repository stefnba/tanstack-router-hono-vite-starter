import { StripIndexSignature } from '@app/shared/types/utils';

import { QueryFn } from '@app/server/lib/db/operation';
import { getStandardOperationKey } from '@app/server/lib/db/repository/utils';
import { serviceHandler } from '@app/server/lib/service/handler';
import { EmptyServices, ServiceFn } from '@app/server/lib/service/types';

/**
 * The repository builder used to build the standard operations, e.g. create, getById, etc. for a resource.
 */
export class ServiceStandardOperationsBuilder<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Q extends Record<string, QueryFn<any, any>>,
    const S extends Record<string, ServiceFn>,
> {
    private repositoryOperations: Q;
    private serviceOperations: S;

    constructor({
        repositoryOperations,
        serviceOperations,
    }: {
        repositoryOperations: Q;
        serviceOperations: S;
    }) {
        this.repositoryOperations = repositoryOperations;
        this.serviceOperations = serviceOperations;
    }

    static init<const Q extends Record<string, QueryFn>>(repositoryOperations: Q) {
        return new ServiceStandardOperationsBuilder<Q, EmptyServices>({
            repositoryOperations,
            serviceOperations: {},
        });
    }

    /**
     * Gets a query by key. Required for type safety when chaining standard services.
     *
     * @param key - The key of the query to get.
     * @returns The query function.
     */
    private getQuery<const K extends keyof Q>(
        key: K
    ): QueryFn<Parameters<Q[K]>[0], Awaited<ReturnType<Q[K]>>> {
        if (!this.repositoryOperations[key]) {
            throw new Error(
                `Query ${String(key)} not part of the repository operations. Possible queries: ${Object.keys(this.repositoryOperations).join(', ')}`
            );
        }

        const query = this.repositoryOperations[key];
        return query;
    }

    /**
     * Adds a get by ID operation to the service.
     */
    getById() {
        const key = getStandardOperationKey('getById');

        const query = this.getQuery(key);

        const wrappedService = serviceHandler({
            serviceFn: query,
            onNull: 'throw',
            operation: key,
        });

        return new ServiceStandardOperationsBuilder<
            Q,
            Omit<S, typeof key> & Record<typeof key, typeof wrappedService>
        >({
            repositoryOperations: this.repositoryOperations,
            serviceOperations: {
                ...this.serviceOperations,
                [key]: wrappedService,
            },
        });
    }

    /**
     * Adds a get many operation to the service.
     */
    getMany() {
        const key = getStandardOperationKey('getMany');

        const query = this.getQuery(key);

        const wrappedService = serviceHandler({
            serviceFn: query,
            onNull: 'return',
            operation: key,
        });

        return new ServiceStandardOperationsBuilder<
            Q,
            Omit<S, typeof key> & Record<typeof key, typeof wrappedService>
        >({
            repositoryOperations: this.repositoryOperations,
            serviceOperations: {
                ...this.serviceOperations,
                [key]: wrappedService,
            },
        });
    }

    /**
     * Adds a create operation to the service.
     */
    create() {
        const key = getStandardOperationKey('create');

        const query = this.getQuery(key);

        const wrappedService = serviceHandler({
            serviceFn: query,
            onNull: 'return',
            operation: key,
        });

        return new ServiceStandardOperationsBuilder<
            Q,
            Omit<S, typeof key> & Record<typeof key, typeof wrappedService>
        >({
            repositoryOperations: this.repositoryOperations,
            serviceOperations: {
                ...this.serviceOperations,
                [key]: wrappedService,
            },
        });
    }

    /**
     * Adds a create many operation to the service.
     */
    createMany() {
        const key = getStandardOperationKey('createMany');

        const query = this.getQuery(key);

        const wrappedService = serviceHandler({
            serviceFn: query,
            onNull: 'return',
            operation: key,
        });

        return new ServiceStandardOperationsBuilder<
            Q,
            Omit<S, typeof key> & Record<typeof key, typeof wrappedService>
        >({
            repositoryOperations: this.repositoryOperations,
            serviceOperations: {
                ...this.serviceOperations,
                [key]: wrappedService,
            },
        });
    }

    /**
     * Adds an update by ID operation to the service.
     */
    updateById() {
        const key = getStandardOperationKey('updateById');

        const query = this.getQuery(key);

        const wrappedService = serviceHandler({
            serviceFn: query,
            onNull: 'throw',
            operation: key,
        });

        return new ServiceStandardOperationsBuilder<
            Q,
            Omit<S, typeof key> & Record<typeof key, typeof wrappedService>
        >({
            repositoryOperations: this.repositoryOperations,
            serviceOperations: {
                ...this.serviceOperations,
                [key]: wrappedService,
            },
        });
    }

    /**
     * Adds a remove by ID operation to the service.
     */
    removeById() {
        const key = getStandardOperationKey('removeById');

        const query = this.getQuery(key);

        const wrappedService = serviceHandler({
            serviceFn: query,
            onNull: 'throw',
            operation: key,
        });

        return new ServiceStandardOperationsBuilder<
            Q,
            Omit<S, typeof key> & Record<typeof key, typeof wrappedService>
        >({
            repositoryOperations: this.repositoryOperations,
            serviceOperations: {
                ...this.serviceOperations,
                [key]: wrappedService,
            },
        });
    }

    /**
     * Adds all standard operations to the service.
     */
    all() {
        return this.getById().getMany().create().createMany().updateById().removeById();
    }

    /**
     * Finalizes the service builder and returns the service operations.
     * @returns The service operations.
     */
    done(): StripIndexSignature<S> {
        return this.serviceOperations;
    }
}
