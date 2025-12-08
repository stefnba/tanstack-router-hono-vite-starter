import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';

import { post } from '@server/db/tables';
import { db } from '@server/lib/db';
import { createRouteHandler } from '@server/lib/router/route';

import { createHonoRouter } from '../lib/router';

const postSchema = z.object({
    title: z.string(),
    content: z.string(),
});

export const endopints = createHonoRouter({ isProtected: true })
    /**
     * Get many posts
     */
    .get(
        '/',
        createRouteHandler()
            .validate({
                param: z
                    .object({
                        postId: z.string().optional(),
                    })
                    .optional(),
                // json: postSchema.optional(),
                query: z
                    .object({
                        page: z.coerce.number().optional(),
                        limit: z.coerce.number().optional(),
                    })
                    .partial()
                    .optional(),
            })
            .withUser()
            .handleQuery(async ({ validated }) => {
                const { limit, page } = validated.query ?? {
                    limit: 10,
                    page: 0,
                };
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
        createRouteHandler()
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
        createRouteHandler()
            .validate({
                param: z.object({
                    postId: z.string(),
                }),
            })
            .handleQuery(async ({ validated }) => {
                const { postId } = validated.param;

                const postData = await db.query.post.findFirst({
                    where: eq(post.id, postId),
                });

                if (!postData) {
                    throw new HTTPException(404, { message: 'Post not found' });
                }

                return postData;
            })
    );
