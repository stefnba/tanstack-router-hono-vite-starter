import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import z from 'zod';

import { avatarUploadConfig } from '@app/shared/features/user/config';

import { apiEndpoints } from '@app/client/api';
import { useAppForm } from '@app/client/components/form';
import { useImageCropper } from '@app/client/components/image-edit';
import { createModal } from '@app/client/components/responsive-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@app/client/components/ui/avatar';
import { Button } from '@app/client/components/ui/button';
import { Label } from '@app/client/components/ui/label';
import { Progress } from '@app/client/components/ui/progress';
import { sessionQueryOptions, useAuth } from '@app/client/lib/auth';
import { authClient } from '@app/client/lib/auth/client';
import { notification } from '@app/client/lib/notification';
import { useS3Upload } from '@app/client/lib/upload';

const avatarModal = createModal('update-avatar', ['drop', 'crop', 'upload'], 'drop');

export const Route = createFileRoute('/_protected/profile')({
    component: RouteComponent,
    validateSearch: z.object({
        ...avatarModal.schema.shape,
    }),
    search: {
        middlewares: [stripSearchParams(avatarModal.defaultValues)],
    },
});

function RouteComponent() {
    const { user } = useAuth();

    const { queryClient } = Route.useRouteContext();

    const { Input, Form, SubmitButton, ServerError } = useAppForm({
        schema: z.object({
            name: z.string().min(1),
        }),
        defaultValues: {
            name: user?.name ?? '',
        },
        onSubmit: async ({ value, setServerError }) => {
            await authClient.updateUser(
                {
                    name: value.name,
                },
                {
                    onSuccess: () => {
                        notification.success('Profile updated successfully');
                        queryClient.invalidateQueries({ queryKey: sessionQueryOptions.queryKey });
                    },
                    onError: (error) => {
                        console.error('Update user error:', error.error);
                        setServerError(error.error.message);
                    },
                }
            );
        },
    });

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Update Profile</h1>
            <Form className="max-w-md space-y-2 mb-4">
                <Input name="name" label="Name" />
                <SubmitButton>Save</SubmitButton>
                <ServerError />
            </Form>

            <div>
                <h2 className="text-lg font-bold mb-2">User</h2>
                <pre className="bg-gray-100 p-4 rounded-md text-sm">
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>

            <Avatar className="size-20">
                <AvatarImage src={user?.image || undefined} alt="Avatar" />
                <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <UpdateAvatar />
        </div>
    );
}

const UpdateAvatar = () => {
    const { Modal, View, changeView, open, close } = avatarModal.useResponsiveModal(Route);

    const queryClient = useQueryClient();

    const { upload, progress } = useS3Upload({
        config: avatarUploadConfig,
        endpoint: apiEndpoints.user.getAvatarUploadUrl({}),
        options: {
            onSuccess: (data) => {
                // queryClient.invalidateQueries({ queryKey: sessionQueryOptions.queryKey });
            },
            onError: (error) => {
                notification.error('Failed to upload avatar');
            },
        },
    });

    const { Form, SubmitButton, FileUpload, form } = useAppForm({
        schema: z.object({
            files: avatarUploadConfig.formSchema,
        }),
        onSubmit: async ({ value: { files } }) => {
            if (files.length == 1) {
                const result = await upload(files[0]);

                // update user with new avatar
                await authClient.updateUser(
                    {
                        image: result.url,
                    },
                    {
                        onSuccess: () => {
                            queryClient.invalidateQueries({
                                queryKey: sessionQueryOptions.queryKey,
                            });
                            notification.success('Avatar updated successfully');
                            close();
                        },
                        onError: (error) => {
                            console.error('Update user error:', error.error);
                            notification.error('Failed to update avatar');
                        },
                    }
                );
            }
        },
        defaultValues: {
            files: [],
        },
    });

    const { Cropper, loadImage, saveCroppedImage, previewUrl } = useImageCropper({
        onCropComplete: (croppedFile) => {
            // set the cropped file to the form
            form.setFieldValue('files', [croppedFile]);

            // change to the upload view
            changeView('upload');

            // submit the form
            form.handleSubmit();
        },
        aspect: 1,
        cropShape: 'round',
    });

    const handleDrop = (files: File[]) => {
        if (files.length > 0) {
            loadImage(files[0]);
            changeView('crop');
        }
    };

    return (
        <div>
            <Button onClick={() => open()}>Update Avatar</Button>
            <Modal>
                <Form>
                    <View viewToRender="drop">
                        <Modal.Header>
                            <Modal.Title>Update Avatar</Modal.Title>
                            <Modal.Description>Upload your avatar image</Modal.Description>
                        </Modal.Header>
                        <Modal.Content>
                            <FileUpload
                                name="files"
                                config={avatarUploadConfig.dropzoneConfig}
                                onDrop={handleDrop}
                            >
                                <FileUpload.Dropzone
                                    description="Upload up to 5 images, each must be less than 5MB"
                                    placeholder="Drag & drop images here, or click to browse"
                                />
                            </FileUpload>
                        </Modal.Content>
                    </View>
                    <View viewToRender="crop">
                        <Modal.Header>
                            <Modal.Title>Edit Avatar</Modal.Title>
                            <Modal.Description>Edit your avatar image</Modal.Description>
                        </Modal.Header>
                        <Modal.Content>
                            <Cropper />
                        </Modal.Content>
                        <Modal.Footer>
                            <Button
                                variant="outline"
                                onClick={() => changeView('upload')}
                                type="button"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    saveCroppedImage();
                                }}
                                type="button"
                            >
                                Apply & Upload
                            </Button>
                        </Modal.Footer>
                    </View>

                    <View viewToRender="upload">
                        <Modal.Header>
                            <Modal.Title>Upload Avatar</Modal.Title>
                            <Modal.Description>Upload your avatar image</Modal.Description>
                        </Modal.Header>
                        <Modal.Content>
                            {previewUrl && (
                                <img
                                    src={previewUrl}
                                    alt="Avatar preview"
                                    className="w-full max-w-xs mx-auto rounded-full"
                                />
                            )}

                            <div className="mt-4 space-y-2">
                                <Label>Upload Progress</Label>
                                <Progress value={progress} />
                            </div>
                        </Modal.Content>
                        {/* <Modal.Footer>
                            <Button
                                variant="outline"
                                onClick={() => changeView('drop')}
                                type="button"
                            >
                                Change Image
                            </Button>
                            <SubmitButton>Upload to Server</SubmitButton>
                        </Modal.Footer> */}
                    </View>
                </Form>
            </Modal>
        </div>
    );
};
