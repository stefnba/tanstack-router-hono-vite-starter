import { useContext } from 'react';

import { ThemeProviderContext } from '@app/client/lib/theme/context';

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

    return context;
};
