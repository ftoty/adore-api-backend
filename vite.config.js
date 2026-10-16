import { defineConfig } from 'vite';
import { cpSync, existsSync, readFileSync } from 'node:fs';
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
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url || '/', 'http://localhost').pathname;
        if (!/^\/js\/[a-zA-Z0-9_.-]+\.js$/.test(pathname)) {
          next();
          return;
        }

        const sourcePath = resolve(projectRoot, pathname.slice(1));
        if (!existsSync(sourcePath)) {
          next();
          return;
        }

        response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        response.end(readFileSync(sourcePath));
      });
    },
    writeBundle() {
      cpSync(resolve(projectRoot, 'dist/Painel.html'), resolve(projectRoot, 'dist/index.html'));
      cpSync(resolve(projectRoot, 'js'), resolve(projectRoot, 'dist/js'), { recursive: true });
      cpSync(resolve(painelRoot, 'js'), resolve(projectRoot, 'dist/js'), { recursive: true, force: true });
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
