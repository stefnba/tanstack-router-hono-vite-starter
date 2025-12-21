import { AnyContract, InferContractInput } from '@app/shared/lib/contract/types';
import { Prettify, StripIndexSignature } from '@app/shared/types/utils';

import { QueryFn } from '@app/server/lib/db/operation';
import { appError } from '@app/server/lib/error';

import { serviceHandler } from './handler';
import { ServiceFn } from './types';

export class ServiceBuilder<
    R extends Record<string, QueryFn>,
    C extends AnyContract,
    S extends Record<string, ServiceFn>,
> {
    private repository: R;
    private contract: C;
    private services: S;
    private name?: string;

    constructor({
        repository,
        contract,
        services,
        name,
    }: {
        repository: R;
        contract: C;
        services: S;
        name?: string;
    }) {
        this.repository = repository;
        this.contract = contract;
        this.services = services;
        this.name = name;
    }

    /**
     * Registers the repository for this service.
     * This provides the data access layer for the service.
     */
    registerRepository<NewR extends Record<string, QueryFn>>(repository: NewR) {
        return new ServiceBuilder<NewR, C, S>({
            repository,
            contract: this.contract,
            services: this.services,
            name: this.name,
        });
    }

    /**
     * Registers the contract (API interface) for this service.
     * This provides the schema definitions for service inputs.
     */
    registerContract<NewC extends AnyContract>(contract: NewC) {
        return new ServiceBuilder<R, NewC, S>({
            repository: this.repository,
            contract,
            services: this.services,
            name: this.name,
        });
    }

    /**
     * Adds a new service operation (Default: throws on null).
     *
     * By default, if the service function returns null or undefined, an error will be thrown.
     * This enforces non-nullable return types for the consumer.
     */
    addService<
        const K extends Exclude<keyof C & string, keyof S> | (string & {}),
        I = InferContractInput<C, K, 'service'>,
        O = unknown,
    >(
        key: K,
        implementation: (args: { repo: R; contract: C; services: S; error: typeof appError }) => {
            fn: ServiceFn<I, O>;
            operation?: string;
            onNull?: 'throw';
        }
    ): ServiceBuilder<R, C, Prettify<Omit<S, K> & Record<K, ServiceFn<I, NonNullable<O>>>>>;

    /**
     * Adds a new service operation (Nullable return).
     *
     * If `onNull: 'return'` is specified, the service is allowed to return null.
     */
    addService<
        const K extends Exclude<keyof C & string, keyof S> | (string & {}),
        I = InferContractInput<C, K, 'service'>,
        O = unknown,
    >(
        key: K,
        implementation: (args: { repo: R; contract: C; services: S; error: typeof appError }) => {
            fn: ServiceFn<I, O>;
            operation?: string;
            onNull: 'return';
        }
    ): ServiceBuilder<R, C, Prettify<Omit<S, K> & Record<K, ServiceFn<I, O>>>>;

    /**
     * Implementation
     */
    addService<
        const K extends Exclude<keyof C & string, keyof S> | (string & {}),
        I = InferContractInput<C, K, 'service'>,
        O = unknown,
    >(
        key: K,
        implementation: (args: { repo: R; contract: C; services: S; error: typeof appError }) => {
            fn: ServiceFn<I, O>;
            operation?: string;
            onNull?: 'throw' | 'return';
        }
    ): ServiceBuilder<
        R,
        C,
        Prettify<Omit<S, K> & Record<K, ServiceFn<I, O> | ServiceFn<I, NonNullable<O>>>>
    > {
        const {
            fn,
            operation,
            onNull = 'throw',
        } = implementation({
            repo: this.repository,
            contract: this.contract,
            services: this.services,
            error: appError,
        });

        // const throwOnNull = onNull === 'throw';

        const wrappedFn = serviceHandler({
            serviceFn: fn,
            onNull,
            operation: operation || `${String(key)} operation`,
            resource: this.name,
        });

        return new ServiceBuilder<
            R,
            C,
            Prettify<Omit<S, K> & Record<K, ServiceFn<I, O> | ServiceFn<I, NonNullable<O>>>>
        >({
            repository: this.repository,
            contract: this.contract,
            services: { ...this.services, [key]: wrappedFn },
            name: this.name,
        });
    }

    /**
     * Finalizes the service definition.
     * @returns The implementation object containing all services.
     */
    done(): StripIndexSignature<S> {
        return this.services;
    }
}
