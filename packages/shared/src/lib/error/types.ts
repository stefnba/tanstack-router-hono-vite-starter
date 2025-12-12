import {
    ClientErrorStatusCode,
    ContentfulStatusCode,
    ServerErrorStatusCode,
} from 'hono/utils/http-status';

/**
 * HTTP status code mapping type
 *
 * Maps error codes to HTTP status codes for API responses.
 */
export type THttpStatusCodeMapping = Record<string, ContentfulStatusCode>;

export type ErrorStatusCode = ClientErrorStatusCode | ServerErrorStatusCode;
