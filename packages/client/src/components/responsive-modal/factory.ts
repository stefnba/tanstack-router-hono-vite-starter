import { AnyRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { useResponsiveModal } from '@/components/responsive-modal/hooks';

export const MODAL_OPTION_SHOW = z.enum(['show']);
export const MODAL_OPTION_HIDE = z.enum(['hide']);
export const MODAL_OPTIONS = z.enum([MODAL_OPTION_SHOW.enum.show, MODAL_OPTION_HIDE.enum.hide]);

/**
 * Factory to create a Zod schema and default values for a type-safe modal state integrated with TanStack Router.
 *
 * This factory simplifies the creation of modal definitions that can be directly used in route definitions (`validateSearch`).
 * It ensures that URL search parameters are strictly typed and validated using Zod.
 *
 * It provides:
 * - A Zod schema for route validation
 * - Default values for route configuration
 * - A specialized `useResponsiveModal` hook pre-bound to the configured key
 *
 * @template K - The unique search parameter key for this modal (e.g., 'edit-user')
 * @template TViews - Tuple of view names (e.g., ['form', 'confirm']). Defaults to ['show'].
 * @template TDefaultView - The default view to show when opened.
 *
 * @param key - The URL search parameter key used to store the modal state.
 * @param views - Optional array of view names for multi-step modals.
 * @param defaultView - The view to display by default when the modal is opened.
 *
 * @returns Object containing the schema, defaultValues, and a type-safe hook to use in your component.
 *
 * @example
 * // 1. Define the modal (outside component)
 * const editModal = createModal('edit-user', ['form', 'confirm'], 'form');
 *
 * // 2. Add to Route definition
 * export const Route = createFileRoute('/users')({
 *   validateSearch: editModal.schema, // Combines with other schemas if needed
 *   search: {
 *     middlewares: [stripSearchParams(editModal.defaultValues)],
 *   },
 * });
 *
 * // 3. Use in Component
 * function Component() {
 *   const { Modal, open, close, View } = editModal.useResponsiveModal(Route);
 *
 *   return (
 *     <>
 *       <Button onClick={open}>Edit User</Button>
 *
 *       <Modal>
 *         <Modal.Header>
 *            <Modal.Title>Edit User</Modal.Title>
 *         </Modal.Header>
 *         <Modal.Content>
 *            <View views={['form']}>
 *               <Form />
 *            </View>
 *         </Modal.Content>
 *       </Modal>
 *     </>
 *   );
 * }
 */
export const createModal = <
    const K extends string,
    const TViews extends readonly string[] = [typeof MODAL_OPTION_SHOW.enum.show],
    const TDefaultView extends TViews[number] = TViews[number],
>(
    key: K,
    views?: TViews,
    defaultView?: TDefaultView
) => {
    // this will allow the modal to be opened with the default view or the views provided
    const modalOptions = z.union([
        z.enum(views ?? [MODAL_OPTION_SHOW.enum.show]),
        MODAL_OPTION_HIDE,
        MODAL_OPTION_SHOW,
    ]);

    // this will hide the modal and will not be added to search params if stripSearchParams is used
    const hideOption = MODAL_OPTIONS.enum.hide;

    // Type assertion is necessary here because TypeScript widens computed property names
    // (e.g., [key]) to a generic string index signature (e.g., [x: string]: ...).
    // This assertion restores the specific literal key `K`, ensuring type safety.
    // It is safe because we are constructing the object with the exact key `key` at runtime.
    const schema = z.object({
        [key]: modalOptions.default(hideOption),
    }) as z.ZodObject<{
        [P in K]: z.ZodDefault<typeof modalOptions>;
    }>;
    const defaultValues = {
        [key as K]: hideOption,
    } as {
        [P in K]: typeof hideOption;
    };

    // export a hook that can be used to open and close the modal
    const useModalHook = <TRoute extends AnyRoute>(route: TRoute) =>
        useResponsiveModal({
            key,
            route,
            views,
            defaultView,
        });

    return {
        views,
        defaultView: defaultView,
        key,
        schema,
        defaultValues,
        useResponsiveModal: useModalHook,
    };
};
