import { OperationError } from '@server/lib/error/error-type';

import { AppErrorFactory } from './base';

/**
 * Factory for creating Operation Errors (500).
 *
 * Use this for failed operations, usually wrapping a database or external service error.
 */
export class OperationErrorFactory extends AppErrorFactory<OperationError> {
    /**
     * Specifies the operation context that failed.
     *
     * @param action - The action being performed (e.g., 'create', 'sync')
     * @param target - Optional target of the operation
     */
    context(action: string, target?: string): this {
        this.details({
            action,
            ...(target ? { target } : {}),
        });
        return this;
    }

    /**
     * Adds metadata about the state when the error occurred.
     *
     * @param state - Object containing relevant state data
     */
    state(state: Record<string, unknown>): this {
        this.details({ state });
        return this;
    }
}
