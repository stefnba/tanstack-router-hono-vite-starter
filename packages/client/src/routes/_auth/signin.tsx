import { Button } from '@/components/ui/button';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { useState } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/_auth/signin')({
    component: RouteComponent,
    validateSearch: zodValidator(
        z.object({
            redirect: z.string().optional(),
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
    const { redirect } = Route.useSearch();

    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        console.log('login');

        try {
            auth.login(username);
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
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
            </form>
        </div>
    );
}
