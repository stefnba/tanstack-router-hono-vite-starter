import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/hello')({
    component: Hello,
})

function Hello() {
    return (
        <div className="p-2 text-2xl font-bold">
            <div>Hello from Hello!</div>
            <Button
                onClick={() => {
                    console.log('Button clicked')
                }}
            >
                Click me
            </Button>
        </div>
    )
}
