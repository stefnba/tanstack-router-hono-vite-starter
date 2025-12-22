import { describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

import { post } from '@app/shared/features/post';
import { defineContract } from '@app/shared/lib/contract/builder';
import { defineResource } from '@app/shared/lib/resource';

import { ServiceBuilder } from '../builder';

// Use post resource as a base since it's already set up
const postResource = defineResource(post)
    .setUserId('userId')
    .setIds(['id'])
    .transform((schema) =>
        schema.extend({
            title: z.string(),
            content: z.string(),
        })
    )
    .done();

const contract = defineContract(postResource)
    .addOperation('customOp', () => ({
        service: z.object({ val: z.string() }),
    }))
    .done();

describe('ServiceBuilder', () => {
    const mockRepo = {
        customQuery: vi.fn(async (args: { val: string }) => ({ result: `processed ${args.val}` })),
    };

    test('initialization', () => {
        const builder = new ServiceBuilder({
            repository: mockRepo,
            contract,
            services: {},
            name: 'post',
        });
        expect(builder).toBeDefined();
    });

    test('registerRepository', () => {
        const builder = new ServiceBuilder({
            repository: {},
            contract,
            services: {},
        });

        const newBuilder = builder.registerRepository(mockRepo);
        // Types should infer the new repository type
        expect(newBuilder).toBeInstanceOf(ServiceBuilder);
    });

    test('registerContract', () => {
        const builder = new ServiceBuilder({
            repository: mockRepo,
            contract: defineContract(postResource).done(),
            services: {},
        });

        const newBuilder = builder.registerContract(contract);
        expect(newBuilder).toBeInstanceOf(ServiceBuilder);
    });

    test('addService with throw on null (default)', async () => {
        const builder = new ServiceBuilder({
            repository: mockRepo,
            contract,
            services: {},
            name: 'post',
        });

        const services = builder
            .addService('customOp', ({ repo }) => ({
                fn: async (input) => {
                    return repo.customQuery(input);
                },
            }))
            .done();

        expect(services.customOp).toBeDefined();

        const result = await services.customOp({ val: 'test' });
        expect(result).toEqual({ result: 'processed test' });
        expect(mockRepo.customQuery).toHaveBeenCalledWith({ val: 'test' });
    });

    test('addService with return on null', async () => {
        const builder = new ServiceBuilder({
            repository: mockRepo,
            contract,
            services: {},
            name: 'post',
        });

        // Mock repo to return null/undefined
        const nullRepo = {
            customQuery: vi.fn(async () => null),
        };

        const services = builder
            .registerRepository(nullRepo)
            .addService('customOp', ({ repo }) => ({
                fn: async (_input) => repo.customQuery(),
                onNull: 'return',
            }))
            .done();

        const result = await services.customOp({ val: 'test' });
        expect(result).toBeNull();
    });

    test('addService throws on null when configured', async () => {
        const builder = new ServiceBuilder({
            repository: mockRepo,
            contract,
            services: {},
            name: 'post',
        });

        const nullRepo = {
            customQuery: vi.fn(async () => null),
        };

        const services = builder
            .registerRepository(nullRepo)
            .addService('customOp', ({ repo }) => ({
                fn: async (_input) => repo.customQuery(),
                onNull: 'throw',
            }))
            .done();

        await expect(services.customOp({ val: 'test' })).rejects.toThrow();
    });

    test('registerStandardOperations', () => {
        // Need a repo with standard operations for this to work
        const standardRepo = {
            create: vi.fn(),
            createMany: vi.fn(),
            getById: vi.fn(),
            getMany: vi.fn(),
            updateById: vi.fn(),
            removeById: vi.fn(),
        };

        const builder = new ServiceBuilder({
            repository: standardRepo,
            contract,
            services: {},
        });

        const services = builder.registerStandardOperations().done();

        expect(services.create).toBeDefined();
        expect(services.getById).toBeDefined();
        // ... others
    });
});
