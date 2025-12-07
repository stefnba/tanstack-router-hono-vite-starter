import { AnyRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import { SearchParamView } from './search-param-view';

/**
 * A hook that creates a conditional rendering component (`View`) synchronized with a search parameter.
 *
 * This allows you to build "tabbed" or "multi-step" interfaces where the active state is stored
 * in the URL search parameters, making it shareable and persistent.
 *
 * The returned `View` component is pre-wired to the search param state, so you only need to
 * specify which view it represents.
 *
 * @template TRoute - The TanStack Router Route type
 * @template TViews - Tuple of valid view names
 *
 * @param options.route - The route instance from TanStack Router
 * @param options.key - The search param key to listen to
 * @param options.views - Array of valid view names (defines the allowed values)
 * @param options.defaultView - The default view (currently unused in logic, but useful for types)
 *
 * @returns Object containing the `View` component and current state
 *
 * @example
 * const { View, currentView } = useSearchParamView({
 *   route: Route,
 *   key: 'tab',
 *   views: ['overview', 'activity'],
 *   defaultView: 'overview'
 * });
 *
 * return (
 *   <div>
 *     <div className="tabs">
 *       <Link search={{ tab: 'overview' }}>Overview</Link>
 *       <Link search={{ tab: 'activity' }}>Activity</Link>
 *     </div>
 *
 *     <View viewToRender="overview">
 *       <OverviewPanel />
 *     </View>
 *
 *     <View viewToRender="activity">
 *       <ActivityList />
 *     </View>
 *   </div>
 * );
 */
export const useSearchParamView = <
    TRoute extends AnyRoute,
    const TViews extends readonly string[],
>({
    route,
    key,
    views,
    defaultView,
}: {
    route: TRoute;
    key: keyof TRoute['types']['fullSearchSchemaInput'] & string;
    views: TViews;
    defaultView: TViews[number];
}) => {
    const searchParams = route.useSearch();
    const currentView = searchParams?.[key];

    // ================================
    // Component
    // ================================

    const SearchParamViewComponent = useMemo(() => {
        return (
            props: Omit<
                React.ComponentProps<typeof SearchParamView<TViews>>,
                'currentView' | 'views'
            >
        ) => <SearchParamView currentView={currentView} views={views} {...props} />;
    }, [currentView, views]);

    return {
        key,
        currentView,
        views,
        defaultView,
        View: SearchParamViewComponent,
    };
};
