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
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { Checkbox } from '../ui/checkbox';
import { buildFormFieldId, ensureArray } from './utils';

interface FormCheckboxProps<
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

export const FormCheckbox = <
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
}: FormCheckboxProps<
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
            mode="array"
            children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const values = ensureArray(field.state.value);

                type ArrayElement = typeof field.pushValue extends (value: infer T) => unknown
                    ? T
                    : never;

                return (
                    <FieldSet>
                        {label && <FieldLegend variant="label">{label}</FieldLegend>}
                        {description && <FieldDescription>{description}</FieldDescription>}
                        <FieldGroup data-slot="checkbox-group">
                            {options.map((option) => {
                                const optionValue = option.id;
                                const checked = values.some((v) => String(v) === option.id);
                                const fieldId = buildFormFieldId(
                                    form.formId,
                                    'checkbox',
                                    String(name),
                                    optionValue
                                );
                                return (
                                    <Field
                                        key={option.id}
                                        orientation="horizontal"
                                        data-invalid={isInvalid}
                                    >
                                        <Checkbox
                                            id={fieldId}
                                            name={field.name}
                                            aria-invalid={isInvalid}
                                            checked={checked}
                                            onCheckedChange={(isChecked) => {
                                                if (isChecked) {
                                                    field.pushValue(optionValue as ArrayElement);
                                                } else {
                                                    const index = values.findIndex(
                                                        (v) => String(v) === option.id
                                                    );
                                                    if (index > -1) {
                                                        field.removeValue(index);
                                                    }
                                                }
                                            }}
                                        />
                                        <FieldContent>
                                            <FieldLabel htmlFor={fieldId} className="font-normal">
                                                {option.label}
                                            </FieldLabel>
                                            {option.description && (
                                                <FieldDescription>
                                                    {option.description}
                                                </FieldDescription>
                                            )}
                                        </FieldContent>
                                    </Field>
                                );
                            })}
                        </FieldGroup>
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </FieldSet>
                );
            }}
        />
    );
};
