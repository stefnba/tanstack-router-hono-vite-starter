import { DeepKeys, DeepValue } from '@tanstack/react-form';

/**
 * Converts a value to the correct type for the form.
 * We need to check if the value is a number to prevent string concatenation
 * when using the input type="number" or boolean for the switch component. The field.handleChange expects the
 * same type as the field value, so we cast it to DeepValue<TFormData, TName>.
 */
export const convertToFormValue = <TFormData, TName extends DeepKeys<TFormData>>(
    value: number | string | boolean
): DeepValue<TFormData, TName> => {
    let formValue = value;

    if (typeof value === 'number') {
        formValue = Number(value);
    }
    if (typeof value === 'boolean') {
        formValue = Boolean(value);
    }
    if (typeof value === 'string') {
        formValue = String(value);
    }
    return formValue as DeepValue<TFormData, TName>;
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
