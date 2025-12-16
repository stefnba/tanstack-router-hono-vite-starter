import z from 'zod';

import { defineContract } from '@shared/lib/contract/builder';
import { defineResource } from '@shared/lib/resource/builder';

import { user } from './table';

const userResource = defineResource(user)
    .setUserId('id')
    .setIds(['id'])
    .enableFilters({
        name: z.string(),
        email: z.string(),
    })
    .done();

export const userContract = defineContract(userResource).registerAllStandard().done();
