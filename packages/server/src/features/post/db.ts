import { postContract, postResource } from '@app/shared/features/post';

import { post } from '@app/server/db/tables';
import { TableOperationBuilder } from '@app/server/lib/db/operation';
import { defineRepository } from '@app/server/lib/db/repository';

export const postQueries = new TableOperationBuilder(post);

export const postRepository = defineRepository(postResource)
    .registerContract(postContract)
    .registerStandardOperations()
    .done();
