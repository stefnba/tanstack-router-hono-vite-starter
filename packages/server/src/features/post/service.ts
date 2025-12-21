import { postContract } from '@app/shared/features/post/contract';

import { postRepository } from '@app/server/features/post/db';
import { defineService } from '@app/server/lib/service';

export const postService = defineService()
    .registerRepository(postRepository)
    .registerContract(postContract)
    .registerStandardOperations()
    .done();
