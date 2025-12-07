import { createFileRoute, stripSearchParams } from '@tanstack/react-router';

import { createModal } from '@/components/responsive-modal/factory';
import { Button } from '@/components/ui/button';

const modalSchema = createModal('hey-modal');

export const Route = createFileRoute('/showroom/modal')({
    component: RouteComponent,
    validateSearch: modalSchema.schema,
    search: {
        // strip default values
        middlewares: [stripSearchParams(modalSchema.defaultValues)],
    },
});

function RouteComponent() {
    const { Modal, open, close } = modalSchema.useResponsiveModal(Route);

    return (
        <div>
            <Button onClick={open}>Open</Button>

            <Modal size="md">
                <Modal.Header>
                    <Modal.Title>Modal</Modal.Title>
                    <Modal.Description>Modal description</Modal.Description>
                </Modal.Header>
                <Modal.Content>
                    <div>Modal content</div>
                </Modal.Content>
                <Modal.Footer>
                    <Button onClick={close}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
