import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/client';
import { sessionQueryOptions } from '@/lib/auth/query-options';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useState } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/_auth/signin')({
    component: RouteComponent,
    validateSearch: zodValidator(
        z.object({
            redirect: z.string().optional(),
            email: z.email().optional(),
        })
    ),
    beforeLoad: ({ context, search }) => {
        // Redirect if already authenticated
        if (context.auth.isAuthenticated) {
            throw redirect({ to: search?.redirect });
        }
    },
});

function RouteComponent() {
    const { queryClient } = Route.useRouteContext();
    const navigate = Route.useNavigate();
    const router = useRouter();
    const { redirect, email: emailSearch } = Route.useSearch();

    const [email, setEmail] = useState(emailSearch ?? 'test@test.com');
    const [password, setPassword] = useState('password1234!');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter an email and password');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            await authClient.signIn.email(
                {
                    email: email,
                    password: password,
                },
                {
                    onSuccess(context) {
                        console.log('login successful', context);
                    },
                    onError(error) {
                        setError(error.error.message ?? 'An unknown error occurred');
                    },
                }
            );

            // fetch the session data
            await queryClient.fetchQuery(sessionQueryOptions);
            console.log('redirecting to', redirect ?? '/dashboard');
            // router.invalidate();
            navigate({ to: redirect ?? '/dashboard' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Signin</h1>
            <form className="max-w-md space-y-2 mb-4">
                <Label htmlFor="email">Email</Label>
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Label htmlFor="password">Password</Label>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <div className="text-sm text-gray-500">{password}</div>
            </form>

            {error && <div className="text-red-500">{error}</div>}

            <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
        </div>
    );
}
