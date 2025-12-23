/**
 * Custom dropzone components for file uploads.
 */
import { FileText, UploadCloud, X } from 'lucide-react';
import * as React from 'react';
import { type DropzoneState, FileWithPath } from 'react-dropzone';

import { Button } from '@app/client/components/ui/button';
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from '@app/client/components/ui/item';
import { cn } from '@app/client/lib/utils';

// Shared Context Definition
type FileUploadContextValue = {
    fieldId?: string;
    dropzoneState: DropzoneState;
    files: FileWithPath[];
    previews: Map<string, string>;
    removeFile: (file: FileWithPath) => void;
    label?: string;
    description?: string;
    placeholder?: string;
};

// ================================
// Context and Hooks
// ================================

/**
 * Context for the file upload.
 */
const FileUploadContext = React.createContext<FileUploadContextValue | null>(null);

/**
 * Hook to use the FileUploadContext.
 */
function useFileUpload() {
    const context = React.useContext(FileUploadContext);
    if (!context) {
        throw new Error('useFileUpload must be used within a FileUploadProvider');
    }
    return context;
}

// ================================
// Main UI Components
// ================================

/**
 * Main dropzone component.
 */
const Dropzone = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        isDragActive?: boolean;
        isDragReject?: boolean;
        isDragAccept?: boolean;
    }
>(({ className, isDragActive, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-10 text-center transition-colors',
                'hover:bg-muted/50',
                isDragActive && 'border-primary bg-primary/5',
                // isDragAccept && 'border-green-600 bg-green-500/10',
                // isDragReject && 'border-destructive bg-destructive/5',
                className
            )}
            {...props}
        />
    );
});
Dropzone.displayName = 'Dropzone';

/**
 * Content for the dropzone.
 */
const DropzoneContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn('flex flex-col items-center gap-2', className)} {...props}>
            {children}
        </div>
    )
);
DropzoneContent.displayName = 'DropzoneContent';

/**
 * Icon for the dropzone.
 */
const DropzoneIcon = React.forwardRef<
    SVGSVGElement,
    React.ComponentPropsWithoutRef<typeof UploadCloud>
>(({ className, ...props }, ref) => {
    return (
        <div className="flex items-center justify-center rounded-full bg-muted p-4">
            <UploadCloud
                ref={ref}
                className={cn('size-6 text-muted-foreground', className)}
                {...props}
            />
        </div>
    );
});
DropzoneIcon.displayName = 'DropzoneIcon';

/**
 * Placeholder text, e.g. "Drag & drop files here, or click to browse".
 */
const DropzonePlaceholder = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn('text-sm font-medium', className)} {...props}>
            {children}
        </div>
    )
);
DropzonePlaceholder.displayName = 'DropzonePlaceholder';

/**
 * Description below the placeholder, e.g. "Upload up to 5 files, each must be less than 5MB".
 */
const DropzoneDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props}>
            {children}
        </div>
    )
);
DropzoneDescription.displayName = 'DropzoneDescription';

/**
 * Button, e.g. to browse files.
 */
const DropzoneButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
    ({ children, className, ...props }, ref) => (
        <Button
            ref={ref}
            variant="outline"
            className={cn('mt-4', className)}
            type="button"
            {...props}
        >
            {children}
        </Button>
    )
);
DropzoneButton.displayName = 'DropzoneButton';

/**
 * Preview component for a file.
 */
const FilePreview = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        file: FileWithPath;
        onRemove?: (file: FileWithPath) => void;
        previewUrl?: string;
    }
>(({ className, file, onRemove, previewUrl, ...props }, ref) => {
    const isImage = file.type.startsWith('image/');

    return (
        <Item ref={ref} className={className} variant="outline" {...props}>
            <ItemMedia variant={isImage ? 'image' : 'default'}>
                {isImage && previewUrl ? (
                    <img
                        src={previewUrl}
                        alt={file.name}
                        className="h-full w-full rounded object-cover"
                    />
                ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                )}
            </ItemMedia>
            <ItemContent>
                <ItemTitle>{file.name}</ItemTitle>
                <ItemDescription>{(file.size / 1024 / 1024).toFixed(2)} MB</ItemDescription>
            </ItemContent>

            <ItemActions>
                {onRemove && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(file);
                        }}
                    >
                        <X className="size-4" />
                        <span className="sr-only">Remove file</span>
                    </Button>
                )}
            </ItemActions>
        </Item>
    );
});
FilePreview.displayName = 'FilePreview';

// ================================
// Dropzone and Preview components using FileUploadContext
// ================================

/**
 * Dropzone component for file uploads. Must be used within a FileUploadProvider.
 */
const FileUploadDropzone = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { placeholder?: string; description?: string }
>(({ className, children, placeholder: propPlaceholder, ...props }, ref) => {
    const { dropzoneState, fieldId, placeholder: contextPlaceholder } = useFileUpload();
    const { getRootProps, getInputProps, isDragActive, isDragReject, isDragAccept } = dropzoneState;
    const placeholder = propPlaceholder || contextPlaceholder;

    const description = props.description;

    return (
        <Dropzone
            {...getRootProps()}
            ref={ref}
            isDragActive={isDragActive}
            isDragAccept={isDragAccept}
            isDragReject={isDragReject}
            className={className}
            id={fieldId}
            {...props}
        >
            <input {...getInputProps()} />
            {children || (
                <DropzoneContent>
                    <DropzoneIcon />

                    {isDragActive ? (
                        'Drop files here'
                    ) : (
                        <>
                            {placeholder && (
                                <DropzonePlaceholder>{placeholder}</DropzonePlaceholder>
                            )}
                            {description && (
                                <DropzoneDescription>{description}</DropzoneDescription>
                            )}
                        </>
                    )}
                    <DropzoneButton>Browse files</DropzoneButton>
                </DropzoneContent>
            )}
        </Dropzone>
    );
});
FileUploadDropzone.displayName = 'FileUploadDropzone';

/**
 * Preview component for file uploads. Must be used within a FileUploadProvider.
 */
const FileUploadPreview = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        const { files, previews, removeFile } = useFileUpload();

        if (files.length === 0) return null;

        return (
            <div ref={ref} className={className || 'grid gap-2'} {...props}>
                {files.map((file, i) => (
                    <FilePreview
                        key={`${file.name}-${i}`}
                        file={file}
                        onRemove={removeFile}
                        previewUrl={previews.get(file.name)}
                    />
                ))}
            </div>
        );
    }
);
FileUploadPreview.displayName = 'FileUploadPreview';

export {
    Dropzone,
    DropzoneContent,
    DropzoneIcon,
    FilePreview,
    FileUploadContext,
    FileUploadDropzone,
    FileUploadPreview,
    type FileUploadContextValue,
};
