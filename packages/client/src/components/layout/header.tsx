import { Link } from '@tanstack/react-router';

import { Logout } from '@/components/auth/logout';

interface HeaderProps {
    isAuthenticated: boolean;
}

export const Header = ({ isAuthenticated }: HeaderProps) => {
    return (
        <header>
            <div className="p-4 gap-2 flex">
                <Link to="/" className="[&.active]:font-bold">
                    Home
                </Link>
                <Link to="/about" className="[&.active]:font-bold">
                    About
                </Link>
                <Link to="/showroom" className="[&.active]:font-bold">
                    Showroom
                </Link>
                {isAuthenticated ? (
                    <>
                        <Link to="/posts" className="[&.active]:font-bold">
                            Posts (Protected)
                        </Link>
                        <Link to="/dashboard" className="[&.active]:font-bold">
                            Dashboard (protected)
                        </Link>
                        <Link to="/auth/status" className="[&.active]:font-bold">
                            Auth Status
                        </Link>
                        <Link to="/profile" className="[&.active]:font-bold">
                            Profile
                        </Link>
                        <Logout />
                    </>
                ) : (
                    <>
                        <Link to="/signin" className="[&.active]:font-bold">
                            Signin
                        </Link>
                        <Link to="/signup" className="[&.active]:font-bold">
                            Signup
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
};
