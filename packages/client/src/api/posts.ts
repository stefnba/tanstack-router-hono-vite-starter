import { apiClient } from '@app/client/lib/api/client';
import { createMutationOptions } from '@app/client/lib/api/mutation';
import { createQueryOptions } from '@app/client/lib/api/query';

const KEYS = {
    POSTS: 'posts',
    POST: 'post',
} as const;

export const posts = {
    getMany: createQueryOptions(apiClient.posts.$get, KEYS.POSTS, {
        staleTime: 1000 * 60 * 1,
    }),
    getOne: createQueryOptions(apiClient.posts[':id'].$get, KEYS.POST),
    create: createMutationOptions(apiClient.posts.$post, KEYS.POSTS),
    delete: createMutationOptions(apiClient.posts[':postId'].$delete, KEYS.POSTS),
};
