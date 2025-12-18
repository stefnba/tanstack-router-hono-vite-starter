import { createFileRoute, stripSearchParams } from '@tanstack/react-router';

import { createSheet } from '@app/client/components/responsive-sheet';
import { Button } from '@app/client/components/ui/button';
import { Separator } from '@app/client/components/ui/separator';

const testSheet = createSheet('test-sheet', ['view1', 'view2'], 'view1');

export const Route = createFileRoute('/showroom/sheet')({
    component: RouteComponent,
    validateSearch: testSheet.schema,
    search: {
        // strip default values
        middlewares: [stripSearchParams(testSheet.defaultValues)],
    },
});

function RouteComponent() {
    const { Sheet, open, close, changeView, View, currentView, views, defaultView } =
        testSheet.useResponsiveSheet(Route);

    return (
        <div>
            <Button onClick={() => open()}>Open</Button>

            <Sheet>
                <Sheet.Header>
                    <Sheet.Title>Modal</Sheet.Title>
                    <Sheet.Description>Modal description</Sheet.Description>
                </Sheet.Header>
                <Sheet.Content>
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
                </Sheet.Content>
                <Sheet.Footer>
                    <Button onClick={close}>Close</Button>
                </Sheet.Footer>
            </Sheet>
        </div>
    );
}
