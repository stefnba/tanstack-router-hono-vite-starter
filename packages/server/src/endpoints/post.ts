import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { post } from '@server/db/tables';
import { db } from '@server/lib/db';

import { createHonoRouter } from '../lib/router';

const postSchema = z.object({
    title: z.string(),
    content: z.string(),
});

export const endopints = createHonoRouter({ isProtected: true })
    /**
     * Get a single post
     */
    .get('/:postId', zValidator('param', z.object({ postId: z.string() })), async (c) => {
        const { postId } = c.req.param();

        const postData = await db.query.post.findFirst({
            where: eq(post.id, postId),
        });

        if (!postData) {
            return c.json({ error: 'Post not found' }, 404);
        }

        return c.json(postData);
    })
    /**
     * Get many posts
     */
    .get(
        '/',
        zValidator(
            'query',
            z
                .object({
                    page: z.coerce.number().optional(),
                    limit: z.coerce.number().optional(),
                })
                .partial()
                .optional()
        ),
        async (c) => {
            const { page = 1, limit = 10 } = c.req.valid('query') ?? {};

            try {
                const posts = await db.query.post.findMany({
                    limit,
                    offset: (page - 1) * limit,
                });

                return c.json(posts);
            } catch (error) {
                console.error(error);
                return c.json({ error: 'Failed to get posts' }, 500);
            }
        }
    )
    .post('/', zValidator('json', postSchema), async (c) => {
        const { title, content } = c.req.valid('json');

        const user = c.get('user');
        if (!user) {
            return c.json({ error: 'Unauthorized' }, 401);
        }

        try {
            const newPost = await db
                .insert(post)
                .values({ id: crypto.randomUUID(), title, content, userId: user.id });
            return c.json({ data: newPost }, 201);
        } catch (error) {
            console.error(error);
            return c.json({ data: null, error: 'Failed to create post' }, 500);
        }
    });
