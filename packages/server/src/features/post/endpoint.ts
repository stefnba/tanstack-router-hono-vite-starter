import { postContract } from '@app/shared/features/post';

import { postQueries } from '@app/server/features/post/db';
import { postService } from '@app/server/features/post/service';
import { appError } from '@app/server/lib/error';
import { createHonoRouter } from '@app/server/lib/router';

const router = createHonoRouter({ isProtected: true });
export const endpoints = router
    /**
     * Get many posts
     */
    .get(
        '/',
        router
            .createUserEndpoint({
                query: postContract.getMany.endpoint.query,
            })
            .handleQuery(async ({ validated }) => {
                // return appError.server('INTERNAL_ERROR').throw();
                const { pageSize = 10, page = 1 } = validated.query ?? {};

                const posts = await postService.getMany({
                    ids: {
                        userId: validated.user.id,
                    },
                    pagination: {
                        page,
                        pageSize,
                    },
                });

                return posts;
            })
    )
    /**
     * Create a post
     */
    .post(
        '/',
        router
            .createEndpoint()
            .withUser()
            .validate({
                json: postContract.create.endpoint.json,
            })
            .handleMutation(async ({ validated }) => {
                // return appError.server('INTERNAL_ERROR').throw();

                const { title, content } = validated.json;

                const newPost = await postService.create({
                    data: {
                        title,
                        content,
                    },
                    userId: validated.user.id,
                });

                return newPost;
            })
    )
    /**
     * Get a single post
     * Using the raw context to return the post data
     */
    .get(
        '/:id',
        router

            .createEndpoint({
                param: postContract.getById.endpoint.param,
            })
            .withUser()
            .handleQuery(async ({ validated }) => {
                const { id } = validated.param;

                const postData = await postService.getById({
                    ids: { userId: validated.user.id, id },
                });

                // const postData = await postQueries.getFirstRecord({
                //     identifiers: [
                //         { field: 'id', value: id },
                //         { field: 'userId', value: validated.user.id },
                //     ],
                // });

                // if (!postData) {
                //     throw appError.resource('NOT_FOUND').get();
                // }

                return postData;
            })
    )
    /**
     * Delete a post
     */
    .delete(
        '/:id',
        router
            .createEndpoint({
                param: postContract.removeById.endpoint.param,
            })
            .withUser()
            .handleMutation(async ({ validated }) => {
                const { id } = validated.param;

                const deletedPost = await postQueries.deleteRecord({
                    identifiers: [
                        { field: 'id', value: id },
                        { field: 'userId', value: validated.user.id },
                    ],
                });

                if (!deletedPost) {
                    throw appError.resource('NOT_FOUND').get();
                }

                return deletedPost;
            })
    )
    /**
     * Update a post
     */
    .patch(
        '/:id',
        router
            .createEndpoint({
                param: postContract.updateById.endpoint.param,
                json: postContract.updateById.endpoint.json,
            })
            .withUser()
            .handleMutation(async ({ validated }) => {
                const { id } = validated.param;
                const { title, content } = validated.json;

                const updatedPost = await postQueries.updateRecord({
                    identifiers: [
                        { field: 'id', value: id },
                        { field: 'userId', value: validated.user.id },
                    ],
                    data: {
                        title,
                        content,
                    },
                });

                if (!updatedPost) {
                    throw appError.resource('NOT_FOUND').get();
                }

                return updatedPost;
            })
    );
