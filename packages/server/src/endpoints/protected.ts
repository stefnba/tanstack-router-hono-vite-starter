import { getUser } from '../lib/auth';
import { createHonoRouter } from '../lib/router';

export const endopints = createHonoRouter({ isProtected: true }).get('/', async (c) => {
    const user = getUser(c);
    return c.json([
        {
            id: 1,
            title: 'Post 1 Protected',
            content: 'Content 1',
            protected: true,
            user: user.id,
        },
        {
            id: 2,
            title: 'Post 2 Protected',
            content: 'Content 2',
            protected: true,
            user: user.id,
        },
        {
            id: 3,
            title: 'Post 3 Protected',
            content: 'Content 3',
            protected: true,
            user: user.id,
        },
    ]);
});
