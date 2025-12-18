import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    // 1. Global Ignores
    { ignores: ['**/dist', '**/node_modules', '**/*.gen.ts', 'out/', 'public/'] },

    // 2. Base Configurations
    js.configs.recommended,
    ...tseslint.configs.recommended,

    // 3. Project Rules
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2021,
            globals: globals.browser,
            parserOptions: {
                project: [
                    './tsconfig.json',
                    './packages/*/tsconfig.json',
                    './packages/*/tsconfig.node.json',
                    './packages/*/tsconfig.test.json',
                ],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            // React Hooks & Refresh
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

            // Restore your preferred clean rules
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',

            // Standard unused vars (warns only, VS Code 'organizeImports' will handle removal)
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

            // Restore strict type checks
            '@typescript-eslint/no-explicit-any': 'warn',

            // No imprt from server except types
            'no-restricted-imports': 'off',
            '@typescript-eslint/no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: '@app/server',
                            message: 'Only import TYPES from @app/server. Use "import type ..."',
                            allowTypeImports: true,
                        },
                    ],
                    patterns: [
                        {
                            group: ['@app/server/*'],
                            message:
                                'Do not import implementation details from server. Use type imports only.',
                            allowTypeImports: true,
                        },
                    ],
                },
            ],
        },
    },

    // 4. Prettier (must be last)
    eslintConfigPrettier,
]);
