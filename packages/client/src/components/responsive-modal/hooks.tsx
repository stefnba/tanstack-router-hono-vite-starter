import { AnyRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import { MODAL_OPTIONS } from '@/components/responsive-modal/factory';
import { ResponsiveModal } from '@/components/responsive-modal/responsive-modal';
import { useSearchParamState } from '@/hooks/use-search-param-state';

/**
 * A hook for managing responsive modal state synchronized with TanStack Router search parameters.
 *
 * This hook is typically used via the `createModal` factory rather than directly, but can be used standalone.
 * It manages the modal's open/closed state and active view using the URL search parameters, ensuring
 * that the modal state is shareable and persistent across refreshes.
 *
 * Features:
 * - **Deep Integration**: Directly reads/writes to TanStack Router's search params.
 * - **Multi-view Support**: Manage complex flows (e.g., Form -> Confirm -> Success) within one modal.
 * - **Flicker-free Transitions**: Uses stable callbacks and refs to prevent modal re-mounting when switching views.
 * - **Type Safe**: Fully typed views and search param keys.
 *
 * @template TRoute - The TanStack Router Route instance type.
 * @template TViews - Tuple of valid view names.
 *
 * @param options - Configuration options
 * @param options.route - The Route instance from `createFileRoute` (provides `useSearch` and `useNavigate`).
 * @param options.key - The specific search param key used for this modal.
 * @param options.views - Optional list of view names.
 * @param options.defaultView - The view to show when opened (defaults to 'show' or the first view).
 *
 * @returns Object containing:
 * - `Modal`: The modal component pre-wired with open/close state.
 * - `View`: A component to conditionally render content based on the current view.
 * - `open`: Function to open the modal (optionally to a specific view).
 * - `close`: Function to close the modal.
 * - `toggle`: Function to toggle state.
 * - `isOpen`: Boolean state.
 * - `currentView`: The current active view name.
 *
 * @example
 * // Direct usage (without factory):
 * const { Modal, open, close } = useResponsiveModal({
 *   route: Route,
 *   key: 'settings-modal',
 *   views: ['general', 'advanced'],
 * });
 *
 * return (
 *   <Modal>
 *      <Button onClick={() => open('advanced')}>Open Advanced Settings</Button>
 *   </Modal>
 * )
 */
export const useResponsiveModal = <
    TRoute extends AnyRoute,
    const TViews extends readonly string[] = [typeof MODAL_OPTIONS.enum.show],
>({
    route,
    key,
    views,
    defaultView = MODAL_OPTIONS.enum.show,
}: {
    route: TRoute;
    key: keyof TRoute['types']['fullSearchSchemaInput'] & string;
    views?: TViews;
    defaultView?: TViews[number];
}) => {
    const finalViews = (views ?? [MODAL_OPTIONS.enum.show]) as TViews;

    // Use shared state logic
    const { isOpen, open, changeView, close, toggle, View, currentView } = useSearchParamState({
        route,
        key,
        views: finalViews,
        defaultView,
        optionsEnum: MODAL_OPTIONS,
    });

    // ================================
    // Component
    // ================================

    const ResponsiveModalComponent = useMemo(() => {
        const Component = (
            props: Omit<React.ComponentProps<typeof ResponsiveModal>, 'open' | 'onOpenChange'>
        ) => <ResponsiveModal open={isOpen} onOpenChange={close} {...props} />;

        return Object.assign(Component, {
            Header: ResponsiveModal.Header,
            Title: ResponsiveModal.Title,
            Description: ResponsiveModal.Description,
            Content: ResponsiveModal.Content,
            Footer: ResponsiveModal.Footer,
        });
    }, [isOpen, close]);

    return {
        isOpen,
        open,
        changeView,
        close,
        toggle,
        Modal: ResponsiveModalComponent,
        View,
        views,
        defaultView,
        currentView,
    };
};
