import {
    DeepKeys,
    FormAsyncValidateOrFn,
    FormOptions,
    FormValidateOrFn,
    useForm as useTanstackForm,
} from '@tanstack/react-form';
import { useId } from 'react';
import z from 'zod';

import { Button } from '../ui/button';
import { FormCheckbox } from './checkbox';
import { FormInput } from './input';
import { FormRadioGroup } from './radio-group';
import { FormSelect } from './select';
import { FormSwitch } from './switch';
import { FormTextarea } from './textarea';

type UseFormProps<TFormData> = Omit<
    FormOptions<
        TFormData,
        FormValidateOrFn<TFormData>,
        FormValidateOrFn<TFormData>,
        FormAsyncValidateOrFn<TFormData>,
        FormValidateOrFn<TFormData>,
        FormAsyncValidateOrFn<TFormData>,
        FormValidateOrFn<TFormData>,
        FormAsyncValidateOrFn<TFormData>,
        FormValidateOrFn<TFormData>,
        FormAsyncValidateOrFn<TFormData>,
        FormAsyncValidateOrFn<TFormData>,
        never
    >,
    'defaultValues'
> & {
    defaultValues: {
        [K in keyof TFormData]: TFormData[K];
    };
    schema: FormValidateOrFn<TFormData>;
};

export const useBaseForm = <TSchema extends z.ZodSchema>(
    options: {
        schema: TSchema;
    } & UseFormProps<{
        [K in keyof z.infer<TSchema>]: z.infer<TSchema>[K];
    }>
) => {
    const generatedId = useId();
    const { schema, defaultValues, formId, ...rest } = options;

    // Use provided formId or generate a unique one
    const finalFormId = formId || `form-${generatedId.replace(/:/g, '-')}`;

    // if no validators are provided, use the schema for onSubmit
    const validators = options.validators || {
        onSubmit: schema,
    };

    const form = useTanstackForm({
        defaultValues: defaultValues,
        validators,
        formId: finalFormId,
        ...rest,
    });

    return form;
};

export const useAppForm = <TSchema extends z.ZodSchema>(
    options: {
        schema: TSchema;
        formId?: string;
    } & UseFormProps<{
        [K in keyof z.infer<TSchema>]: z.infer<TSchema>[K];
    }>
) => {
    const formApi = useBaseForm(options);

    // ================================
    // Components
    // ================================

    const FormComponent = (props: Omit<React.ComponentProps<'form'>, 'onSubmit' | 'id'>) => (
        <form
            id={formApi.formId}
            onSubmit={(e) => {
                e.preventDefault();
                formApi.handleSubmit();
            }}
            {...props}
        />
    );

    const FormTextareaComponent = (
        props: Omit<React.ComponentProps<typeof FormTextarea>, 'form'> & {
            name: DeepKeys<z.infer<TSchema>>;
        }
    ) => <FormTextarea form={formApi} {...props} />;

    const FormInputComponent = (
        props: Omit<React.ComponentProps<typeof FormInput>, 'form'> & {
            name: DeepKeys<z.infer<TSchema>>;
        }
    ) => <FormInput form={formApi} {...props} />;

    const FormSelectComponent = (
        props: Omit<React.ComponentProps<typeof FormSelect>, 'form'> & {
            name: DeepKeys<z.infer<TSchema>>;
        }
    ) => <FormSelect form={formApi} {...props} />;

    const SubmitButtonComponent = (props: Omit<React.ComponentProps<typeof Button>, 'form'>) => (
        <Button type="submit" form={formApi.formId} {...props} />
    );

    const FormSwitchComponent = (
        props: Omit<React.ComponentProps<typeof FormSwitch>, 'form'> & {
            name: DeepKeys<z.infer<TSchema>>;
        }
    ) => <FormSwitch form={formApi} {...props} />;

    const FormCheckboxComponent = (
        props: Omit<React.ComponentProps<typeof FormCheckbox>, 'form'> & {
            name: DeepKeys<z.infer<TSchema>>;
        }
    ) => <FormCheckbox form={formApi} {...props} />;

    const FormRadioGroupComponent = (
        props: Omit<React.ComponentProps<typeof FormRadioGroup>, 'form'> & {
            name: DeepKeys<z.infer<TSchema>>;
        }
    ) => <FormRadioGroup form={formApi} {...props} />;

    return {
        form: formApi,
        Input: FormInputComponent,
        Select: FormSelectComponent,
        Form: FormComponent,
        SubmitButton: SubmitButtonComponent,
        Textarea: FormTextareaComponent,
        Switch: FormSwitchComponent,
        Checkbox: FormCheckboxComponent,
        RadioGroup: FormRadioGroupComponent,
    };
};
