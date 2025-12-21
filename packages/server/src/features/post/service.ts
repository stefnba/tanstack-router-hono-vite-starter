import { postContract } from '@app/shared/features/post/contract';

import { postRepository } from '@app/server/features/post/db';
import { defineService } from '@app/server/lib/service';

export const postService = defineService()
    .registerRepository(postRepository)
    .registerContract(postContract)
    .addService('create', ({ repo }) => ({
        fn: async (input) => {
            return await repo.create(input);
        },
    }))
    .addService('getMany', ({ repo }) => ({
        fn: async (input) => {
            return await repo.getMany(input);
        },
    }))
    .addService('getById', ({ repo }) => ({
        fn: async (input) => {
            return await repo.getById(input);
        },
    }))
    .done();
