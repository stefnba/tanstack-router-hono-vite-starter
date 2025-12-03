import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/client';
import { createFileRoute, redirect } from '@tanstack/react-router';
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
    const { auth } = Route.useRouteContext();
    const navigate = Route.useNavigate();
    const { redirect, email: emailSearch } = Route.useSearch();

    const [email, setEmail] = useState(emailSearch ?? '');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        console.log('login', email, password);

        try {
            await authClient.signIn.email({
                email: email,
                password: password,
            });
            console.log('login successful');
            // Navigate to the redirect URL using router navigation
            navigate({ to: redirect ?? '/dashboard' });
        } catch (err) {
            setError('Invalid username');
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

            <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
        </div>
    );
}
