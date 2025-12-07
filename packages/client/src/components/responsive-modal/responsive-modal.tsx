import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ResponsiveModalContextValue {
    isMobile: boolean;
}

const ResponsiveModalContext = createContext<ResponsiveModalContextValue | null>(null);

const useResponsiveModalContext = () => {
    const context = useContext(ResponsiveModalContext);
    if (!context) {
        throw new Error('useResponsiveModalContext must be used within ResponsiveModal');
    }
    return context;
};

const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    auto: 'sm:max-w-[min(90vw,800px)]',
} as const;

type ModalSize = keyof typeof sizeClasses;

interface ResponsiveModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
    size?: ModalSize;
    className?: string;
}

const ResponsiveModal = ({
    open,
    onOpenChange,
    children,
    size = 'auto',
    className,
}: ResponsiveModalProps) => {
    const isMobile = useIsMobile();

    const content = (
        <ResponsiveModalContext.Provider value={{ isMobile }}>
            {children}
        </ResponsiveModalContext.Provider>
    );

    if (!isMobile) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={cn('p-0 gap-0', sizeClasses[size], className)}>
                    {content}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className={cn(className)}>{content}</DrawerContent>
        </Drawer>
    );
};

interface HeaderProps {
    children: ReactNode;
    className?: string;
}

const ResponsiveModalHeader = ({ children, className }: HeaderProps) => {
    const { isMobile } = useResponsiveModalContext();
    const Component = isMobile ? DrawerHeader : DialogHeader;
    return <Component className={cn('p-4', className)}>{children}</Component>;
};
ResponsiveModal.Header = ResponsiveModalHeader;

interface TitleProps {
    children: ReactNode;
    className?: string;
}

const ResponsiveModalTitle = ({ children, className }: TitleProps) => {
    const { isMobile } = useResponsiveModalContext();
    const Component = isMobile ? DrawerTitle : DialogTitle;
    return <Component className={className}>{children}</Component>;
};
ResponsiveModal.Title = ResponsiveModalTitle;

interface DescriptionProps {
    children: ReactNode;
    className?: string;
}

const ResponsiveModalDescription = ({ children, className }: DescriptionProps) => {
    const { isMobile } = useResponsiveModalContext();
    const Component = isMobile ? DrawerDescription : DialogDescription;
    return <Component className={className}>{children}</Component>;
};
ResponsiveModal.Description = ResponsiveModalDescription;

interface ContentProps {
    children: ReactNode;
    className?: string;
    scrollable?: boolean;
}

/**
 * Content container for the modal.
 * @param children - The content to display in the modal.
 * @param className - Additional CSS classes to apply to the content.
 * @param scrollable - Whether the content should be scrollable. Then it will add a max-h-[70vh] class to the content.
 */
ResponsiveModal.Content = ({ children, className, scrollable = true }: ContentProps) => {
    return (
        <div className={cn('px-4 pb-4', scrollable && 'overflow-y-auto max-h-[70vh]', className)}>
            {children}
        </div>
    );
};

interface FooterProps {
    children: ReactNode;
    className?: string;
}

/**
 * Footer container for the modal.
 * @param children - The content to display in the footer.
 * @param className - Additional CSS classes to apply to the footer.
 */
const ResponsiveModalFooter = ({ children, className }: FooterProps) => {
    const { isMobile } = useResponsiveModalContext();
    const Component = isMobile ? DrawerFooter : DialogFooter;

    return (
        <Component className={cn('p-4 gap-2', !isMobile && 'border-t ', className)}>
            {children}
        </Component>
    );
};
ResponsiveModal.Footer = ResponsiveModalFooter;

export type {
    ContentProps,
    DescriptionProps,
    FooterProps,
    HeaderProps,
    ModalSize,
    ResponsiveModalProps,
    TitleProps,
};

export { ResponsiveModal };
