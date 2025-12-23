import z from 'zod';

import { post } from '@app/shared/features/post';
import { defineContract } from '@app/shared/lib/contract/builder';
import { defineResource } from '@app/shared/lib/resource';

import { RepositoryStandardOperationsBuilder } from '@app/server/lib/db/repository/standard';

import { defineRepository } from './index';

export const postResource = defineResource(post)
    .setUserId('userId')
    .setIds(['id'])
    .transform((schema) =>
        schema.extend({
            title: z.string().min(1),
            content: z.string().min(1),
        })
    )
    .restrictCreateDataFields(['title', 'content'])
    // .restrictReturnColsFields(['title', 'content'])
    .enablePagination()
    .enableFilters({
        title: z.string(),
        content: z.string(),
    })
    .done();

// contract
export const postContractTestOperation = defineContract(postResource)
    .addOperation('publish', () => ({
        query: z.object({ postId: z.string() }),
    }))
    .done();

const testQuery = defineRepository(postResource)
    .registerContract(postContractTestOperation)
    .addQuery('publish', ({ tableOps }) => ({
        fn: async (input) => {
            return await tableOps.getManyRecords();
        },
        operation: 'test',
    }))
    .done();

const testResult = await testQuery.publish({ postId: '123' });
// console.log(testResult);

const testStandard = RepositoryStandardOperationsBuilder.init(postResource)
    .create()
    .createMany()
    .getById()
    .getMany()
    .updateById()
    .removeById()
    .done();
// export const testStandardResultGetById = await testStandard.getById({
//     ids: { userId: '123', id: '123' },
// });
// export const testStandardResultMany = await testStandard.getMany({ ids: { userId: '123' } });
export const testStandardResultCreate = await testStandard.create({
    data: { title: 'Test', content: 'Test' },
    userId: testResult[0].userId,
});

export const testStandardResultCreateMany = await testStandard.createMany({
    data: [
        { title: 'Test', content: 'Test' },
        { title: 'Test2', content: 'Test2' },
    ],
    userId: testResult[0].userId,
});

export const testStandardResultUpdateById = await testStandard.updateById({
    data: { title: 'Test Updated', content: 'Test Updated' },
    ids: { userId: testResult[0].userId, id: testStandardResultCreate.id },
});
console.log(testStandardResultUpdateById);

// export const testStandardResultRemoveById = await testStandard.removeById({
//     ids: { userId: testResult[0].userId, id: testResult[0].id },
// });

process.exit(0);
