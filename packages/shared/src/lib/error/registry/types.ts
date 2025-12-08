import { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * The definition of a public error registry
 */
export type TPublicErrorRegistryDefinition = {
    /** Default human text (fallback). Prefer using i18nKey on the client. */
    message?: string;
    /** The HTTP status code that should be returned for this error. Override the internal status code. */
    httpStatus: ContentfulStatusCode;
    /** i18n lookup key used by the frontend. */
    i18nKey?: string;
};

/**
 * The definition of a public error registry with a code.
 */
export type TPublicErrorRegistryDefinitionWithCode = TPublicErrorRegistryDefinition & {
    code: string;
};

/**
 * The public error record is a record of public error definitions with the error code as the key and the public error definition as the value
 */
export type TPublicErrorRegistry = Record<string, TPublicErrorRegistryDefinition>;

/**
 * The output type for the public error registry is a transformed version of the input type with the code added in addition to the message
 */
export type TPublicErrorRegistryOutput<T extends TPublicErrorRegistry> = {
    [K in keyof T]: Readonly<{
        code: K;
        /** Default human text (fallback). Prefer using i18nKey on the client. */
        message: T[K]['message'] extends string ? T[K]['message'] : undefined;
        /** i18n lookup key used by the frontend. */
        i18nKey: T[K]['i18nKey'] extends string ? T[K]['i18nKey'] : `ERRORS.${K & string}`;
        /** The HTTP status code that should be returned for this error. Override the internal status code. */
        httpStatus: T[K]['httpStatus'] extends ContentfulStatusCode
            ? T[K]['httpStatus']
            : undefined;
    }>;
};
