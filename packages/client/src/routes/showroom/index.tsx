import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/showroom/')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className="flex flex-col gap-2">
            <Link to="/showroom/form">Form</Link>
            <Link to="/showroom/modal">Modal</Link>
            <Link to="/showroom/sheet">Sheet</Link>
        </div>
    );
}
