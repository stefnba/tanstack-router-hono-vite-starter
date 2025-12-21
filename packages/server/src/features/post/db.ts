import { eq, ilike } from 'drizzle-orm';

import { postContract, postResource } from '@app/shared/features/post';

import { post } from '@app/server/db/tables';
import { TableOperationBuilder } from '@app/server/lib/db/operation';
import { defineRepository } from '@app/server/lib/db/repository';

export const postQueries = new TableOperationBuilder(post);

export const postRepository = defineRepository(postResource)
    .registerContract(postContract)
    .addQuery('create', ({ tableOps }) => ({
        fn: async ({ data, userId }) => {
            return await tableOps.createRecord({
                data: {
                    title: data.title,
                    content: data.content,
                    userId,
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
    .addQuery('getById', ({ tableOps }) => ({
        fn: async (input) => {
            return await tableOps.getFirstRecord({
                identifiers: [
                    { field: 'id', value: input.id },
                    { field: 'userId', value: input.userId },
                ],
            });
        },
    }))
    .done();
