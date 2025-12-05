import { DeepKeys } from '@tanstack/react-form';

import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { TAppForm } from './types';
import { buildFormFieldId, convertToFormValue } from './utils';

interface FormSelectProps<TFormData, TName extends DeepKeys<TFormData>> extends Omit<
    React.ComponentProps<typeof Select>,
    'name' | 'value' | 'onChange' | 'onBlur' | 'form'
> {
    form: TAppForm<TFormData>;
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

export const FormSelect = <TFormData, TName extends DeepKeys<TFormData>>({
    form,
    options,
    name,
    label,
    description,
}: FormSelectProps<TFormData, TName>) => {
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
                                field.handleChange(convertToFormValue(value, field.state.value))
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
