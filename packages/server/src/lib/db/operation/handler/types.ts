import z from 'zod';

import { QueryFn } from '@app/server/lib/db/operation/types';

/**
 * Configuration parameters for the query function handler wrapper.
 *
 * @template TInput - The input type for the query function
 * @template TOutput - The output type for the query function
 */
export interface QueryFnHandlerParams<TInput, TOutput> {
    /** The query function to wrap with error handling and validation */
    queryFn: QueryFn<TInput, TOutput>;
    /** Human-readable operation description for logging and error messages */
    operation?: string;
    /** Optional Zod schema to validate input data before execution */
    inputSchema?: z.ZodSchema<TInput, any, any>;
}
