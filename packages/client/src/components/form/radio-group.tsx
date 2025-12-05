import {
    DeepKeys,
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
    FieldLegend,
    FieldSet,
    FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Switch } from '../ui/switch';
import { buildFormFieldId, convertToFormValue } from './utils';

interface FormRadioGroupProps<
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
    options: {
        id: string;
        label: string;
        description?: string;
    }[];
}

export const FormRadioGroup = <
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
    options,
}: FormRadioGroupProps<
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

                return (
                    <FieldSet>
                        <FieldLegend>Plan</FieldLegend>
                        <FieldDescription>
                            You can upgrade or downgrade your plan at any time.
                        </FieldDescription>
                        <RadioGroup
                            name={field.name}
                            value={value}
                            onValueChange={(value) =>
                                field.handleChange(convertToFormValue<TFormData, TName>(value))
                            }
                        >
                            {options.map((option) => {
                                const fieldId = buildFormFieldId(
                                    form.formId,
                                    'radiogroup',
                                    String(name),
                                    option.id
                                );

                                return (
                                    <FieldLabel key={option.id} htmlFor={fieldId}>
                                        <Field orientation="horizontal" data-invalid={isInvalid}>
                                            <FieldContent>
                                                <FieldTitle>{option.label}</FieldTitle>
                                                {option.description && (
                                                    <FieldDescription>
                                                        {option.description}
                                                    </FieldDescription>
                                                )}
                                            </FieldContent>
                                            <RadioGroupItem
                                                value={option.id}
                                                id={fieldId}
                                                aria-invalid={isInvalid}
                                            />
                                        </Field>
                                    </FieldLabel>
                                );
                            })}
                        </RadioGroup>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </FieldSet>
                );
            }}
        />
    );
};
