import { AnyRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { useResponsiveModal } from '@/components/responsive-modal/hooks';

export const MODAL_OPTIONS = z.enum(['show', 'hide']);

/**
 * Factory to create a Zod schema and default values for a modal state.
 * The schema allows 'show' | 'hide' values.
 */
export const createModal = <const K extends string>(key: K) => {
    const defaultOption = MODAL_OPTIONS.enum.hide;

    // Type assertion is necessary here because TypeScript widens computed property names
    // (e.g., [key]) to a generic string index signature (e.g., [x: string]: ...).
    // This assertion restores the specific literal key `K`, ensuring type safety.
    // It is safe because we are constructing the object with the exact key `key` at runtime.
    const schema = z.object({
        [key]: MODAL_OPTIONS.default(defaultOption),
    }) as z.ZodObject<{
        [P in K]: z.ZodDefault<typeof MODAL_OPTIONS>;
    }>;
    const defaultValues = {
        [key as K]: defaultOption,
    } as {
        [P in K]: typeof defaultOption;
    };

    // export a hook that can be used to open and close the modal
    const useHook = <TRoute extends AnyRoute>(route: TRoute) =>
        useResponsiveModal<TRoute>({
            key,
            route,
        });

    return {
        key,
        schema,
        defaultValues,
        useResponsiveModal: useHook,
    };
};
