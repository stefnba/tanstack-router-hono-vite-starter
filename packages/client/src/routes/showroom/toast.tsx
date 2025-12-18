import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@app/client/components/ui/button';
import { notification } from '@app/client/lib/notification';

export const Route = createFileRoute('/showroom/toast')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <div className=" space-x-2 p-4">
            <Button
                variant="outline"
                onClick={() => notification.success('This is a success notification')}
            >
                Success
            </Button>
            <Button
                variant="outline"
                onClick={() => notification.info('This is a info notification')}
            >
                Info
            </Button>
            <Button
                variant="outline"
                onClick={() => notification.warning('This is a warning notification')}
            >
                Warning
            </Button>
            <Button
                variant="outline"
                onClick={() => notification.error('This is a error notification')}
            >
                Error
            </Button>
        </div>
    );
}
