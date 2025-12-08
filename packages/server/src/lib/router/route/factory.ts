import { Env, Input } from 'hono';

import { RouteHandler } from '@server/lib/router/route/handler';

/**
 * Create a new route handler that simplifies the creation of Honoendpoints.
 *
 * Example:
 * ```ts
 * createRouteHandler()
 *  .validate({
 *      param: z.object({ postId: z.string() })
 *  })
 *  .handleQuery(async ({ validated }) => {
 *     return { id: validated.param.postId };
 *  })
 * ```
 */
export const createRouteHandler = <E extends Env, P extends string, I extends Input>() => {
    return new RouteHandler<E, P, I>();
};
