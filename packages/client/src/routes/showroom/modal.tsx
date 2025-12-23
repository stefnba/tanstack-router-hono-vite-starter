import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import z from 'zod';

import { createModal } from '@app/client/components/responsive-modal';
import { Button } from '@app/client/components/ui/button';
import { Separator } from '@app/client/components/ui/separator';

const testModalWithViews = createModal('test-modal', ['create', 'update'], 'create');
const testModalWithoutViews = createModal('test-modal-without-views', ['show']);

export const Route = createFileRoute('/showroom/modal')({
    component: RouteComponent,
    validateSearch: z.object({
        ...testModalWithViews.schema.shape,
        ...testModalWithoutViews.schema.shape,
    }),
    search: {
        // strip default values
        middlewares: [
            stripSearchParams(testModalWithViews.defaultValues),
            stripSearchParams(testModalWithoutViews.defaultValues),
        ],
    },
});

function RouteComponent() {
    const { Modal, open, close, changeView, View, currentView, views, defaultView } =
        testModalWithViews.useResponsiveModal(Route);

    const testModalNoViews = testModalWithoutViews.useResponsiveModal(Route);

    return (
        <div>
            <Button onClick={() => open()}>Open</Button>
            <Button onClick={() => testModalNoViews.open()}>Open without views</Button>

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

            <testModalNoViews.Modal>
                <testModalNoViews.Modal.Header>
                    <testModalNoViews.Modal.Title>Modal without views</testModalNoViews.Modal.Title>
                    <testModalNoViews.Modal.Description>
                        Modal description without views
                    </testModalNoViews.Modal.Description>
                </testModalNoViews.Modal.Header>
                <testModalNoViews.Modal.Content className="p-4">
                    <testModalNoViews.View viewToRender="show">
                        Modal content without views
                    </testModalNoViews.View>
                </testModalNoViews.Modal.Content>
            </testModalNoViews.Modal>
        </div>
    );
}
