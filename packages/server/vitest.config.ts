import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

// Load .env file from server package
config({ path: './.env' });

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        env: {
            NODE_ENV: 'test',
        },
        setupFiles: ['./test/setup.ts'],
    },
    resolve: {
        alias: {
            '@app/server/test': resolve(__dirname, './test'),
            '@app/server/testing': resolve(__dirname, './test'),
            '@app/server': resolve(__dirname, './src'),
            '@app/shared': resolve(__dirname, '../shared/src'),
            'hono/bun': resolve(__dirname, './test/mocks/hono-bun.ts'),
        },
    },
});
