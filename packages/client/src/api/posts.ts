import { apiClient } from '@/lib/api/client';
import { createQueryOptions } from '@/lib/api/query';

export const posts = {
    getMany: createQueryOptions(apiClient.posts.$get, 'posts', {
        staleTime: 1000 * 60 * 1,
    }),
    getOne: createQueryOptions(apiClient.posts[':postId'].$get, 'posts'),
    // create: createQueryOptions(apiClient.posts.$post, 'posts'),
    // update: createQueryOptions(apiClient.posts[':postId'].$put, 'posts'),
    // delete: createQueryOptions(apiClient.posts[':postId'].$delete, 'posts'),
};
