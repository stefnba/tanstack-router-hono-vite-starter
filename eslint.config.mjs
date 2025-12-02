import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfig([
    // 1. Global Ignores
    { ignores: ['dist', 'node_modules', '**/*.gen.ts'] },

    // 2. Base JS Configuration
    js.configs.recommended,

    // 3. TypeScript Configuration (spread the array)
    ...tseslint.configs.recommended,

    // 4. React & Project Specific Rules
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            // Disable the rule that prevents empty interfaces (common in API types)
            '@typescript-eslint/no-empty-interface': 'off',
            // Allow unused vars if they start with underscore
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        },
    },

    // 5. Prettier Config (must be last to override others)
    eslintConfigPrettier,
])
