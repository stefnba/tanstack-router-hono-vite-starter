import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

import { defineSharedS3UploadConfig } from '@app/shared/lib/cloud/s3/config';

import { useAppForm } from '@app/client/components/form';
import { Card, CardContent, CardHeader, CardTitle } from '@app/client/components/ui/card';
import { notification } from '@app/client/lib/notification';

const imageUploadConfig = defineSharedS3UploadConfig({
    maxFileSize: 1024 * 1024 * 10,
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFiles: 3,
});

const fileUploadConfig = defineSharedS3UploadConfig({
    maxFileSize: 1024 * 1024 * 10,
    allowedFileTypes: ['application/pdf', 'text/csv', 'text/plain', 'application/json'],
    maxFiles: 3,
});

export const Route = createFileRoute('/showroom/file-upload')({
    component: RouteComponent,
});

function RouteComponent() {
    const imageForm = useAppForm({
        schema: z.object({
            files: imageUploadConfig.formSchema,
        }),
        defaultValues: {
            files: [],
        },
        onSubmit: async ({ value: { files } }) => {
            notification.success('Files uploaded successfully', {
                description: `You uploaded ${files.length} files`,
            });
        },
    });

    const fileForm = useAppForm({
        schema: z.object({
            files: fileUploadConfig.formSchema,
        }),
        defaultValues: {
            files: [],
        },
        onSubmit: async ({ value: { files } }) => {
            notification.success('Files uploaded successfully', {
                description: `You uploaded ${files.length} files`,
            });
        },
    });

    return (
        <div className="p-10 space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Dropzone for images only with image preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <imageForm.Form>
                            <imageForm.FileUpload
                                name="files"
                                label="Upload Files"
                                description="Upload your files"
                                config={imageUploadConfig.dropzoneConfig}
                            >
                                <imageForm.FileUpload.Dropzone
                                    description="Upload up to 10 files, each must be less than 10MB"
                                    placeholder="Drag & drop files here, or click to select"
                                />
                                <imageForm.FileUpload.Preview />
                            </imageForm.FileUpload>
                            <imageForm.SubmitButton>Upload</imageForm.SubmitButton>
                        </imageForm.Form>

                        <imageForm.form.Subscribe>
                            {(state) => (
                                <div className="text-sm text-gray-500 mt-4">
                                    <pre>{JSON.stringify(state.values, null, 2)}</pre>
                                </div>
                            )}
                        </imageForm.form.Subscribe>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Dropzone for images only with preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <imageForm.Form>
                            <imageForm.FileUpload
                                name="files"
                                label="Upload Files"
                                description="Upload your files"
                                config={imageUploadConfig.dropzoneConfig}
                            >
                                <imageForm.FileUpload.Dropzone
                                    description="Upload up to 10 files, each must be less than 10MB"
                                    placeholder="Drag & drop files here, or click to select"
                                />
                                <imageForm.FileUpload.Preview showImagePreview={false} />
                            </imageForm.FileUpload>
                            <imageForm.SubmitButton>Upload</imageForm.SubmitButton>
                        </imageForm.Form>

                        <imageForm.form.Subscribe>
                            {(state) => (
                                <div className="text-sm text-gray-500 mt-4">
                                    <pre>{JSON.stringify(state.values, null, 2)}</pre>
                                </div>
                            )}
                        </imageForm.form.Subscribe>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Dropzone for multiple documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <fileForm.Form>
                            <fileForm.FileUpload
                                name="files"
                                label="Upload Files"
                                description="Upload your files"
                                config={fileUploadConfig.dropzoneConfig}
                            >
                                <fileForm.FileUpload.Dropzone
                                    description="Upload up to 10 files, each must be less than 10MB"
                                    placeholder="Drag & drop files here, or click to select"
                                />
                                <fileForm.FileUpload.Preview />
                            </fileForm.FileUpload>
                            <fileForm.SubmitButton>Upload</fileForm.SubmitButton>
                        </fileForm.Form>

                        <fileForm.form.Subscribe>
                            {(state) => (
                                <div className="text-sm text-gray-500 mt-4">
                                    <pre>{JSON.stringify(state.values, null, 2)}</pre>
                                </div>
                            )}
                        </fileForm.form.Subscribe>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
