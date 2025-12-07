import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/showroom/')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div>
            <Link to="/showroom/form">Form</Link>
            <Link to="/showroom/modal">Form</Link>
        </div>
    );
}
