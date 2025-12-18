import z from 'zod';

import { defineContract } from '@app/shared/lib/contract/builder';
import { defineResource } from '@app/shared/lib/resource/builder';

import { authSession, user } from './table';

// ========================================
// User Resource
// ========================================

export const userResource = defineResource(user)
    .setUserId('id')
    .enableFilters({
        email: z.string(),
    })
    .done();

export const userContract = defineContract(userResource).registerAllStandard().done();

// ========================================
// Auth Session
// ========================================

export const authSessionResource = defineResource(authSession)
    .setUserId('id')
    .setIds(['id'])
    .done();

export const authSessionContract = defineContract(authSessionResource).registerAllStandard().done();
