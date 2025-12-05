import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import z from 'zod';

import { useAppForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/client';

export const Route = createFileRoute('/_auth/signup')({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = Route.useNavigate();

    const { form, Input, Form, SubmitButton } = useAppForm({
        schema: z.object({
            email: z.email(),
            name: z.string().min(1),
            password: z.string().min(6),
        }),
        defaultValues: {
            email: 'test@test.com',
            name: 'test',
            password: 'password1234!',
        },
        onSubmit: async ({ value }) => {
            await authClient.signUp.email({
                email: value.email,
                name: value.name,
                password: value.password,
            });
            navigate({ to: '/signin', search: { email: value.email } });
        },
    });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Signup</h1>
            <Form className="max-w-md space-y-2 mb-4">
                <Input name="email" type="email" required label="Email" />
                <Input name="name" type="text" required label="Name" />
                <Input name="password" type="password" required label="Password" />
                <div className="text-sm text-gray-500">{form.state.values.password}</div>
                <SubmitButton>Sign Up</SubmitButton>
            </Form>
        </div>
    );
}
