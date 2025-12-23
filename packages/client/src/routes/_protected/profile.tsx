import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

import { useAppForm } from '@app/client/components/form';
import { ImageUpload } from '@app/client/components/upload-avatar/image-upload';
import { sessionQueryOptions, useAuth } from '@app/client/lib/auth';
import { authClient } from '@app/client/lib/auth/client';

export const Route = createFileRoute('/_protected/profile')({
    component: RouteComponent,
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
                        alert('Profile updated successfully');
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
        <div className="p-4">
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

            <ImageUpload />
        </div>
    );
}
