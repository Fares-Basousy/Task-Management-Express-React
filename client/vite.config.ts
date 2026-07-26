/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const port = import.meta.env.VITE_PORT
const server = import.meta.env.VITE_SERVER
// https://vitejs.dev/config/
export default defineConfig({
 plugins: [react()],
    server: {
        port: port,
    	allowedHosts: true, //for ngrok testing
        proxy: {
            // Forwards /api calls to the Express backend during development.
            '/api': {
                target: server,
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
