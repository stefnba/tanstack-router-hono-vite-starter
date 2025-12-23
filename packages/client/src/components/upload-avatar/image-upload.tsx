import { z } from 'zod';

import { avatarUploadConfig } from '@app/shared/features/user/config';

import { apiEndpoints } from '@app/client/api';
import { useAppForm } from '@app/client/components/form';
import { useS3Upload } from '@app/client/lib/upload';

export const ImageUpload = () => {
    const { upload } = useS3Upload({
        config: avatarUploadConfig,
        endpoint: apiEndpoints.user.getAvatarUploadUrl(),
        options: {
            onSuccess: () => {
                console.log('Upload successful');
            },
        },
    });

    const { Form, SubmitButton, FileUpload } = useAppForm({
        schema: z.object({
            files: avatarUploadConfig.formSchema,
        }),
        onSubmit: async ({ value: { files } }) => {
            if (files.length > 0) {
                await upload(files[0]);
            }
        },
        defaultValues: {
            files: [],
        },
    });

    return (
        <div>
            <Form className="space-y-4">
                <FileUpload
                    name="files"
                    label="Upload Images"
                    description="Upload your avatar image"
                    config={avatarUploadConfig.dropzoneConfig}
                >
                    <FileUpload.Dropzone
                        description="Upload up to 5 images, each must be less than 5MB"
                        placeholder="Drag & drop images here, or click to browse"
                    />
                    <FileUpload.Preview />
                </FileUpload>
                <SubmitButton>Upload</SubmitButton>
            </Form>
        </div>
    );
};
