import {
    DeepKeys,
    DeepValue,
    FieldApi,
    FieldAsyncValidateOrFn,
    FieldValidateOrFn,
    FormAsyncValidateOrFn,
    FormValidateOrFn,
    ReactFormExtendedApi,
} from '@tanstack/react-form';

/**
 * Type for the app form API.
 * This type definition matches the one used by TanStack Form's `useForm` hook,
 * allowing us to pass the form instance to our custom components without type errors.
 * It ensures compatibility with the validators and strict typing derived from the schema.
 *
 * We use 'undefined' as the default for optional generic parameters to match
 * the constraints expected by FieldApi when it interacts with FormApi.
 */
export type TAppForm<TFormData> = ReactFormExtendedApi<
    TFormData,
    FormValidateOrFn<TFormData> | undefined,
    FormValidateOrFn<TFormData> | undefined,
    FormAsyncValidateOrFn<TFormData> | undefined,
    FormValidateOrFn<TFormData> | undefined,
    FormAsyncValidateOrFn<TFormData> | undefined,
    FormValidateOrFn<TFormData> | undefined,
    FormAsyncValidateOrFn<TFormData> | undefined,
    FormValidateOrFn<TFormData> | undefined,
    FormAsyncValidateOrFn<TFormData> | undefined,
    FormAsyncValidateOrFn<TFormData> | undefined,
    never
>;

/**
 * Type for the app form field API.
 * This helper type creates a fully typed FieldApi instance that matches the configuration
 * of TAppForm. It simplifies typing for custom field components.
 *
 * We must use exactly the same types for the Form-level generics as defined in TAppForm above,
 * because FieldApi holds a reference to FormApi.
 */
export type TAppFormField<TFormData, TName extends DeepKeys<TFormData>> = FieldApi<
    TFormData, // TParentData
    TName, // TName
    DeepValue<TFormData, TName>, // TData
    FieldValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>> | undefined, // TOnMount
    FieldValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>> | undefined, // TOnChange
    FieldAsyncValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>> | undefined, // TOnChangeAsync
    FieldValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>> | undefined, // TOnBlur
    FieldAsyncValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>> | undefined, // TOnBlurAsync
    FieldValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>> | undefined, // TOnSubmit
    FieldAsyncValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>> | undefined, // TOnSubmitAsync
    FieldValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>> | undefined, // TOnDynamic
    FieldAsyncValidateOrFn<TFormData, TName, DeepValue<TFormData, TName>> | undefined, // TOnDynamicAsync
    FormValidateOrFn<TFormData> | undefined, // TFormOnMount
    FormValidateOrFn<TFormData> | undefined, // TFormOnChange
    FormAsyncValidateOrFn<TFormData> | undefined, // TFormOnChangeAsync
    FormValidateOrFn<TFormData> | undefined, // TFormOnBlur
    FormAsyncValidateOrFn<TFormData> | undefined, // TFormOnBlurAsync
    FormValidateOrFn<TFormData> | undefined, // TFormOnSubmit
    FormAsyncValidateOrFn<TFormData> | undefined, // TFormOnSubmitAsync
    FormValidateOrFn<TFormData> | undefined, // TFormOnDynamic
    FormAsyncValidateOrFn<TFormData> | undefined, // TFormOnDynamicAsync
    FormAsyncValidateOrFn<TFormData> | undefined, // TFormOnServer
    never // TParentSubmitMeta
>;
