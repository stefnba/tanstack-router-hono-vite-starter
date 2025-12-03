import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    const { auth } = Route.useRouteContext()
    return (
        <div>
            Hello "/_protected/dashboard"! {JSON.stringify(auth)}
            <Button onClick={() => auth.logout()}>Logout</Button>
        </div>
    )
}
