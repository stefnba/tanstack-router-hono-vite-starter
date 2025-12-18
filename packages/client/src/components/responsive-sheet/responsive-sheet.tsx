import { ReactNode } from 'react';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@app/client/components/ui/sheet';
import { cn } from '@app/client/lib/utils';

export interface ResponsiveSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
    className?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
}

const ResponsiveSheet = ({
    open,
    onOpenChange,
    children,
    className,
    side = 'right',
}: ResponsiveSheetProps) => {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side={side} className={cn('p-0 gap-0', className)}>
                {children}
            </SheetContent>
        </Sheet>
    );
};

// ============================================================================
// Header
// ============================================================================

export interface HeaderProps {
    children: ReactNode;
    className?: string;
}

const ResponsiveSheetHeader = ({ children, className }: HeaderProps) => {
    return <SheetHeader className={cn('p-4', className)}>{children}</SheetHeader>;
};
ResponsiveSheet.Header = ResponsiveSheetHeader;

// ============================================================================
// Title
// ============================================================================

export interface TitleProps {
    children: ReactNode;
    className?: string;
}

const ResponsiveSheetTitle = ({ children, className }: TitleProps) => {
    return <SheetTitle className={className}>{children}</SheetTitle>;
};
ResponsiveSheet.Title = ResponsiveSheetTitle;

// ============================================================================
// Description
// ============================================================================

export interface DescriptionProps {
    children: ReactNode;
    className?: string;
}

const ResponsiveSheetDescription = ({ children, className }: DescriptionProps) => {
    return <SheetDescription className={className}>{children}</SheetDescription>;
};
ResponsiveSheet.Description = ResponsiveSheetDescription;

// ============================================================================
// Content
// ============================================================================

export interface ContentProps {
    children: ReactNode;
    className?: string;
    scrollable?: boolean;
}

/**
 * Content container for the sheet.
 * @param children - The content to display in the sheet.
 * @param className - Additional CSS classes.
 * @param scrollable - Whether the content should be scrollable. Adds overflow-y-auto and flex-1.
 */
ResponsiveSheet.Content = ({ children, className, scrollable = true }: ContentProps) => {
    return (
        <div
            className={cn(
                'px-4 pb-4',
                scrollable && 'overflow-y-auto flex-1', // Sheets are usually full height flex cols
                className
            )}
        >
            {children}
        </div>
    );
};

// ============================================================================
// Footer
// ============================================================================

export interface FooterProps {
    children: ReactNode;
    className?: string;
}

const ResponsiveSheetFooter = ({ children, className }: FooterProps) => {
    return (
        <SheetFooter className={cn('p-4 gap-2 border-t mt-auto', className)}>
            {children}
        </SheetFooter>
    );
};
ResponsiveSheet.Footer = ResponsiveSheetFooter;

export { ResponsiveSheet };
