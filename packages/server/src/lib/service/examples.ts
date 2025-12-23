import { postRepository } from '@app/server/features/post/db';
import { defineService } from '@app/server/lib/service';
import { ServiceStandardOperationsBuilder } from '@app/server/lib/service/standard';

const standard = ServiceStandardOperationsBuilder.init(postRepository).all().done();

const getByIdResult = await standard.getById({
    ids: { userId: '123', id: '123' },
});

console.log(getByIdResult);

const defineBuilder = defineService('post')
    .registerRepository(postRepository)
    .registerStandardOperations()
    .addService('custom', () => ({
        fn: async () => {
            if (Math.random() > 0.5) {
                return null;
            }
            return Promise.resolve({
                id: '123',
                title: 'Test',
                content: 'Test',
                userId: '123',
            });
        },
        onNull: 'return',
    }))
    .done();

const customResult = await defineBuilder.getById({ ids: { userId: '123', id: '123' } });
