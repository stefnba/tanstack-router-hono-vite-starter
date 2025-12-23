import { Moon, Sun } from 'lucide-react';

import { Button } from '@app/client/components/ui/button';
import { useTheme } from '@app/client/lib/theme/hook';

export function ModeToggle() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        // If current is system, we might default to dark or light depending on logic,
        // but here we just toggle between explicit dark and light for simplicity
        // or cycle if needed. The user asked for a simple toggle.
        // If it's dark, go light. Otherwise go dark.
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
