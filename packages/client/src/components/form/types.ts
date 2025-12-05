import {
    FormAsyncValidateOrFn,
    FormValidateOrFn,
    ReactFormExtendedApi,
} from '@tanstack/react-form';

/**
 * Type for the app form API.
 * This type definition matches the one used by TanStack Form's `useForm` hook,
 * allowing us to pass the form instance to our custom components without type errors.
 * It ensures compatibility with the validators and strict typing derived from the schema.
 */
export type TAppForm<TFormData> = ReactFormExtendedApi<
    TFormData,
    FormValidateOrFn<TFormData>,
    FormValidateOrFn<TFormData>,
    FormAsyncValidateOrFn<TFormData>,
    FormValidateOrFn<TFormData>,
    FormAsyncValidateOrFn<TFormData>,
    FormValidateOrFn<TFormData>,
    FormAsyncValidateOrFn<TFormData>,
    FormValidateOrFn<TFormData>,
    FormAsyncValidateOrFn<TFormData>,
    FormAsyncValidateOrFn<TFormData>,
    never
>;
