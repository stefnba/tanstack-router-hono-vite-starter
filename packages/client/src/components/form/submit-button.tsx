import React from 'react';

import { Button } from '@app/client/components/ui/button';
import { Spinner } from '@app/client/components/ui/spinner';

export const SubmitButton = ({
    loadingText = 'Loading...',
    isLoading,
    children,
    ...props
}: React.ComponentProps<typeof Button> & { isLoading?: boolean; loadingText?: string }) => {
    return (
        <Button type="submit" disabled={isLoading} {...props}>
            {isLoading && <Spinner />}
            {isLoading ? loadingText : children || 'Submit'}
        </Button>
    );
};
