import { createFileRoute, stripSearchParams } from '@tanstack/react-router';

import { createModal } from '@/components/responsive-modal/factory';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const modalSchema = createModal('hey-modal', ['view1', 'view2'], 'view1');

export const Route = createFileRoute('/showroom/modal')({
    component: RouteComponent,
    validateSearch: modalSchema.schema,
    search: {
        // strip default values
        middlewares: [stripSearchParams(modalSchema.defaultValues)],
    },
});

function RouteComponent() {
    const { Modal, open, close, changeView, View, currentView, views, defaultView } =
        modalSchema.useResponsiveModal(Route);

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
                        <Button onClick={() => changeView('view1')}>Open view 1</Button>
                        <Button onClick={() => changeView('view2')}>Open view 2</Button>
                    </div>
                    <Separator className="my-4" />
                    <View viewToRender="view1">Modal content 1</View>
                    <View viewToRender="view2">Modal content 2</View>
                </Modal.Content>
                <Modal.Footer>
                    <Button onClick={close}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
