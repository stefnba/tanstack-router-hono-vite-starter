import { ContractStandardOperationsBuilder } from '@shared/lib/contract/standard';
import { TFeatureSchemaObject } from '@shared/lib/contract/types';
import { DrizzleResourceBuilderReturn } from '@shared/lib/resource/types';
import { Prettify } from '@shared/types/utils';

class ContractBuilder<
    S extends Record<string, TFeatureSchemaObject>,
    C extends DrizzleResourceBuilderReturn,
> {
    private schemas: S;

    private config: C;

    constructor({ schemas, config }: { schemas: S; config: C }) {
        this.schemas = schemas;
        this.config = config;
    }

    addOperation<const K extends string, const O extends TFeatureSchemaObject>(
        key: K,
        config: (args: { schemas: C }) => O
    ) {
        const schema = config({ schemas: this.config });

        // Helper type to merge objects while effectively handling overwrites and removing index signatures for the new key
        type NewSchemas = {
            [P in keyof S as P extends K ? never : string extends P ? never : P]: S[P];
        } & { [P in K]: O };

        return new ContractBuilder<NewSchemas, C>({
            schemas: { ...this.schemas, [key]: schema },
            config: this.config,
        });
    }

    /**
     * Registers all standard schemas (create, createMany, updateById, getById, removeById, getMany).
     *
     * This is the recommended way to quickly scaffold standard operations for a feature.
     */
    registerAllStandard() {
        const builder = ContractStandardOperationsBuilder.create(this.config);
        const standardSchemas = builder.all().done();

        return new ContractBuilder<S & typeof standardSchemas, C>({
            schemas: { ...this.schemas, ...standardSchemas },
            config: this.config,
        });
    }

    done(): Prettify<S> {
        return this.schemas;
    }
}

export const defineContract = <C extends DrizzleResourceBuilderReturn>(c: C) => {
    return new ContractBuilder<Record<string, TFeatureSchemaObject>, C>({
        schemas: {},
        config: c,
    });
};
