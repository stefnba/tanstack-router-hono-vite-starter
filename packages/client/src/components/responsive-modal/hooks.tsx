import { AnyRoute } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';

import { MODAL_OPTIONS } from '@/components/responsive-modal/factory';
import { ResponsiveModal } from '@/components/responsive-modal/responsive-modal';

export const useResponsiveModal = <TRoute extends AnyRoute>({
    route,
    key,
}: {
    route: TRoute;
    key: keyof TRoute['types']['fullSearchSchemaInput'] & string;
}) => {
    const searchParams = route.useSearch();
    const navigate = route.useNavigate();

    const isOpen = searchParams?.[key] !== MODAL_OPTIONS.enum.hide;

    const onOpenChange = useCallback(
        (open: boolean) => {
            navigate({
                search: {
                    ...searchParams,
                    [key]: open ? MODAL_OPTIONS.enum.show : MODAL_OPTIONS.enum.hide,
                },
            });
        },
        [key, searchParams, navigate]
    );

    // ================================
    // Component
    // ================================

    const ResponsiveModalComponent = useMemo(() => {
        const Component = (
            props: Omit<React.ComponentProps<typeof ResponsiveModal>, 'open' | 'onOpenChange'>
        ) => <ResponsiveModal open={isOpen} onOpenChange={onOpenChange} {...props} />;

        return Object.assign(Component, {
            Header: ResponsiveModal.Header,
            Title: ResponsiveModal.Title,
            Description: ResponsiveModal.Description,
            Content: ResponsiveModal.Content,
            Footer: ResponsiveModal.Footer,
        });
    }, [isOpen, onOpenChange]);

    return {
        isOpen: false,
        open: () => onOpenChange(true),
        close: () => onOpenChange(false),
        toggle: () => onOpenChange(!isOpen),
        Modal: ResponsiveModalComponent,
    };
};
