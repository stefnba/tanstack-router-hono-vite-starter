import { describe, expect, test } from 'vitest';
import z from 'zod';

import { post } from '@app/shared/features/post';
import { defineContract } from '@app/shared/lib/contract/builder';
import { defineResource } from '@app/shared/lib/resource';

import { defineRepository } from '@app/server/lib/db/repository';
import { createTestUser } from '@app/server/test/utils/create-user';

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
    .enablePagination()
    .enableFilters({
        title: z.string(),
        content: z.string(),
    })
    .done();

const contract = defineContract(postResource).done();

const repository = defineRepository(postResource)
    .registerContract(contract)
    .registerStandardOperations()
    .done();

describe('Define Repository', () => {
    let user: Awaited<ReturnType<typeof createTestUser>>;
    let createdPost: Awaited<ReturnType<typeof repository.create>>;

    test('setup', async () => {
        user = await createTestUser();
        expect(user).toBeDefined();
    });

    test('standard create', async () => {
        createdPost = await repository.create({
            data: { title: 'Repo Test', content: 'Repo Content' },
            userId: user.id,
        });

        expect(createdPost).toBeDefined();
        expect(createdPost.title).toBe('Repo Test');
        expect(createdPost.content).toBe('Repo Content');
        expect(createdPost.userId).toBe(user.id);
    });

    test('standard createMany', async () => {
        const createdMany = await repository.createMany({
            data: [
                { title: 'Repo Many 1', content: 'Content 1' },
                { title: 'Repo Many 2', content: 'Content 2' },
            ],
            userId: user.id,
        });

        expect(createdMany).toHaveLength(2);
        expect(createdMany[0].title).toBe('Repo Many 1');
        expect(createdMany[1].title).toBe('Repo Many 2');
    });

    test('standard getMany', async () => {
        const many = await repository.getMany({
            ids: { userId: user.id },
            pagination: { page: 1, pageSize: 10 },
        });

        // Should include created + createdMany (1 + 2 = 3)
        expect(many).toHaveLength(3);
    });

    test('standard getById', async () => {
        const found = await repository.getById({
            ids: { userId: user.id, id: createdPost.id },
        });

        expect(found).toBeDefined();
        expect(found?.id).toBe(createdPost.id);
    });

    test('standard updateById', async () => {
        const updated = await repository.updateById({
            data: { title: 'Repo Updated', content: 'Updated Content' },
            ids: { userId: user.id, id: createdPost.id },
        });

        expect(updated).toBeDefined();
        if (updated) {
            expect(updated.title).toBe('Repo Updated');
        }

        // Verify update with getById
        const verifyUpdate = await repository.getById({
            ids: { userId: user.id, id: createdPost.id },
        });
        expect(verifyUpdate?.title).toBe('Repo Updated');
    });

    test('standard removeById', async () => {
        await repository.removeById({
            ids: { userId: user.id, id: createdPost.id },
        });

        const verifyRemove = await repository.getById({
            ids: { userId: user.id, id: createdPost.id },
        });
        expect(verifyRemove).toBeDefined();
        if (verifyRemove) {
            expect(verifyRemove.isActive).toBe(false);
        }

        // Verify remaining count (should still find it if we don't filter out inactive)
        const remaining = await repository.getMany({
            ids: { userId: user.id },
        });

        expect(remaining).toHaveLength(3);
    });

    test('can add custom queries', async () => {
        const customRepo = defineRepository(postResource)
            .registerContract(
                defineContract(postResource)
                    .addOperation('customCount', () => ({
                        query: z.object({}),
                    }))
                    .done()
            )
            .addQuery('customCount', ({ tableOps }) => ({
                fn: async () => {
                    const records = await tableOps.getManyRecords();
                    return records.length;
                },
            }))
            .done();

        const count = await customRepo.customCount({});
        expect(typeof count).toBe('number');
    });
});
