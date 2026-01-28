/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  server: {
    port: 3000, // Maintain default CRA port for consistency
    open: true, // Auto-open browser on start
  },
  build: {
    outDir: 'build', // Maintain CRA output directory structure
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true, // Parse CSS imports during tests
  },
});
