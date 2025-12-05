import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import { createHonoRouter } from '../lib/router';

const posts = [
    {
        id: 1,
        title: 'Post 1',
        content: 'Content 1',
    },
    {
        id: 2,
        title: 'Post 2',
        content: 'Content 2',
    },
    {
        id: 3,
        title: 'Post 3',
        content: 'Content 3',
    },
    {
        id: 4,
        title: 'Post 4',
        content: 'Content 4',
    },
    {
        id: 5,
        title: 'Post 5',
        content: 'Content 5',
    },
];

export const endopints = createHonoRouter({ isProtected: false })
    /**
     * Get a single post
     */
    .get('/:postId', zValidator('param', z.object({ postId: z.string() })), async (c) => {
        const { postId } = c.req.param();

        const post = posts.find((post) => post.id === parseInt(postId));

        if (!post) {
            return c.json({ error: 'Post not found' }, 404);
        }

        return c.json(post);
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

            return c.json(posts.slice((page - 1) * limit, page * limit));
        }
    );
