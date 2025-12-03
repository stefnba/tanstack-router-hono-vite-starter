import z from 'zod';

export const postSchema = z.object({
    id: z.number(),
    title: z.string(),
    content: z.string(),
});
