import type React from 'react';
import { type ExternalToast, toast as sonnerToast } from 'sonner';

const error = (message: string | React.ReactNode, data?: ExternalToast) => {
    return sonnerToast.error(message, {
        ...data,
        style: {
            ...data?.style,
            '--normal-bg': 'color-mix(in oklab, var(--destructive) 10%, var(--background))',
            '--normal-text': 'var(--destructive)',
            '--normal-border': 'var(--destructive)',
        } as React.CSSProperties,
    });
};

const success = (message: string | React.ReactNode, data?: ExternalToast) => {
    return sonnerToast.success(message, {
        ...data,
        style: {
            ...data?.style,
            '--normal-bg':
                'color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))',
            '--normal-text': 'light-dark(var(--color-green-600), var(--color-green-400))',
            '--normal-border': 'light-dark(var(--color-green-600), var(--color-green-400))',
        } as React.CSSProperties,
    });
};

const warning = (message: string | React.ReactNode, data?: ExternalToast) => {
    return sonnerToast.success(message, {
        ...data,
        style: {
            ...data?.style,
            '--normal-bg':
                'color-mix(in oklab, light-dark(var(--color-amber-600), var(--color-amber-400)) 10%, var(--background))',
            '--normal-text': 'light-dark(var(--color-amber-600), var(--color-amber-400))',
            '--normal-border': 'light-dark(var(--color-amber-600), var(--color-amber-400))',
        } as React.CSSProperties,
    });
};

const info = (message: string | React.ReactNode, data?: ExternalToast) => {
    return sonnerToast.success(message, {
        ...data,
        style: {
            ...data?.style,
            '--normal-bg':
                'color-mix(in oklab, light-dark(var(--color-sky-600), var(--color-sky-400)) 10%, var(--background))',
            '--normal-text': 'light-dark(var(--color-sky-600), var(--color-sky-400))',
            '--normal-border': 'light-dark(var(--color-sky-600), var(--color-sky-400))',
        } as React.CSSProperties,
    });
};

export const notification = {
    success,
    info,
    warning,
    error,
};
