import { AnyRoute } from '@tanstack/react-router';
import { useCallback, useMemo, useRef } from 'react';

import { MODAL_OPTIONS } from '@/components/responsive-modal/factory';
import { ResponsiveModal } from '@/components/responsive-modal/responsive-modal';
import { useSearchParamView } from '@/components/search-param-view';

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
    const searchParams = route.useSearch();
    const navigate = route.useNavigate();

    const finalViews = (views ?? [MODAL_OPTIONS.enum.show]) as TViews;

    const { View } = useSearchParamView({
        route,
        key,
        views: finalViews,
        defaultView: defaultView,
    });

    const currentView = searchParams?.[key];
    const isOpen = currentView !== MODAL_OPTIONS.enum.hide;

    // ================================
    // Handlers
    // ================================

    const onOpenChange = useCallback(
        (open: boolean) => {
            navigate({
                search: {
                    ...searchParams,
                    [key]: open ? MODAL_OPTIONS.enum.show : MODAL_OPTIONS.enum.hide,
                },
            });
        },
        [key, navigate, searchParams]
    );

    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;

    const onOpen = useCallback(
        (view: TViews[number] = defaultView || views?.[0] || MODAL_OPTIONS.enum.show) => {
            navigate({
                search: {
                    ...searchParams,
                    [key]: view,
                },
            });
        },
        [key, searchParams, navigate, defaultView, views]
    );

    /**
     * Stable close handler that avoids recreating the modal component during view changes.
     *
     * Why this is needed:
     * 1. `onOpenChange` depends on `searchParams` (to preserve other params), so it changes on every navigation/view change.
     * 2. If we passed `onOpenChange` directly to `ResponsiveModal`, the modal would re-mount when switching views, causing a flicker.
     * 3. By using a ref to hold the latest `onOpenChange` and a stable `onClose` callback, we break the dependency chain.
     *    The `ResponsiveModal` only sees a stable `onClose` function and doesn't re-render/flicker when search params change.
     */
    const onClose = useCallback(() => {
        onOpenChangeRef.current(false);
    }, []);

    // ================================
    // Component
    // ================================

    const ResponsiveModalComponent = useMemo(() => {
        const Component = (
            props: Omit<React.ComponentProps<typeof ResponsiveModal>, 'open' | 'onOpenChange'>
        ) => <ResponsiveModal open={isOpen} onOpenChange={onClose} {...props} />;

        return Object.assign(Component, {
            Header: ResponsiveModal.Header,
            Title: ResponsiveModal.Title,
            Description: ResponsiveModal.Description,
            Content: ResponsiveModal.Content,
            Footer: ResponsiveModal.Footer,
        });
    }, [isOpen, onClose]);

    return {
        isOpen,
        open: onOpen,
        changeView: onOpen,
        close: onClose,
        toggle: () => onOpenChangeRef.current(!isOpen),
        Modal: ResponsiveModalComponent,
        View,
        views,
        defaultView,
        currentView,
    };
};
