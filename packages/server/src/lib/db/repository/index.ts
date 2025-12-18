import {
    AnyDrizzleResourceBuilderReturn,
    DrizzleResourceBuilderReturn,
} from '@app/shared/lib/resource/types';

import { EmptyRepositoryOperations } from '@app/server/lib/db/repository/types';

import { RepositoryBuilder } from './builder';

export * from './builder';

/**
 * Defines a new repository configuration.
 *
 * @param resource - The resource definition (table structure, shapes) created by defineResource.
 * @returns A new RepositoryBuilder instance.
 */
export const defineRepository = <
    R extends AnyDrizzleResourceBuilderReturn<DrizzleResourceBuilderReturn>,
>(
    resource: R
) => {
    return new RepositoryBuilder<R, Record<string, never>, EmptyRepositoryOperations>({
        resource,
        contract: {},
        repositoryOperations: {},
    });
};
