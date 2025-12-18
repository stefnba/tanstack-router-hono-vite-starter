import z from 'zod';

import { defineContract } from '@app/shared/lib/contract/builder';
import { defineResource } from '@app/shared/lib/resource/builder';

import { post } from './table';

export const postResource = defineResource(post)
    .setUserId('userId')
    .setIds(['id'])
    .transform((schema) =>
        schema.extend({
            title: z.string().min(1),
            content: z.string().min(1),
        })
    )
    .enablePagination()
    .enableFilters({
        title: z.string(),
        content: z.string(),
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
