import { CatchBoundary } from '@tanstack/react-router';
import { ReactNode, Suspense } from 'react';

import { Button } from '@app/client/components/ui/button';
import { Spinner } from '@app/client/components/ui/spinner';
import { normalizeApiError } from '@app/client/lib/error/handler';

interface AsyncBoundaryProps {
    children: ReactNode;
    pendingFallback?: ReactNode;
    errorFallback?: (props: { error: Error; reset: () => void }) => ReactNode;
    onCatch?: (error: Error) => void;
    resourceName?: string;
}

/**
 * AsyncBoundary
 *
 * A wrapper component that combines React Suspense and TanStack Router's CatchBoundary
 * to handle loading and error states for async data fetching.
 *
 * Best Practice Pattern: "Render-as-you-fetch"
 * 1. Start fetching in the Route loader (using queryClient.prefetchQuery without awaiting the promise).
 * 2. Don't await the promise in the loader (avoids blocking navigation).
 * 3. Use `useSuspenseQuery` in the child component.
 * 4. Wrap the child component with <AsyncBoundary>.
 *
 * Benefit of using queryClient.prefetchQuery over queryClient.ensureQueryData:
 * - ensureQueryData (awaited): Blocks the route transition until data arrives. The user sees the old page for a while after clicking, then the new page snaps in fully loaded.
 * - prefetchQuery (not awaited): Starts the fetch and immediately transitions to the new page. The new page renders Suspense fallbacks (spinners) instantly. This feels faster and more responsive to the user.
 *
 * @example
 * // In Parent Component
 * <AsyncBoundary>
 *   <DataComponent />
 * </AsyncBoundary>
 *
 * // In DataComponent
 * const { data } = useSuspenseQuery(...)
 */
export function AsyncBoundary({
    children,
    pendingFallback = (
        <div className="flex items-center justify-center p-4">
            <Spinner className="size-6" />
        </div>
    ),
    errorFallback,
    onCatch,
    resourceName,
}: AsyncBoundaryProps) {
    return (
        <CatchBoundary
            getResetKey={() => 'reset'}
            onCatch={(error) => {
                // Optional: Log to error reporting service here
                if (import.meta.env.DEV) {
                    console.error('AsyncBoundary caught:', error);
                }
                onCatch?.(error);
            }}
            errorComponent={({ error, reset }) => {
                if (errorFallback) {
                    return errorFallback({ error, reset });
                }

                const normalizedError = normalizeApiError(error);

                return (
                    <div className="flex flex-col gap-4 p-4 items-center justify-center min-h-[200px] border rounded-md bg-destructive/10">
                        <div className="text-destructive font-medium text-lg">
                            {resourceName
                                ? `${resourceName} could not be loaded`
                                : 'There was an error loading the data'}
                        </div>
                        <div className="text-muted-foreground text-sm text-center">
                            {normalizedError.error.message || error.message || 'Unknown error'}
                        </div>
                        <Button variant="outline" onClick={reset}>
                            Try Again
                        </Button>
                    </div>
                );
            }}
        >
            <Suspense fallback={pendingFallback}>{children}</Suspense>
        </CatchBoundary>
    );
}
