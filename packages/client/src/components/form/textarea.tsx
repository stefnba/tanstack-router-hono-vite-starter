import { DeepKeys } from '@tanstack/react-form';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

import { Textarea } from '../ui/textarea';
import { TAppForm } from './types';
import { buildFormFieldId, convertToFormValue } from './utils';

interface FormTextareaProps<TFormData, TName extends DeepKeys<TFormData>> extends Omit<
    React.ComponentProps<typeof Input>,
    'name' | 'value' | 'onChange' | 'onBlur' | 'form'
> {
    form: TAppForm<TFormData>;
    name: TName;
    label?: string;
    description?: string;
}

export const FormTextarea = <TFormData, TName extends DeepKeys<TFormData>>({
    form,
    name,
    label,
    description,
    placeholder,
}: FormTextareaProps<TFormData, TName>) => {
    return (
        <form.Field
            name={name}
            children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                const value = field.state.value ? String(field.state.value) : '';
                const fieldId = buildFormFieldId(form.formId, 'textarea', String(name));

                return (
                    <Field data-invalid={isInvalid}>
                        {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
                        <Textarea
                            id={fieldId}
                            name={field.name}
                            value={value}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                                field.handleChange(
                                    convertToFormValue(e.target.value, field.state.value)
                                )
                            }
                            aria-invalid={isInvalid}
                            placeholder={placeholder}
                            className="min-h-[120px]"
                        />
                        {description && <FieldDescription>{description}</FieldDescription>}
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                );
            }}
        />
    );
};
