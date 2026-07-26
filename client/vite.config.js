/// <reference types="vitest/config" />

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],

    server: {
      port: Number(env.VITE_PORT),
    allowedHosts: true, //for ngrok testing
      proxy: {
        "/api": {
          target: env.VITE_SERVER,
          changeOrigin: true,
        },
      },
    },

    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./tests/setup.ts"],
      css: true,
    },
  };
});