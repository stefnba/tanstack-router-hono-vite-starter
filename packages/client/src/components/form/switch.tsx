import { DeepKeys } from '@tanstack/react-form';

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { Switch } from '../ui/switch';
import { TAppForm } from './types';
import { buildFormFieldId, convertToFormValue } from './utils';

interface FormSwitchProps<TFormData, TName extends DeepKeys<TFormData>> extends Omit<
    React.ComponentProps<typeof Input>,
    'name' | 'value' | 'onChange' | 'onBlur' | 'form'
> {
    form: TAppForm<TFormData>;
    name: TName;
    label?: string;
    description?: string;
}

export const FormSwitch = <TFormData, TName extends DeepKeys<TFormData>>({
    form,
    name,
    label,
    description,
}: FormSwitchProps<TFormData, TName>) => {
    return (
        <form.Field
            name={name}
            children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const value = field.state.value ? Boolean(field.state.value) : false;

                const fieldId = buildFormFieldId(form.formId, 'switch', String(name));

                return (
                    <Field orientation="horizontal" data-invalid={isInvalid}>
                        <FieldContent>
                            {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
                            {description && <FieldDescription>{description}</FieldDescription>}
                            {isInvalid && <FieldError errors={field.state.meta.errors} />}
                        </FieldContent>
                        <Switch
                            id={fieldId}
                            name={field.name}
                            checked={value}
                            onCheckedChange={(value) =>
                                field.handleChange(convertToFormValue(value, field.state.value))
                            }
                            aria-invalid={isInvalid}
                        />
                    </Field>
                );
            }}
        />
    );
};
