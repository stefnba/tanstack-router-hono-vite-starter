import {
    FormAsyncValidateOrFn,
    FormOptions,
    FormValidateOrFn,
    FormValidators,
    useForm as useTanstackForm,
} from '@tanstack/react-form';
import z from 'zod';

type UseFormProps<
    TFormData,
    TOnMount extends undefined | FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
    TOnChange extends undefined | FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
    TOnChangeAsync extends undefined | FormAsyncValidateOrFn<TFormData> =
        FormAsyncValidateOrFn<TFormData>,
    TOnBlur extends undefined | FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
    TOnBlurAsync extends undefined | FormAsyncValidateOrFn<TFormData> =
        FormAsyncValidateOrFn<TFormData>,
    TOnSubmit extends undefined | FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
    TOnSubmitAsync extends undefined | FormAsyncValidateOrFn<TFormData> =
        FormAsyncValidateOrFn<TFormData>,
    TOnDynamic extends undefined | FormValidateOrFn<TFormData> = FormValidateOrFn<TFormData>,
    TOnDynamicAsync extends undefined | FormAsyncValidateOrFn<TFormData> =
        FormAsyncValidateOrFn<TFormData>,
    TOnServer extends undefined | FormAsyncValidateOrFn<TFormData> =
        FormAsyncValidateOrFn<TFormData>,
    TSubmitMeta = never,
> = Omit<
    FormOptions<
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
    >,
    'defaultValues'
> & {
    defaultValues: {
        [K in keyof TFormData]: TFormData[K];
    };
    schema: TOnSubmit;
};

export const useMyForm = <TSchema extends z.ZodSchema>(
    options: { schema: TSchema } & UseFormProps<{
        [K in keyof z.infer<TSchema>]: z.infer<TSchema>[K];
    }>
) => {
    const { schema, defaultValues, ...rest } = options;

    // if no validators are provided, use the schema for onSubmit
    const validators = options.validators || {
        onSubmit: schema,
    };

    const form = useTanstackForm({
        defaultValues: defaultValues,
        validators,
        ...rest,
    });
    return form;
};
