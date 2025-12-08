import { and, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';

import { post } from '@server/db/tables';
import { db } from '@server/lib/db';

import { createHonoRouter } from '../lib/router';

const postSchema = z.object({
    title: z.string(),
    content: z.string(),
});

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
                const { limit = 10, page = 0 } = validated.query ?? {};
                const posts = await db.query.post.findMany({
                    where: eq(post.userId, validated.user.id),
                    limit: limit,
                    offset: page,
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
                json: postSchema,
            })
            .handleMutation(async ({ validated }) => {
                const { title, content } = validated.json;

                const [newPost] = await db
                    .insert(post)
                    .values({
                        id: crypto.randomUUID(),
                        title,
                        content,
                        userId: validated.user.id,
                    })
                    .returning();

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

                const postData = await db.query.post.findFirst({
                    where: and(eq(post.id, postId), eq(post.userId, validated.user.id)),
                });

                if (!postData) {
                    throw new HTTPException(404, { message: 'Post not found' });
                }

                return postData;
            })
    );
