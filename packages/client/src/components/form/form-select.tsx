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
import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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

                const handleChange = (value: string) => {
                    // We need to check if the value is a number to prevent string concatenation
                    // when using the input type="number". The field.handleChange expects the
                    // same type as the field value, so we cast it to DeepValue<TFormData, TName>.
                    if (typeof field.state.value === 'number') {
                        field.handleChange(Number(value) as DeepValue<TFormData, TName>);
                        return;
                    }
                    field.handleChange(value as DeepValue<TFormData, TName>);
                };

                return (
                    // <Field data-invalid={isInvalid}>
                    //     {label && (
                    //         <FieldLabel htmlFor={`form-input-${String(name)}`}>{label}</FieldLabel>
                    //     )}

                    //     <Input
                    //         id={`form-tanstack-input-${String(name)}`}
                    //         name={name}
                    //         value={value}
                    //         onBlur={field.handleBlur}
                    //         onChange={(e) => handleChange(e.target.value)}
                    //         aria-invalid={isInvalid}
                    //         placeholder={placeholder}
                    //         autoComplete={autoComplete}
                    //     />
                    //     {description && <FieldDescription>{description}</FieldDescription>}
                    //     {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    // </Field>
                    <Field orientation="responsive" data-invalid={isInvalid}>
                        <FieldContent>
                            {label && (
                                <FieldLabel htmlFor={`form-select-${String(name)}`}>
                                    {label}
                                </FieldLabel>
                            )}
                            {description && <FieldDescription>{description}</FieldDescription>}
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </FieldContent>
                        <Select name={field.name} value={value} onValueChange={handleChange}>
                            <SelectTrigger
                                id={`form-select-${String(name)}`}
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
