import { Hono } from 'hono';

import { TAuthContext } from '@app/server/lib/auth';
import { authMiddleware } from '@app/server/lib/auth/middleware';
import { createRouteHandler } from '@app/server/lib/router/route';
import { TValidationObject } from '@app/server/lib/router/route/types';

export const createHonoRouter = (
    { isProtected = true }: { isProtected?: boolean } = { isProtected: true }
) => {
    const endpoint = new Hono<{ Variables: TAuthContext }>();

    if (isProtected) {
        endpoint.use(authMiddleware);
    }

    /**
     * Create a new endpoint that requires authentication.
     * @param schema - The validation schema for the endpoint.
     * @returns The endpoint handler.
     */
    const createUserEndpoint = <T extends TValidationObject = Record<never, never>>(schema?: T) => {
        return createRouteHandler().withUser().validate<T>(schema);
    };

    /**
     * Create a new endpoint. This endpoint can be used for both authenticated and unauthenticated routes.
     * @param schema - The validation schema for the endpoint.
     * @returns The endpoint handler.
     *
     * @example
     * ```ts
     * // validation schema defined in .validate call
     * .createEndpoint()
     * .validate({
     *    query: z.object({
     *        page: z.coerce.number().optional(),
     *        limit: z.coerce.number().optional(),
     *    }).partial().optional(),
     * })
     * .handleQuery(async ({ validated }) => {
     *    return validated;
     * })
     *
     * // validation schema defined in createEndpoint call
     * .createEndpoint({
     *    query: z.object({
     *        page: z.coerce.number().optional(),
     *        limit: z.coerce.number().optional(),
     *    }).partial().optional(),
     * })
     * .handleQuery(async ({ validated }) => {
     *    return validated;
     * })
     * ```
     */

    const createEndpoint = <T extends TValidationObject = Record<never, never>>(
        // input?: T | { validation: T; requireAuth: boolean }
        input?: T
    ) => {
        // if (input === undefined) {
        //     return createRouteHandler().validate<T>();
        // }
        // const schema = 'validation' in input ? input.validation : input;
        // const requireAuth = 'requireAuth' in input ? input.requireAuth : false;
        // if (requireAuth) {
        //     return createRouteHandler().validate<T>(schema).withUser();
        // }
        const schema = input;
        return createRouteHandler().validate<T>(schema);
    };

    /**
     * Attach the route handler factory to the router instance.
     * Usage: .get('/', app.j().handleQuery(...))
     */
    return Object.assign(endpoint, {
        createEndpoint,
        createUserEndpoint,
    });
};
