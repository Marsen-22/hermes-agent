import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/index.html')
    }
  },
  resolve: {
    alias: {
      '@hermes/shared': path.resolve(__dirname, '../shared/src/index.ts'),
      '@hermes/shared/': path.resolve(__dirname, '../shared/src/') + '/',
      '@apps/desktop/electron': path.resolve(__dirname, '../desktop/electron/'),
      '@apps/desktop/electron/': path.resolve(__dirname, '../desktop/electron/') + '/'
    }
  },
  server: {
    port: 5175,
    host: '127.0.0.1'
  }
});
