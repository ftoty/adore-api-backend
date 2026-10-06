import { defineConfig } from 'vite';
import { cpSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const painelRoot = resolve(projectRoot, 'Painel-admin.html');
const painelHtml = resolve(painelRoot, 'Painel.html');

export default defineConfig({
  root: painelRoot,
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  base: './',
  plugins: [{
    name: 'painel-html-entry',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url === '/') request.url = '/Painel.html';
        next();
      });
    },
    writeBundle() {
      cpSync(resolve(projectRoot, 'dist/Painel.html'), resolve(projectRoot, 'dist/index.html'));
      cpSync(resolve(painelRoot, 'js'), resolve(projectRoot, 'dist/js'), { recursive: true });
    },
  }],
  build: {
    outDir: resolve(projectRoot, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: painelHtml,
      },
    },
  },
});
