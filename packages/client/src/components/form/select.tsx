import {
    DeepKeys,
    DeepValue,
    FormAsyncValidateOrFn,
    FormValidateOrFn,
    ReactFormExtendedApi,
} from '@tanstack/react-form';

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/ui/field';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { buildFormFieldId, convertToFormValue } from './utils';

interface FormSelectProps<
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
    React.ComponentProps<typeof Select>,
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
    options:
        | { value: string | number; label: string }[]
        | {
              value: string | number;
              render: (input: { value: string | number; index: number }) => React.ReactNode;
          }[];
    label?: string;
    description?: string;
}

export const FormSelect = <
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
    options,
    name,
    label,
    description,
}: FormSelectProps<
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
                const fieldId = buildFormFieldId(form.formId, 'select', String(name));

                return (
                    <Field orientation="responsive" data-invalid={isInvalid}>
                        <FieldContent>
                            {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
                            {description && <FieldDescription>{description}</FieldDescription>}
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </FieldContent>
                        <Select
                            name={field.name}
                            value={value}
                            onValueChange={(value) =>
                                field.handleChange(convertToFormValue<TFormData, TName>(value))
                            }
                        >
                            <SelectTrigger
                                id={fieldId}
                                aria-invalid={isInvalid}
                                className="min-w-[120px]"
                            >
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent position="item-aligned">
                                {options.map((option, index) => (
                                    <SelectItem key={option.value} value={String(option.value)}>
                                        {typeof option === 'object' && 'label' in option
                                            ? option.label
                                            : option.render({
                                                  value: option.value,
                                                  index,
                                              })}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                );
            }}
        />
    );
};
