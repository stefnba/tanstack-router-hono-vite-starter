import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

import { CLIENT, SERVER } from '../shared/src/config/app.js';

// Only for LOCAL DEV - production uses same-origin
const CLIENT_PORT = Number(process.env.CLIENT_PORT) || CLIENT.DEFAULT_PORT;
const SERVER_PORT = Number(process.env.SERVER_PORT) || SERVER.DEFAULT_PORT;

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
        port: CLIENT_PORT,
        proxy: {
            '/api': {
                target: `http://localhost:${SERVER_PORT}`, // Your Hono server port
                changeOrigin: true,
                // Optional: If your Hono routes don't actually start with /api
                // rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
});
