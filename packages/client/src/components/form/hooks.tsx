import {
    DeepKeys,
    FormAsyncValidateOrFn,
    FormOptions,
    FormValidateOrFn,
    useForm as useTanstackForm,
} from '@tanstack/react-form';
import { useEffect, useId, useMemo, useState } from 'react';
import z from 'zod';

import { cn } from '@app/client/lib/utils';

import { FormCheckbox } from './checkbox';
import { FormInput } from './input';
import { FormRadioGroup } from './radio-group';
import { FormSelect } from './select';
import { SubmitButton } from './submit-button';
import { FormSwitch } from './switch';
import { FormTextarea } from './textarea';

/**
 * Props for the form hooks, omitting 'defaultValues' to enforce strictly typed default values
 * based on the schema.
 */
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

/**
 * A base hook that wraps TanStack Form's useForm to provide default ID generation
 * and schema-based validation configuration.
 *
 * @param options - Configuration options for the form, including schema and default values.
 * @returns The form API instance from TanStack Form.
 */
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

/**
 * A higher-level hook that builds on useBaseForm to provide a set of pre-configured
 * form components (Input, Select, SubmitButton, etc.) bound to the form instance.
 *
 * Also handles capturing and displaying root-level server errors during submission.
 *
 * @param options - Configuration options for the form.
 * @returns An object containing the form API, bound UI components, and a ServerError component.
 */
export const useAppForm = <TSchema extends z.ZodSchema>(
    options: {
        schema: TSchema;
        onSubmit?: (data: {
            value: {
                [K in keyof z.infer<TSchema>]: z.infer<TSchema>[K];
            };
            formApi: ReturnType<typeof useBaseForm<TSchema>>;
            setServerError: (error: string | null, options?: { clearForm?: boolean }) => void;
        }) => Promise<void> | void;
    } & Omit<
        UseFormProps<{
            [K in keyof z.infer<TSchema>]: z.infer<TSchema>[K];
        }>,
        'onSubmit'
    >
) => {
    const [serverError, setServerError] = useState<string | null>(null);
    const { onSubmit, ...restOptions } = options;

    const formApi = useBaseForm({
        ...restOptions,
        onSubmit: async (params) => {
            setServerError(null);
            try {
                await onSubmit?.({
                    ...params,
                    value: params.value,
                    formApi,
                    setServerError: (error: string | null, options?: { clearForm?: boolean }) => {
                        setServerError(error);
                        if (options?.clearForm) {
                            console.log('clearing form');
                            // reset the form to the default values
                            formApi.reset();
                        }
                    },
                });
            } catch (error: unknown) {
                console.error('Form submission error:', error);
                const message =
                    error instanceof Error ? error.message : 'An unexpected error occurred';

                setServerError(message);
                // throw error;
            }
        },
    });

    useEffect(() => {
        if (!serverError) return;

        // Subscribe to form changes to clear the server error when the user interacts with the form
        const unsubscribe = formApi.store.subscribe((state) => {
            // Only clear error if values have changed (to avoid clearing on submission state changes)
            if (state.prevVal.values !== state.currentVal.values) {
                setServerError(null);
            }
        });

        return unsubscribe;
    }, [formApi, serverError]);

    // ================================
    // Components
    // ================================

    // Important: We use useMemo with an empty dependency array [] (or just formApi.formId)
    // for these components to ensure their reference identity remains stable across re-renders.
    // If these component functions are recreated on every render, React will unmount and remount
    // the input fields, causing loss of focus.
    // Since 'formApi' is a stable object reference from useTanstackForm (and we want to avoid
    // dependencies that change often), we rely on the fact that formApi is stable.

    const FormComponent = useMemo(
        () => (props: Omit<React.ComponentProps<'form'>, 'onSubmit' | 'id'>) => (
            <form
                id={formApi.formId}
                onSubmit={(e) => {
                    e.preventDefault();
                    formApi.handleSubmit();
                }}
                {...props}
            />
        ),
        [formApi]
    );

    const ServerErrorComponent = ({ className }: { className?: string }) => {
        if (!serverError) return null;
        return (
            <div className={cn('text-sm font-medium text-destructive', className)}>
                {serverError}
            </div>
        );
    };

    // Memoize components to prevent re-creation on every render
    const FormTextareaComponent = useMemo(
        () =>
            (
                props: Omit<React.ComponentProps<typeof FormTextarea>, 'form'> & {
                    name: DeepKeys<z.infer<TSchema>>;
                }
            ) => <FormTextarea form={formApi} {...props} />,
        [formApi]
    );

    const FormInputComponent = useMemo(
        () =>
            (
                props: Omit<React.ComponentProps<typeof FormInput>, 'form'> & {
                    name: DeepKeys<z.infer<TSchema>>;
                }
            ) => <FormInput form={formApi} {...props} />,
        [formApi]
    );

    const FormSelectComponent = useMemo(
        () =>
            (
                props: Omit<React.ComponentProps<typeof FormSelect>, 'form'> & {
                    name: DeepKeys<z.infer<TSchema>>;
                }
            ) => <FormSelect form={formApi} {...props} />,
        [formApi]
    );

    const SubmitButtonComponent = useMemo(
        () => (props: Omit<React.ComponentProps<typeof SubmitButton>, 'form' | 'isLoading'>) => (
            <formApi.Subscribe
                selector={(state) => state.isSubmitting}
                children={(isSubmitting) => (
                    <SubmitButton
                        isLoading={isSubmitting}
                        type="submit"
                        form={formApi.formId}
                        {...props}
                    />
                )}
            />
        ),
        [formApi]
    );

    const FormSwitchComponent = useMemo(
        () =>
            (
                props: Omit<React.ComponentProps<typeof FormSwitch>, 'form'> & {
                    name: DeepKeys<z.infer<TSchema>>;
                }
            ) => <FormSwitch form={formApi} {...props} />,
        [formApi]
    );

    const FormCheckboxComponent = useMemo(
        () =>
            (
                props: Omit<React.ComponentProps<typeof FormCheckbox>, 'form'> & {
                    name: DeepKeys<z.infer<TSchema>>;
                }
            ) => <FormCheckbox form={formApi} {...props} />,
        [formApi]
    );

    const FormRadioGroupComponent = useMemo(
        () =>
            (
                props: Omit<React.ComponentProps<typeof FormRadioGroup>, 'form'> & {
                    name: DeepKeys<z.infer<TSchema>>;
                }
            ) => <FormRadioGroup form={formApi} {...props} />,
        [formApi]
    );

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
        ServerError: ServerErrorComponent,
    };
};
