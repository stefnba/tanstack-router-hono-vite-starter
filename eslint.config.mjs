import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    // 1. Global Ignores
    { ignores: ['dist', 'node_modules', '**/*.gen.ts', 'out/', 'public/'] },

    // 2. Base JS Configuration
    js.configs.recommended,

    // 3. TypeScript Configuration (spread the array)
    ...tseslint.configs.recommended,

    // 4. React & Project Specific Rules
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2021,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'unused-imports': unusedImports,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            // Disable the rule that prevents empty interfaces (common in API types)
            '@typescript-eslint/no-empty-interface': 'off',

            // Unused imports and vars configuration
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
        },
    },

    // 5. Prettier Config (must be last to override others)
    eslintConfigPrettier,
]);
