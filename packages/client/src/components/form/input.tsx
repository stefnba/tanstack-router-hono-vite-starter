import {
    DeepKeys,
    FormAsyncValidateOrFn,
    FormValidateOrFn,
    ReactFormExtendedApi,
} from '@tanstack/react-form';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { buildFormFieldId, convertToFormValue } from './utils';

interface FormInputProps<
    TFormData,
    TOnMount extends undefined | FormValidateOrFn<TFormData>,
    TOnChange extends undefined | FormValidateOrFn<TFormData>,
    TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
    TOnBlur extends undefined | FormValidateOrFn<TFormData>,
    TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
    TOnSubmit extends undefined | FormValidateOrFn<TFormData>,
    TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
    TOnDynamic extends undefined | FormValidateOrFn<TFormData>,
    TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
    TOnServer extends undefined | FormAsyncValidateOrFn<TFormData>,
    TSubmitMeta,
    TName extends DeepKeys<TFormData>,
> extends Omit<
    React.ComponentProps<typeof Input>,
    'name' | 'value' | 'onChange' | 'onBlur' | 'form'
> {
    form: ReactFormExtendedApi<
        TFormData,
        TOnMount,
        TOnChange,
        TOnChangeAsync,
        TOnBlur,
        TOnBlurAsync,
        TOnSubmit,
        TOnSubmitAsync,
        TOnDynamic,
        TOnDynamicAsync,
        TOnServer,
        TSubmitMeta
    >;
    name: TName;
    label?: string;
    description?: string;
}

export const FormInput = <
    TFormData,
    TOnMount extends undefined | FormValidateOrFn<TFormData>,
    TOnChange extends undefined | FormValidateOrFn<TFormData>,
    TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
    TOnBlur extends undefined | FormValidateOrFn<TFormData>,
    TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
    TOnSubmit extends undefined | FormValidateOrFn<TFormData>,
    TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
    TOnDynamic extends undefined | FormValidateOrFn<TFormData>,
    TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<TFormData>,
    TOnServer extends undefined | FormAsyncValidateOrFn<TFormData>,
    TSubmitMeta,
    TName extends DeepKeys<TFormData>,
>({
    form,
    name,
    label,
    description,
    placeholder,
    autoComplete,
}: FormInputProps<
    TFormData,
    TOnMount,
    TOnChange,
    TOnChangeAsync,
    TOnBlur,
    TOnBlurAsync,
    TOnSubmit,
    TOnSubmitAsync,
    TOnDynamic,
    TOnDynamicAsync,
    TOnServer,
    TSubmitMeta,
    TName
>) => {
    return (
        <form.Field
            name={name}
            children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const value = field.state.value ? String(field.state.value) : '';
                const fieldId = buildFormFieldId(form.formId, 'input', String(name));

                return (
                    <Field data-invalid={isInvalid}>
                        {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
                        <Input
                            id={fieldId}
                            name={name}
                            value={value}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                                field.handleChange(
                                    convertToFormValue(e.target.value, field.state.value)
                                )
                            }
                            aria-invalid={isInvalid}
                            placeholder={placeholder}
                            autoComplete={autoComplete}
                        />
                        {description && <FieldDescription>{description}</FieldDescription>}
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                );
            }}
        />
    );
};
