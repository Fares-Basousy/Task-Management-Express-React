/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
const port = import.meta.env.VITE_PORT
const server = import.meta.env.VITE_SERVER
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        allowedHosts: true,
        proxy: {
            // Forwards /api calls to the Express backend during development.
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            }
        },
    },
    
                test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        css: true,
    },
});
