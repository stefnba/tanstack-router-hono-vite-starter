import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/showroom/')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="flex flex-col gap-2 p-4">
            <Link className="text-blue-500 hover:underline" to="/showroom/form">
                Form
            </Link>
            <Link className="text-blue-500 hover:underline" to="/showroom/modal">
                Modal
            </Link>
            <Link className="text-blue-500 hover:underline" to="/showroom/sheet">
                Sheet
            </Link>
            <Link className="text-blue-500 hover:underline" to="/showroom/toast">
                Toast
            </Link>
        </div>
    );
}
