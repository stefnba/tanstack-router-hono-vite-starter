/**
 * Table Operations - Generic low-level database CRUD operations.
 *
 * This module provides the TableOperationBuilder class for direct table manipulation
 * without feature-specific business logic.
 *
 * @example
 * ```typescript
 * import { TableOperationBuilder } from '@/server/lib/db/query/table-operations';
 *
 * const tableOps = new TableOperationBuilder(userTable);
 * const user = await tableOps.createRecord({
 *   data: { name: 'John', email: 'john@example.com' }
 * });
 * ```
 */

export { TableOperationBuilder } from './core';
export type {
    RequiredOnly,
    DrizzleBooleanFilter,
    TOnConflict,
    TOrderBy,
    Pagination,
    TValidTableForFrom,
} from './types';
