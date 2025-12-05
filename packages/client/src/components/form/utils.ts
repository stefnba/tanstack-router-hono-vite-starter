/**
 * Converts a value to the correct type for the form field.
 * Uses the current field value type to determine the target type.
 * Handles string → number, string → boolean, etc.
 *
 * @param value - The incoming value (usually a string from an input)
 * @param currentValue - The current field value (used to infer the expected type)
 * @returns The value converted to match the currentValue's type
 *
 * @example
 * convertToFormValue('123', 0) // 123 (number)
 * convertToFormValue('hello', '') // 'hello' (string)
 * convertToFormValue('true', false) // true (boolean)
 */
export const convertToFormValue = <T = unknown>(
    value: number | string | boolean,
    currentValue?: T
): T => {
    // If currentValue is provided, infer type from it
    if (currentValue !== undefined && currentValue !== null) {
        if (typeof currentValue === 'number') {
            const num = Number(value);
            return (isNaN(num) ? value : num) as T;
        }
        if (typeof currentValue === 'boolean') {
            return (typeof value === 'boolean' ? value : Boolean(value)) as T;
        }
    }

    // Otherwise return as-is
    return value as T;
};

/**
 * Builds a unique ID for a form field control element (input, select, textarea, switch).
 * Used for the `id` attribute on the control element.
 *
 * @param formId - The unique identifier for the form
 * @param fieldType - The type of field (input, select, textarea, switch)
 * @param fieldName - The name of the field
 * @returns A unique ID string
 *
 * @example
 * buildFormFieldId('user-form', 'input', 'username') // 'user-form-input-username'
 */
export const buildFormFieldId = (
    formId: string,
    fieldType: string,
    fieldName: string,
    fieldOptionId?: string
) => {
    const id = `${formId}-${fieldType}-${fieldName}`;
    if (fieldOptionId) {
        return `${id}-${fieldOptionId}`;
    }
    return id;
};

/**
 * Builds the htmlFor attribute value for a form field label.
 * Must match the ID of the associated form control for accessibility.
 * This is just an alias of buildFormFieldId for semantic clarity.
 *
 * @param formId - The unique identifier for the form
 * @param fieldType - The type of field (input, select, textarea, switch)
 * @param fieldName - The name of the field
 * @returns A unique ID string matching the control's ID
 *
 * @example
 * buildFormLabelFor('user-form', 'input', 'username') // 'user-form-input-username'
 */
export const buildFormLabelFor = buildFormFieldId;

/**
 * Safely converts field value to an array for array-mode fields (like checkboxes).
 * Ensures the value is always an array, even if undefined or null.
 *
 * @param value - The field value that should be an array
 * @returns An array, or empty array if value is not an array
 *
 * @example
 * ensureArray(['a', 'b']) // ['a', 'b']
 * ensureArray(null) // []
 * ensureArray(undefined) // []
 */
export const ensureArray = <T>(value: T | T[] | null | undefined): T[] => {
    if (Array.isArray(value)) {
        return value;
    }
    return [];
};
