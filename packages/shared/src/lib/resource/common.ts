import z from 'zod';

export const paginationSchema = z.object({
    page: z.union([z.string(), z.number()]).pipe(z.coerce.number()).default(1),
    limit: z.union([z.string(), z.number()]).pipe(z.coerce.number()).default(10),
});
