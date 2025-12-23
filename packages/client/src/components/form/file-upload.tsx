import { DeepKeys, DeepValue, Updater } from '@tanstack/react-form';
import * as React from 'react';
import {
    type DropzoneOptions,
    type FileRejection,
    FileWithPath,
    useDropzone,
} from 'react-dropzone';

import { FileUploadContext, type FileUploadContextValue } from '@app/client/components/ui/dropzone';
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@app/client/components/ui/field';

import { TAppForm, TAppFormField } from './types';
import { buildFormFieldId } from './utils';

// Re-export specific components for convenience
export { FileUploadDropzone, FileUploadPreview } from '@app/client/components/ui/dropzone';

interface FormFileUploadProps<TFormData, TName extends DeepKeys<TFormData>> extends Omit<
    DropzoneOptions,
    'onDrop'
> {
    /**
     * The form instance.
     */
    form: TAppForm<TFormData>;
    /**
     * The name of the field.
     */
    name: TName;
    /**
     * The label of the field.
     */
    label?: string;
    /**
     * The description of the field.
     */
    description?: string;
    /**
     * The placeholder of the field, usually the t.
     */
    placeholder?: string;
    /**
     * The children of the field.
     */
    children?: React.ReactNode;
}

const FileUploadInner = <TFormData, TName extends DeepKeys<TFormData>>({
    field,
    fieldId,
    label,
    description,
    placeholder,
    dropzoneOptions,
    children,
}: {
    field: TAppFormField<TFormData, TName>;
    fieldId: string;
    label?: string;
    description?: string;
    placeholder: string;
    dropzoneOptions: DropzoneOptions;
    children?: React.ReactNode;
}) => {
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
    const rawValue = field.state.value;

    // Memoize value to stabilize dependencies
    const value = React.useMemo(() => {
        return Array.isArray(rawValue) ? rawValue : [];
    }, [rawValue]);

    // Manage object URLs for previews
    const [previews, setPreviews] = React.useState<Map<string, string>>(new Map());

    React.useEffect(() => {
        const newPreviews = new Map<string, string>();
        value.forEach((file) => {
            if (file.type.startsWith('image/') && !previews.has(file.name)) {
                newPreviews.set(file.name, URL.createObjectURL(file));
            } else if (previews.has(file.name)) {
                newPreviews.set(file.name, previews.get(file.name)!);
            }
        });

        // Cleanup old previews
        previews.forEach((url, name) => {
            if (!value.find((f) => f.name === name)) {
                URL.revokeObjectURL(url);
            }
        });

        setPreviews(newPreviews);

        return () => {
            newPreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Handle the change event.
     */
    const handleChange = React.useCallback(
        (newFiles: FileWithPath[]) => {
            // Safely cast the new files to the Updater type.
            field.handleChange(newFiles as Updater<DeepValue<TFormData, TName>>);
        },
        [field]
    );

    /**
     * Handle the drop event.
     */
    const onDrop = React.useCallback(
        (acceptedFiles: FileWithPath[], rejectedFiles: FileRejection[]) => {
            const currentFiles = dropzoneOptions.multiple ? value : [];
            const newFiles = [...currentFiles, ...acceptedFiles];

            handleChange(newFiles);
            field.handleBlur();

            if (rejectedFiles.length > 0) {
                console.warn('Files rejected:', rejectedFiles);
            }
        },
        [field, value, dropzoneOptions.multiple, handleChange]
    );

    /**
     * Remove a file from the form field.
     */
    const removeFile = (fileToRemove: FileWithPath) => {
        const newFiles = value.filter((f) => f !== fileToRemove);
        handleChange(newFiles);
    };

    const dropzoneState = useDropzone({
        ...dropzoneOptions,
        onDrop,
    });

    const contextValue: FileUploadContextValue = {
        fieldId,
        dropzoneState,
        files: value,
        previews,
        removeFile,
        label,
        description,
        placeholder,
    };

    return (
        <FileUploadContext.Provider value={contextValue}>
            <Field data-invalid={isInvalid}>
                {/* Label and description */}
                <FieldContent>
                    {label && <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>}
                    {description && <FieldDescription>{description}</FieldDescription>}
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </FieldContent>

                {/* Children typically are the dropzone and preview components, e.g. <FileUploadDropzone /> and <FileUploadPreview />. */}
                <div className="space-y-4">{children}</div>
            </Field>
        </FileUploadContext.Provider>
    );
};

/**
 * Form field wrapper for file upload component using Tanstack Form.
 */
export const FormFileUpload = <TFormData, TName extends DeepKeys<TFormData>>({
    form,
    name,
    label,
    placeholder = 'Drag & drop files here, or click to select',
    description,
    children,
    ...dropzoneOptions
}: FormFileUploadProps<TFormData, TName>) => {
    return (
        <form.Field
            name={name}
            children={(field) => {
                const fieldId = buildFormFieldId(form.formId, 'file-upload', String(name));
                return (
                    <FileUploadInner
                        field={field}
                        fieldId={fieldId}
                        label={label}
                        description={description}
                        placeholder={placeholder}
                        dropzoneOptions={dropzoneOptions}
                    >
                        {children}
                    </FileUploadInner>
                );
            }}
        />
    );
};
