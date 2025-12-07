import { AnyRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import { SHEET_OPTIONS } from '@/components/responsive-sheet/factory';
import { ResponsiveSheet } from '@/components/responsive-sheet/responsive-sheet';
import { useSearchParamState } from '@/hooks/use-search-param-state';

/**
 * A hook for managing responsive sheet state synchronized with TanStack Router search parameters.
 *
 * This hook is typically used via the `createSheet` factory.
 * It manages the sheet's open/closed state and active view using the URL search parameters.
 *
 * Features:
 * - **Deep Integration**: Directly reads/writes to TanStack Router's search params.
 * - **Flicker-free Transitions**: Uses stable callbacks to prevent sheet re-mounting when switching views.
 * - **DRY Implementation**: Uses `useSearchParamState` shared with Modals.
 *
 * @template TRoute - The TanStack Router Route instance type.
 * @template TViews - Tuple of valid view names.
 *
 * @param options - Configuration options
 * @param options.route - The Route instance.
 * @param options.key - The specific search param key.
 * @param options.views - Optional list of view names.
 * @param options.defaultView - The view to show when opened.
 */
export const useResponsiveSheet = <
    TRoute extends AnyRoute,
    const TViews extends readonly string[] = [typeof SHEET_OPTIONS.enum.show],
    const TDefaultView extends TViews[number] = TViews[number],
>({
    route,
    key,
    views,
    defaultView,
}: {
    route: TRoute;
    key: keyof TRoute['types']['fullSearchSchemaInput'] & string;
    views?: TViews;
    defaultView?: TDefaultView;
}) => {
    const finalViews = (views ?? [SHEET_OPTIONS.enum.show]) as TViews;
    const finalDefaultView = (defaultView || SHEET_OPTIONS.enum.show) as TDefaultView;

    // Use shared state logic
    const { isOpen, open, changeView, close, toggle, View, currentView } = useSearchParamState({
        route,
        key,
        views: finalViews,
        defaultView: finalDefaultView,
        optionsEnum: SHEET_OPTIONS,
    });

    // ================================
    // Component
    // ================================

    const ResponsiveSheetComponent = useMemo(() => {
        const Component = (
            props: Omit<React.ComponentProps<typeof ResponsiveSheet>, 'open' | 'onOpenChange'>
        ) => <ResponsiveSheet open={isOpen} onOpenChange={close} {...props} />;

        return Object.assign(Component, {
            Header: ResponsiveSheet.Header,
            Title: ResponsiveSheet.Title,
            Description: ResponsiveSheet.Description,
            Content: ResponsiveSheet.Content,
            Footer: ResponsiveSheet.Footer,
        });
    }, [isOpen, close]);

    return {
        isOpen,
        open,
        changeView,
        close,
        toggle,
        Sheet: ResponsiveSheetComponent,
        View,
        views: finalViews,
        defaultView: finalDefaultView,
        currentView,
    };
};
