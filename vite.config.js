import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Keel is moving to React in phases (see docs/react-migration.md).
// Each page is its own entry; pages not yet ported are copied into dist as they are
// by scripts/copy-static.mjs. Vite's own bundles go to /_app so they never collide
// with the existing /assets folder.
const page = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: '_app',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'design-system': page('./design-system/index.html'),
        prototype: page('./prototype/index.html'),
      },
    },
  },
  server: { port: 5173 },
});
