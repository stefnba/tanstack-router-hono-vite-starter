import { DeepKeys } from '@tanstack/react-form';

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldLegend,
    FieldSet,
    FieldTitle,
} from '@app/client/components/ui/field';
import { Input } from '@app/client/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@app/client/components/ui/radio-group';

import { TAppForm } from './types';
import { buildFormFieldId, convertToFormValue } from './utils';

interface FormRadioGroupProps<TFormData, TName extends DeepKeys<TFormData>> extends Omit<
    React.ComponentProps<typeof Input>,
    'name' | 'value' | 'onChange' | 'onBlur' | 'form'
> {
    form: TAppForm<TFormData>;
    name: TName;
    label?: string;
    description?: string;
    options: {
        id: string;
        label: string;
        description?: string;
    }[];
}

export const FormRadioGroup = <TFormData, TName extends DeepKeys<TFormData>>({
    form,
    name,
    label,
    description,
    options,
}: FormRadioGroupProps<TFormData, TName>) => {
    return (
        <form.Field
            name={name}
            children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const value = field.state.value ? String(field.state.value) : '';

                return (
                    <FieldSet>
                        {label && <FieldLegend>{label}</FieldLegend>}
                        {description && <FieldDescription>{description}</FieldDescription>}
                        <RadioGroup
                            name={field.name}
                            value={value}
                            onValueChange={(value) =>
                                field.handleChange(convertToFormValue(value, field.state.value))
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
