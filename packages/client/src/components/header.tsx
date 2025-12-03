import { Link } from '@tanstack/react-router';

export const Header = () => {
    return (
        <header>
            <div className="p-4 gap-2 flex">
                <Link to="/" className="[&.active]:font-bold">
                    Home
                </Link>
                <Link to="/about" className="[&.active]:font-bold">
                    About
                </Link>
                <Link to="/posts" className="[&.active]:font-bold">
                    Posts
                </Link>
                <Link to="/dashboard" className="[&.active]:font-bold">
                    Dashboard (protected)
                </Link>
                <Link to="/signin" className="[&.active]:font-bold">
                    Signin
                </Link>
                <Link to="/signup" className="[&.active]:font-bold">
                    Signup
                </Link>
            </div>
        </header>
    );
};
