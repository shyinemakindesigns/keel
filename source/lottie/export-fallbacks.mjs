// Saves each animation's settled frame as a static SVG, light and dark, to assets/fallbacks/.
// Needs the repo root served (python3 -m http.server 4317) and Chrome.
//   node source/lottie/export-fallbacks.mjs [base-url]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, sleep } from '../../tests/cdp.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = process.argv[2] || 'http://127.0.0.1:4317';
const b = await launch();
try {
  await b.go(BASE + '/source/lottie/export.html', 1500);
  for (let i = 0; i < 60 && !(await b.run('!!window.__done')); i++) await sleep(250);
  const svgs = await b.run('window.__svgs');
  for (const [name, svg] of Object.entries(svgs)) {
    let out = svg.replace(/ style=""/, '');
    if (!/^<svg[^>]*\sxmlns="/.test(out)) out = out.replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" ');
    fs.writeFileSync(path.join(ROOT, 'assets/fallbacks', name + '.svg'), out);
  }
  console.log(Object.keys(svgs).length + ' fallbacks written');
} finally { b.close(); }
