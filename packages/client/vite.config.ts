import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        // Please make sure that '@tanstack/router-plugin' is passed before '@vitejs/plugin-react'
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@app/client': path.resolve(__dirname, './src'),
            '@app/shared': path.resolve(__dirname, '../shared/src'),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000', // Your Hono server port
                changeOrigin: true,
                // Optional: If your Hono routes don't actually start with /api
                // rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
});
