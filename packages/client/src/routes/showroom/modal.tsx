import { createFileRoute, stripSearchParams } from '@tanstack/react-router';

import { createModal } from '@/components/responsive-modal/factory';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const testModal = createModal('test-modal', ['create', 'update'], 'create');

export const Route = createFileRoute('/showroom/modal')({
    component: RouteComponent,
    validateSearch: testModal.schema,
    search: {
        // strip default values
        middlewares: [stripSearchParams(testModal.defaultValues)],
    },
});

function RouteComponent() {
    const { Modal, open, close, changeView, View, currentView, views, defaultView } =
        testModal.useResponsiveModal(Route);

    return (
        <div>
            <Button onClick={() => open()}>Open</Button>

            <Modal size="md">
                <Modal.Header>
                    <Modal.Title>Modal</Modal.Title>
                    <Modal.Description>Modal description</Modal.Description>
                </Modal.Header>
                <Modal.Content>
                    <p>Current view: {currentView}</p>
                    <p>Views: {views?.join(', ')}</p>
                    <p>Default view: {defaultView}</p>
                    <Separator className="my-4" />
                    <div className="flex gap-2">
                        <Button onClick={() => changeView('create')}>Open view 1</Button>
                        <Button onClick={() => changeView('update')}>Open view 2</Button>
                    </div>
                    <Separator className="my-4" />
                    <View viewToRender="create">Modal content 1</View>
                    <View viewToRender="update">Modal content 2</View>
                </Modal.Content>
                <Modal.Footer>
                    <Button onClick={close}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
