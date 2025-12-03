import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected')({
    component: RouteComponent,
    beforeLoad: ({ context, location }) => {
        console.log('dashboard beforeLoad', context.auth)
        if (!context.auth.isAuthenticated) {
            throw redirect({
                to: '/',
                search: {
                    redirect: location.href,
                },
            })
        }
    },
})

function RouteComponent() {
    return <Outlet />
}
