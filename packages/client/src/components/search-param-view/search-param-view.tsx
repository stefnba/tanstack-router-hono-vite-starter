import { ReactNode } from 'react';

export interface SearchParamViewProps<TViews extends readonly string[]> {
    /** List of all allowed views (used for type inference) */
    views: TViews;
    /** The actual current view from the search params/state */
    currentView: TViews[number];
    /** The specific view name this component should render for */
    viewToRender: TViews[number];
    /** The content to render when currentView matches viewToRender */
    children: ReactNode;
}

/**
 * A primitive component that conditionally renders its children based on the current active view.
 *
 * This component is typically not used directly. Instead, use the pre-bound `View` component
 * returned by `useSearchParamView` or `useResponsiveModal`, which automatically injects
 * `currentView` and `views`.
 *
 * @example
 * // Low-level usage (rare)
 * <SearchParamView
 *   views={['step1', 'step2']}
 *   currentView="step1"
 *   viewToRender="step1"
 * >
 *   <Step1 />
 * </SearchParamView>
 */
export function SearchParamView<TViews extends readonly string[]>({
    currentView,
    viewToRender,
    children,
}: SearchParamViewProps<TViews>) {
    // Only render if we have a current view and it matches what we want to render
    if (!currentView || currentView !== viewToRender) {
        return null;
    }

    return children;
}
