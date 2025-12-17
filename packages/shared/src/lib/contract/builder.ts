import { ContractStandardOperationsBuilder } from '@shared/lib/contract/standard';
import { TFeatureSchemaObject } from '@shared/lib/contract/types';
import {
    AnyDrizzleResourceBuilderReturn,
    DrizzleResourceBuilderReturn,
} from '@shared/lib/resource/types';
import { StripIndexSignature } from '@shared/types/utils';

class ContractBuilder<
    S extends Record<string, TFeatureSchemaObject>,
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
        this.resource = {
            ...resource,
        };
    }

    /**
     * Adds a new operation to the contract.
     *
     * Existing operations can be overwritten by calling this method again with the same key.
     *
     * @param key - The key of the operation.
     * @param resource - The configuration for the operation.
     * @returns A new contract builder with the operation added.
     */
    addOperation<const K extends string, const T extends TFeatureSchemaObject>(
        key: K,
        resource: (args: { schemas: AnyDrizzleResourceBuilderReturn<R> }) => T
    ) {
        const schema = resource({ schemas: this.resource });

        // Helper type to merge objects while effectively handling overwrites and removing index signatures for the new key
        type NewSchemas = {
            [P in keyof S as P extends K ? never : string extends P ? never : P]: S[P];
        } & { [P in K]: T };

        return new ContractBuilder<NewSchemas, R>({
            schemas: { ...this.schemas, [key]: schema },
            resource: this.resource,
        });
    }

    /**
     * Registers all standard schemas (create, createMany, updateById, getById, removeById, getMany).
     *
     * This is the recommended way to quickly scaffold standard operations for a feature.
     */
    registerAllStandard() {
        const builder = ContractStandardOperationsBuilder.create(this.resource);
        const standardSchemas = builder.all().done();

        return new ContractBuilder<S & typeof standardSchemas, R>({
            schemas: { ...this.schemas, ...standardSchemas },
            resource: this.resource,
        });
    }

    done(): StripIndexSignature<S> {
        return this.schemas;
    }
}

/**
 * Defines the contract (API interface) for a resource.
 *
 * This builder connects your data resource to the application layers by defining:
 * - **Service Contract**: Input/output shapes for business logic.
 * - **Query Contract**: Input/output shapes for database access.
 * - **Endpoint Contract**: Validation schemas for Hono routes (json, query, param, form).
 *
 * @example
 * ```ts
 * export const postContract = defineContract(postResource)
 *     .registerAllStandard() // Adds create, update, list, etc.
 *     .addOperation('publish', ({ schemas }) => ({
 *         service: schemas.base.pick({ id: true }),
 *         endpoint: {
 *             json: schemas.base.pick({ id: true }),
 *         },
 *     }))
 *     .done();
 * ```
 */
export const defineContract = <R extends DrizzleResourceBuilderReturn>(c: R) => {
    return new ContractBuilder<Record<string, TFeatureSchemaObject>, R>({
        schemas: {},
        resource: c,
    });
};
