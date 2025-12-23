import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

import { useAppForm } from '@app/client/components/form';
import { Card, CardContent, CardHeader, CardTitle } from '@app/client/components/ui/card';
import { notification } from '@app/client/lib/notification';
import { createFileUploadFormSchema } from '@app/client/lib/upload/schema';

export const Route = createFileRoute('/showroom/file-upload')({
    component: RouteComponent,
});

function RouteComponent() {
    const { form, Form, SubmitButton, Input, FileUpload } = useAppForm({
        schema: z.object({
            name: z.string().min(1, { message: 'Name is required' }),
            files: createFileUploadFormSchema({
                maxFileSize: 1024 * 1024 * 10,
                allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
            }),
        }),
        defaultValues: {
            files: [],
            name: '',
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
                        <CardTitle>Dropzone for images only with preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form>
                            <Input
                                name="name"
                                label="Max Files"
                                description="Max files to upload"
                            />
                            <FileUpload
                                name="files"
                                label="Upload Files"
                                description="Upload your files"
                                accept={{ 'image/*': [] }}
                                multiple
                                maxSize={1024 * 1024 * 10}
                            >
                                <FileUpload.Dropzone
                                    description="Upload up to 10 files, each must be less than 10MB"
                                    placeholder="Drag & drop files here, or click to select"
                                />
                                <FileUpload.Preview />
                            </FileUpload>
                            <SubmitButton>Upload</SubmitButton>
                        </Form>

                        <form.Subscribe>
                            {(state) => (
                                <div className="text-sm text-gray-500 mt-4">
                                    <pre>{JSON.stringify(state.values, null, 2)}</pre>
                                </div>
                            )}
                        </form.Subscribe>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
