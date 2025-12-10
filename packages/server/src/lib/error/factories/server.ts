import { ServerError } from '@server/lib/error/error-type';

import { AppErrorFactory } from './base';

/**
 * Factory for creating Server Errors (5xx).
 *
 * Use this for internal errors, database failures, or infrastructure issues.
 */
export class ServerErrorFactory extends AppErrorFactory<ServerError> {
    // Add server-specific builder methods here in the future
    // e.g., .retryable() or .critical()
}
