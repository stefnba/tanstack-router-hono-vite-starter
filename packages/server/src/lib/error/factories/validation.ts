import { ZodError } from 'zod';

import { ValidationError } from '@app/server/lib/error/error-type';

import { AppErrorFactory } from './base';

/**
 * Factory for creating Validation Errors (400).
 *
 * Use this for invalid input, form errors, or data integrity issues.
 */
export class ValidationErrorFactory extends AppErrorFactory<ValidationError> {
    /**
     * Automatically extracts field errors from a ZodError and attaches them
     * to the error details.
     *
     * @param zodError - The original ZodError caught from validation
     */
    fromZod(zodError: ZodError): this {
        const flattened = zodError.flatten();

        this.details({
            fieldErrors: flattened.fieldErrors,
            formErrors: flattened.formErrors,
        });

        // Attach original error as cause for debugging
        this.cause(zodError);

        return this;
    }
}
