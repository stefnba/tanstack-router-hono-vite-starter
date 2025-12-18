import { ERROR_REGISTRY } from '@app/server/config/error-registry';
import {
    DbError,
    OperationError,
    PermissionError,
    ResourceError,
    ServerError,
    ValidationError,
} from '@app/server/lib/error/error-type';
import {
    TErrorCategory,
    TErrorCodeByCategory,
    TErrorKeys,
} from '@app/server/lib/error/registry/infer';
import { TErrorFactoryParams } from '@app/server/lib/error/types';

import { DbErrorFactory } from './db';
import { OperationErrorFactory } from './operation';
import { PermissionErrorFactory } from './permission';
import { ResourceErrorFactory } from './resource';
import { ServerErrorFactory } from './server';
import { ValidationErrorFactory } from './validation';

/**
 * Helper to build standard error parameters from the registry
 */
const buildErrorParams = <C extends TErrorCategory>(
    category: C,
    code: TErrorCodeByCategory<C>,
    params?: TErrorFactoryParams
) => {
    const definition = ERROR_REGISTRY.get(`${category}.${code}` as TErrorKeys);

    const httpStatus =
        'httpStatus' in definition && definition.httpStatus
            ? definition.httpStatus
            : definition.public.httpStatus;

    return {
        code,
        httpStatus,
        public: definition.public,
        isExpected: definition.isExpected,
        message: params?.message ?? definition.public.message ?? '',
        cause: params?.cause,
        details: params?.details,
        layer: params?.layer,
    };
};

/**
 * Global Error Factory Entry Point.
 *
 * Use this singleton to create any application error.
 * It routes to specific factories based on the error category.
 */
export const appError = {
    /**
     * Create a Server Error (5xx)
     */
    server: (
        code: TErrorCodeByCategory<'SERVER'>,
        params?: TErrorFactoryParams
    ): ServerErrorFactory => {
        return new ServerErrorFactory(new ServerError(buildErrorParams('SERVER', code, params)));
    },

    /**
     * Create a Validation Error (400)
     */
    validation: (
        code: TErrorCodeByCategory<'VALIDATION'>,
        params?: TErrorFactoryParams
    ): ValidationErrorFactory => {
        return new ValidationErrorFactory(
            new ValidationError(buildErrorParams('VALIDATION', code, params))
        );
    },

    /**
     * Create a Resource Error.
     * Use this for errors related to resource existence like not found, already exists,
     * or conflicts. Typically returns 404 or 409 status.
     */
    resource: (
        code: TErrorCodeByCategory<'RESOURCE'>,
        params?: TErrorFactoryParams
    ): ResourceErrorFactory => {
        return new ResourceErrorFactory(
            new ResourceError(buildErrorParams('RESOURCE', code, params))
        );
    },

    /**
     * Create an Operation Error (500)
     */
    operation: (
        code: TErrorCodeByCategory<'OPERATION'>,
        params?: TErrorFactoryParams
    ): OperationErrorFactory => {
        return new OperationErrorFactory(
            new OperationError(buildErrorParams('OPERATION', code, params))
        );
    },

    /**
     * Create a Permission Error (403)
     */
    permission: (
        code: TErrorCodeByCategory<'PERMISSION'>,
        params?: TErrorFactoryParams
    ): PermissionErrorFactory => {
        return new PermissionErrorFactory(
            new PermissionError(buildErrorParams('PERMISSION', code, params))
        );
    },

    /**
     * Create a Database Error
     */
    db: (code: TErrorCodeByCategory<'DB'>, params?: TErrorFactoryParams): DbErrorFactory => {
        return new DbErrorFactory(new DbError(buildErrorParams('DB', code, params)));
    },
};
