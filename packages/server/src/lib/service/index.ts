import { EmptyContract } from '@app/shared/lib/contract';

import { EmptyRepositoryOperations } from '@app/server/lib/db/repository/types';

import { ServiceBuilder } from './builder';
import { EmptyServices } from './types';

export * from './types';
export * from './builder';

/**
 * Defines a new service configuration.
 *
 * @returns A new ServiceBuilder instance.
 */
export const defineService = (name?: string) => {
    return new ServiceBuilder<EmptyRepositoryOperations, EmptyContract, EmptyServices>({
        repository: {},
        contract: {},
        services: {},
        name,
    });
};
