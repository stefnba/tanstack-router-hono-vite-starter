import z from 'zod';

import { postResource } from '@app/shared/features/post';
import { defineContract } from '@app/shared/lib/contract/builder';

import { defineRepository } from './index';

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
console.log(testResult);
