import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/client';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_auth/signup')({
    component: RouteComponent,
});

function RouteComponent() {
    const [email, setEmail] = useState('test@test.com');
    const [name, setName] = useState('test');
    const [password, setPassword] = useState('password1234!');
    const navigate = Route.useNavigate();

    const handleSignUp = async () => {
        await authClient.signUp.email({
            email: email,
            name: name,
            password: password,
        });
        navigate({ to: '/signin', search: { email: email } });
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Signup</h1>
            <form className="max-w-md space-y-2 mb-4">
                <Label htmlFor="email">Email</Label>
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Label htmlFor="name">Name</Label>
                <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
            <Button type="submit" onClick={handleSignUp}>
                Sign Up
            </Button>
        </div>
    );
}
