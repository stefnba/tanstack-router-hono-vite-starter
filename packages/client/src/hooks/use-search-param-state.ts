import { AnyRoute } from '@tanstack/react-router';
import { useCallback, useRef } from 'react';
import { z } from 'zod';

import { useSearchParamView } from '@app/client/components/search-param-view';

// Shared constants for options
export const OPTION_SHOW = z.enum(['show']);
export const OPTION_HIDE = z.enum(['hide']);

export const useSearchParamState = <
    TRoute extends AnyRoute,
    const TViews extends readonly string[],
    const TDefaultView extends TViews[number] = TViews[number],
>({
    route,
    key,
    views,
    defaultView,
    optionsEnum,
}: {
    route: TRoute;
    key: keyof TRoute['types']['fullSearchSchemaInput'] & string;
    views: TViews;
    defaultView: TDefaultView;
    optionsEnum: z.ZodEnum<Readonly<Record<string, string>>>; // Expected enum with 'show' and 'hide' values
}) => {
    const searchParams = route.useSearch();
    const navigate = route.useNavigate();

    // Use shared search param view logic
    const { View } = useSearchParamView({
        route,
        key,
        views,
        defaultView,
    });

    const currentView = searchParams?.[key] as TViews[number] | undefined;
    const isOpen = currentView !== optionsEnum.enum.hide;

    // ================================
    // Handlers
    // ================================

    const onOpenChange = useCallback(
        (open: boolean) => {
            navigate({
                search: {
                    ...searchParams,
                    [key]: open ? optionsEnum.enum.show : optionsEnum.enum.hide,
                },
            });
        },
        [key, navigate, searchParams, optionsEnum]
    );

    // Keep ref to avoid re-renders when passing to memoized components
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;

    const onOpen = useCallback(
        (view: TViews[number] = defaultView || views?.[0] || optionsEnum.enum.show) => {
            navigate({
                search: {
                    ...searchParams,
                    [key]: view,
                },
            });
        },
        [key, searchParams, navigate, defaultView, views, optionsEnum]
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

    const toggle = useCallback(() => {
        onOpenChangeRef.current(!isOpen);
    }, [isOpen]);

    return {
        isOpen,
        open: onOpen,
        changeView: onOpen,
        close: onClose,
        toggle,
        View,
        currentView,
        defaultView,
    };
};
