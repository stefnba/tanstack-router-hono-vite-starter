import { ResourceError } from '@app/server/lib/error/error-type';

import { AppErrorFactory } from './base';

/**
 * Factory for creating Resource Errors (404, 409).
 *
 * Use this for not found errors or conflict errors.
 */
export class ResourceErrorFactory extends AppErrorFactory<ResourceError> {
    /**
     * Specifies the resource that caused the error.
     *
     * @param name - Name of the resource (e.g., 'User', 'Post')
     * @param identifier - Optional ID or key that was looked up
     */
    withResource(name: string, identifier?: string | number): this {
        this.details({
            resource: name,
            ...(identifier ? { identifier } : {}),
        });
        return this;
    }

    /**
     * Specifies the field that caused a conflict (for ALREADY_EXISTS).
     *
     * @param field - The field name that is not unique
     * @param value - Optional value that conflicted
     */
    conflict(field: string, value?: unknown): this {
        this.details({
            conflictField: field,
            ...(value ? { conflictValue: value } : {}),
        });
        return this;
    }
}
