import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { useAppForm } from '@app/client/components/form';
import { sessionQueryOptions } from '@app/client/lib/auth/api';
import { authClient } from '@app/client/lib/auth/client';

export const Route = createFileRoute('/_auth/signin')({
    component: RouteComponent,
    validateSearch: zodValidator(
        z.object({
            redirect: z.string().optional(),
            email: z.email().optional(),
        })
    ),
});

function RouteComponent() {
    const { queryClient } = Route.useRouteContext();
    const navigate = Route.useNavigate();
    const { redirect, email: emailSearch } = Route.useSearch();

    const { form, Input, Form, SubmitButton, ServerError } = useAppForm({
        schema: z.object({
            email: z.email(),
            password: z.string().min(6),
        }),
        defaultValues: {
            email: emailSearch ?? 'test@test.com',
            password: 'password1234!',
        },
        onSubmit: async ({ value, setServerError }) => {
            // simulate a slow network request
            await new Promise((resolve) => setTimeout(resolve, 600));

            // sign in
            await authClient.signIn.email(value, {
                async onSuccess() {
                    // fetch the session data
                    const sessionData = await queryClient.fetchQuery({
                        ...sessionQueryOptions,
                        staleTime: 0, // force refetch
                    });

                    if (sessionData) {
                        console.log('redirecting to', redirect ?? '/dashboard');
                        navigate({ to: redirect ?? '/dashboard' });
                    }
                },
                onError(error) {
                    setServerError(error.error.message);
                },
            });
        },
    });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Signin</h1>
            <Form className="max-w-md space-y-2 mb-4">
                <Input type="email" name="email" label="Email" required />

                <Input type="password" name="password" label="Password" required />
                <div className="text-sm text-gray-500">{form.state.values.password}</div>
                <ServerError />
                <SubmitButton loadingText="Signing in...">Sign In</SubmitButton>
            </Form>
        </div>
    );
}
