import { eq, ilike } from 'drizzle-orm';

import { postContract, postResource } from '@app/shared/features/post';

import { post } from '@app/server/db/tables';
import { TableOperationsBuilder } from '@app/server/lib/db/operation';
import { defineRepository } from '@app/server/lib/db/repository';

export const postQueries = new TableOperationsBuilder(post);

export const postRepository = defineRepository(postResource)
    .registerContract(postContract)
    .addQuery('create', ({ tableOps }) => ({
        fn: async ({ data, ids }) => {
            return await tableOps.createRecord({
                data: {
                    title: data.title,
                    content: data.content,
                    userId: ids.userId,
                },
            });
        },
    }))
    .addQuery('getMany', ({ tableOps }) => ({
        fn: async (input) => {
            return await tableOps.getManyRecords({
                identifiers: [{ field: 'userId', value: input.ids.userId }],
                pagination: {
                    page: input.pagination?.page,
                    pageSize: input.pagination?.pageSize,
                },
                filters: [
                    input.filters?.title ? ilike(post.title, input.filters?.title) : undefined,
                    input.filters?.content
                        ? ilike(post.content, input.filters?.content)
                        : undefined,
                ],
            });
        },
    }))
    .done();
