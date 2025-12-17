import { and, eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';

import { post } from '@server/db/tables';
import { db } from '@server/lib/db';
import { TableOperationsBuilder } from '@server/lib/db/operation/table/core';
import { appError } from '@server/lib/error';

import { createHonoRouter } from '../lib/router';

const postQueries = new TableOperationsBuilder(post);

const postSchema = z.object({
    title: z.string(),
    content: z.string(),
});

const postInsert = createInsertSchema(post);

const paginationSchema = z
    .object({
        page: z.union([z.string(), z.number()]).pipe(z.coerce.number()).default(1),
        limit: z.union([z.string(), z.number()]).pipe(z.coerce.number()).default(10),
    })
    .optional();

const router = createHonoRouter({ isProtected: true });
export const endopints = router
    /**
     * Get many posts
     */
    .get(
        '/',
        router
            .createUserEndpoint({
                query: paginationSchema,
            })
            .handleQuery(async ({ validated }) => {
                // return appError.server('INTERNAL_ERROR').throw();
                const { limit = 10, page = 0 } = validated.query ?? {};

                const posts = await postQueries.getManyRecords({
                    identifiers: [{ field: 'userId', value: validated.user.id }],
                    pagination: {
                        page,
                        pageSize: limit,
                    },
                });

                // const posts = await db.query.post.findMany({
                //     where: eq(post.userId, validated.user.id),
                //     limit: limit,
                //     offset: page,
                // });

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
                json: postInsert,
            })
            .handleMutation(async ({ validated }) => {
                // return appError.server('INTERNAL_ERROR').throw();

                const { title, content } = validated.json;

                const newPost = await postQueries.createRecord({
                    data: {
                        title,
                        content,
                        userId: validated.user.id,
                    },
                });

                return newPost;
            })
    )
    /**
     * Get a single post
     * Using the raw context to return the post data
     */
    .get(
        '/:postId',
        router

            .createEndpoint({
                param: z.object({
                    postId: z.string(),
                }),
            })
            .withUser()
            .handleQuery(async ({ validated }) => {
                const { postId } = validated.param;

                const postData = await postQueries.getFirstRecord({
                    identifiers: [
                        { field: 'id', value: postId },
                        { field: 'userId', value: validated.user.id },
                    ],
                });

                if (!postData) {
                    throw new HTTPException(404, { message: 'Post not found' });
                }

                return postData;
            })
    )
    .delete(
        '/:postId',
        router
            .createEndpoint({
                param: z.object({
                    postId: z.string(),
                }),
            })
            .withUser()
            .handleMutation(async ({ validated }) => {
                const { postId } = validated.param;

                const deletedPost = await postQueries.deleteRecord({
                    identifiers: [
                        { field: 'id', value: postId },
                        { field: 'userId', value: validated.user.id },
                    ],
                });

                return deletedPost;
            })
    );
