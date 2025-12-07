import { AnyRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { useResponsiveSheet } from '@/components/responsive-sheet/hooks';

// Re-export common options for consistency (DRY from modal factory logic ideally, but kept separate for clarity)
export const SHEET_OPTION_SHOW = z.enum(['show']);
export const SHEET_OPTION_HIDE = z.enum(['hide']);
export const SHEET_OPTIONS = z.enum([SHEET_OPTION_SHOW.enum.show, SHEET_OPTION_HIDE.enum.hide]);

/**
 * Factory to create a Zod schema and default values for a type-safe sheet state integrated with TanStack Router.
 *
 * This factory works exactly like `createModal` but for sheets/drawers.
 * It ensures that URL search parameters are strictly typed and validated using Zod.
 *
 * @template K - The unique search parameter key for this sheet (e.g., 'edit-profile')
 * @template TViews - Tuple of view names.
 * @template TDefaultView - The default view to show when opened.
 *
 * @param key - The URL search parameter key used to store the sheet state.
 * @param views - Optional array of view names for multi-step sheets.
 * @param defaultView - The view to display by default when the sheet is opened.
 *
 * @returns Object containing the schema, defaultValues, and a type-safe hook `useResponsiveSheet`.
 */
export const createSheet = <
    const K extends string,
    const TViews extends readonly string[] = [typeof SHEET_OPTION_SHOW.enum.show],
    const TDefaultView extends TViews[number] = TViews[number],
>(
    key: K,
    views?: TViews,
    defaultView?: TDefaultView
) => {
    // this will allow the sheet to be opened with the default view or the views provided
    const sheetOptions = z.union([
        z.enum(views ?? [SHEET_OPTION_SHOW.enum.show]),
        SHEET_OPTION_HIDE,
        SHEET_OPTION_SHOW,
    ]);

    // this will hide the sheet and will not be added to search params if stripSearchParams is used
    const hideOption = SHEET_OPTIONS.enum.hide;

    // Type assertion is necessary here because TypeScript widens computed property names
    const schema = z.object({
        [key]: sheetOptions.default(hideOption),
    }) as z.ZodObject<{
        [P in K]: z.ZodDefault<typeof sheetOptions>;
    }>;

    const defaultValues = {
        [key]: hideOption,
    } as {
        [P in K]: typeof hideOption;
    };

    // export a hook that can be used to open and close the sheet
    const useSheetHook = <TRoute extends AnyRoute>(route: TRoute) =>
        useResponsiveSheet({
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
        useResponsiveSheet: useSheetHook,
    };
};
