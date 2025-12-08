import { Context, Env, Input } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { SuccessStatusCode } from 'hono/utils/http-status';
import { JSONValue } from 'hono/utils/types';
import z from 'zod';

import { TAuthUser, getUser } from '@server/lib/auth';
import { TValidationObject } from '@server/lib/router/route/types';

import { typedEntries } from '@shared/lib/utils';
import { Prettify } from '@shared/types/utils';

export class RouteHandler<E extends Env, P extends string, I extends Input> {
    private requireAuth: boolean = false;
    private schemas: TValidationObject = {};

    constructor(
        input: {
            schemas: TValidationObject;
            requireAuth: boolean;
        } = { schemas: {}, requireAuth: false }
    ) {
        this.schemas = input.schemas;
        this.requireAuth = input.requireAuth;
    }

    /**
     * Require authentication for the route.
     * This will add a `user` property to the validated input.
     *
     * Example:
     * ```ts
     * .withUser()
     * .handleQuery(async ({ validated }) => {
     *    const { user } = validated;
     *    console.log(user.id);
     * })
     * ```
     */
    withUser() {
        type NewUserOut = { user: Prettify<TAuthUser> };

        // Explicitly merge 'out' to include user
        type MergedInput = {
            in: I['in'];
            out: Prettify<I['out'] & NewUserOut>;
        };

        return new RouteHandler<E, P, MergedInput>({
            schemas: { ...this.schemas },
            requireAuth: true,
        });
    }

    /**
     * Validate the input using Zod schemas.
     * This will add the validated data to the validated input.
     *
     * Example:
     * ```ts
     * .validate({
     *    json: z.object({ title: z.string() }),
     *    query: z.object({ page: z.coerce.number() })
     * })
     * ```
     */
    validate<T extends TValidationObject = Record<never, never>>(schema?: T) {
        // 1. Define the new schema input/output structure
        type NewSchema = {
            in: { [K in keyof T]: z.input<T[K]> };
            out: { [K in keyof T]: z.output<T[K]> };
        };

        // 2. Explicitly merge the 'in' and 'out' properties from previous 'I' and new 'NewSchema'
        type MergedInput = {
            in: Prettify<I['in'] & NewSchema['in']>;
            out: Prettify<I['out'] & NewSchema['out']>;
        };

        // 3. Pass this cleaner, manually merged type to the new handler
        return new RouteHandler<E, P, MergedInput>({
            schemas: { ...this.schemas, ...schema },
            requireAuth: this.requireAuth,
        });
    }
    // validate<T extends TValidationObject = Record<never, never>>(schema?: T) {
    //     type SchemaToInput<T> = {
    //         in: Prettify<{ [K in keyof T]: z.input<T[K]> }>;
    //         out: Prettify<{ [K in keyof T]: z.output<T[K]> }>;
    //     };

    //     return new RouteHandler<E, P, Prettify<I & Prettify<SchemaToInput<T>>>>({
    //         schemas: { ...this.schemas, ...schema },
    //         requireAuth: this.requireAuth,
    //     });
    // }

    private async prepareRequest(c: Context<E, P, I>): Promise<I['out']> {
        let validatedInputFinal: I['out'] = {};

        // get user
        if (this.requireAuth) {
            const user = getUser(c);
            if (!user) {
                throw new HTTPException(401, { message: 'Unauthorized' });
            }
            validatedInputFinal = { ...validatedInputFinal, user };
        }

        // get validated input
        validatedInputFinal = {
            ...validatedInputFinal,
            ...(await this.getValidatedInput(c)),
        };

        return validatedInputFinal;
    }

    /**
     * Handle a query request (GET).
     * The handler should return the data directly.
     * The response will be automatically wrapped in a JSON response with status 200.
     *
     * Example:
     * ```ts
     * .handleQuery(async ({ validated }) => {
     *    const { postId } = validated.param;
     *    const post = await db.query.post.findFirst({
     *        where: eq(post.id, postId),
     *    });
     *    return post;
     * })
     * ```
     */
    handleQuery<R extends JSONValue>(
        handler: ({ c, validated }: { c: Context<E, P, I>; validated: I['out'] }) => R | Promise<R>
    ) {
        // Explicitly declare return type for correct client inference
        return async (c: Context<E, P, I>) => {
            const validatedInputFinal = await this.prepareRequest(c);

            try {
                const result = await handler({ c, validated: validatedInputFinal });
                return c.json(result, 200);
            } catch (error) {
                console.error(error);
                if (error instanceof HTTPException) {
                    throw error;
                }
                throw new HTTPException(500, { message: 'Internal server error' });
            }
        };
    }

    /**
     * Handle a mutation request (POST, PUT, DELETE, PATCH).
     * The handler should return the data directly.
     * The response will be wrapped in a standard success envelope: `{ success: true, data: result }`.
     *
     * Example:
     * ```ts
     * .handleMutation(async ({ validated }) => {
     *    const { title } = validated.json;
     *    const newPost = await db.insert(post).values({ title }).returning();
     *    return newPost;
     * })
     * ```
     */
    handleMutation<R extends JSONValue>(
        handler: ({ c, validated }: { c: Context<E, P, I>; validated: I['out'] }) => R | Promise<R>,
        status: Exclude<SuccessStatusCode, 204 | 205> = 201
    ) {
        return async (c: Context<E, P, I>) => {
            const validatedInputFinal = await this.prepareRequest(c);

            try {
                const result = await handler({ c, validated: validatedInputFinal });
                return c.json(
                    {
                        success: true,
                        data: result,
                    },
                    status
                );
            } catch (error) {
                console.error(error);
                if (error instanceof HTTPException) {
                    throw error;
                }
                throw new HTTPException(500, { message: 'Internal server error' });
            }
        };
    }

    private async getValidatedInput(c: Context<E, P, I>): Promise<I['out']> {
        if (!this.schemas) {
            return {};
        }

        const validatedInput: Record<string, unknown> = {};

        for (const [target, schema] of typedEntries(this.schemas)) {
            let value: unknown;

            // console.log('target', target);

            switch (target) {
                case 'json':
                    try {
                        value = await c.req.json();
                    } catch {
                        value = {};
                    }
                    break;
                case 'query':
                    value = c.req.query();
                    break;
                case 'param':
                    value = c.req.param();
                    break;
                case 'form':
                    try {
                        value = await c.req.parseBody();
                    } catch {
                        value = {};
                    }
                    break;
                case 'header':
                    value = c.req.header();
                    break;
            }

            if (value !== undefined && schema) {
                // console.log('result', value);
                const result = schema.safeParse(value);

                if (!result.success) {
                    // const zodError = z.prettifyError(result.error);
                    // console.log('zodError', zodError);
                    // console.log('zodError flattened');
                    // todo improve error message
                    throw new HTTPException(400, {
                        message: JSON.stringify(z.flattenError(result.error).fieldErrors),
                    });
                }

                validatedInput[target] = result.data;
            }
        }

        return validatedInput;
    }
}
