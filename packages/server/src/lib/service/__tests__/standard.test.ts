import { describe, expect, test, vi } from 'vitest';

import { ServiceStandardOperationsBuilder } from '../standard';

describe('ServiceStandardOperationsBuilder', () => {
    // Mock repository operations
    const mockRepo = {
        create: vi.fn(),
        createMany: vi.fn(),
        getById: vi.fn(),
        getMany: vi.fn(),
        updateById: vi.fn(),
        removeById: vi.fn(),
    };

    test('init', () => {
        const builder = ServiceStandardOperationsBuilder.init(mockRepo);
        expect(builder).toBeDefined();
    });

    test('getById', () => {
        const builder = ServiceStandardOperationsBuilder.init(mockRepo).getById();
        const services = builder.done();
        expect(services.getById).toBeDefined();
    });

    test('getMany', () => {
        const builder = ServiceStandardOperationsBuilder.init(mockRepo).getMany();
        const services = builder.done();
        expect(services.getMany).toBeDefined();
    });

    test('create', () => {
        const builder = ServiceStandardOperationsBuilder.init(mockRepo).create();
        const services = builder.done();
        expect(services.create).toBeDefined();
    });

    test('createMany', () => {
        const builder = ServiceStandardOperationsBuilder.init(mockRepo).createMany();
        const services = builder.done();
        expect(services.createMany).toBeDefined();
    });

    test('updateById', () => {
        const builder = ServiceStandardOperationsBuilder.init(mockRepo).updateById();
        const services = builder.done();
        expect(services.updateById).toBeDefined();
    });

    test('removeById', () => {
        const builder = ServiceStandardOperationsBuilder.init(mockRepo).removeById();
        const services = builder.done();
        expect(services.removeById).toBeDefined();
    });

    test('all', () => {
        const builder = ServiceStandardOperationsBuilder.init(mockRepo).all();
        const services = builder.done();
        expect(services.getById).toBeDefined();
        expect(services.getMany).toBeDefined();
        expect(services.create).toBeDefined();
        expect(services.createMany).toBeDefined();
        expect(services.updateById).toBeDefined();
        expect(services.removeById).toBeDefined();
    });

    test('throws if repo operation missing', () => {
        const badRepo = {};
        // Use type assertion to bypass TS check for missing properties if testing runtime behavior
        expect(() => {
            ServiceStandardOperationsBuilder.init(badRepo).getById();
        }).toThrow(/Query .* not part of the repository operations/);
    });

    test('operation wrapper executes repo function', async () => {
        mockRepo.getById.mockResolvedValue({ id: '1' });

        const builder = ServiceStandardOperationsBuilder.init(mockRepo).getById();
        const services = builder.done();

        const result = await services.getById({ ids: { id: '1' } });
        expect(result).toEqual({ id: '1' });
        expect(mockRepo.getById).toHaveBeenCalled();
    });
});
