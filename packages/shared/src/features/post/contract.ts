import z from 'zod';

import { defineContract } from '@app/shared/lib/contract/builder';
import { defineResource } from '@app/shared/lib/resource/builder';

import { post } from './table';

const postResource = defineResource(post)
    .setUserId('userId')
    .setIds(['id'])
    .enablePagination()
    .enableFilters({
        title: z.string(),
        content: z.string().optional(),
        startDate: z.date(),
    })
    .done();

export const postContract = defineContract(postResource)
    .registerAllStandard()
    .addOperation('test', ({ schemas }) => {
        return {
            endpoint: {
                json: schemas.base,
            },
        };
    })
    .done();
