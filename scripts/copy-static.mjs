// Copies the pages that haven't been ported to React yet (and the files they use)
// into dist, so one Netlify deploy serves the whole site. Shrinks with each phase.
import { cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const items = ['index.html', 'system.html', 'favicon.ico', 'assets', 'docs', 'portfolio'];
for (const item of items) {
  const from = path.join(root, item);
  if (!existsSync(from)) continue;
  cpSync(from, path.join(dist, item), {
    recursive: true,
    filter: (src) => !src.includes(`${path.sep}portfolio${path.sep}source`),
  });
  console.log('copied', item);
}
