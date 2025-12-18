import { PermissionError } from '@app/server/lib/error/error-type';

import { AppErrorFactory } from './base';

/**
 * Factory for creating Permission Errors (403).
 *
 * Use this for access control failures, missing roles, or insufficient privileges.
 */
export class PermissionErrorFactory extends AppErrorFactory<PermissionError> {
    /**
     * Specifies the role that was required but missing.
     *
     * @param role - The required role
     */
    requiredRole(role: string): this {
        this.details({ requiredRole: role });
        return this;
    }

    /**
     * Specifies the permission/scope that was required but missing.
     *
     * @param permission - The required permission
     */
    requiredPermission(permission: string): this {
        this.details({ requiredPermission: permission });
        return this;
    }
}
