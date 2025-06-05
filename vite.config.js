// filepath: d:\prova-copilot\mate\vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true, // Automatically open the browser when running dev
    port: 3000, // Use port 3000
  },
  build: {
    outDir: 'dist', // Output directory for production build
  },
  // Configuring the base public path
  base: './',
});
