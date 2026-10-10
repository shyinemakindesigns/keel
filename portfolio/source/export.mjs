// Exports the portfolio images with headless Chrome over the DevTools protocol.
//   node portfolio/source/export.mjs
// Writes:
//   portfolio/linkedin-carousel/keel-carousel-01.png ... -09.png   (1080 x 1350)
//   portfolio/linkedin-carousel/keel-carousel.pdf                  (LinkedIn document post)
//   portfolio/keel-thumbnail-1600x1200.png, portfolio/keel-og-1200x630.png
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = 9500 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'keel-export-'));
const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--hide-scrollbars', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map();
for (let i = 0; i < 60 && !ws; i++) {
  try {
    const page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page');
    if (page) { ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r); }
  } catch (e) { await sleep(150); }
}
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async expr => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.result.value;

async function load(file, width, height) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: pathToFileURL(path.join(HERE, file)).href });
  await sleep(1500);
  await evaluate('document.fonts.ready.then(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => i.onload = i.onerror = r))))');
  await sleep(300);
}
async function shot(selector, out) {
  const clip = await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height, scale: 1 }; })()`);
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip });
  fs.writeFileSync(out, Buffer.from(r.result.data, 'base64'));
  console.log(path.relative(process.cwd(), out), `${clip.width}x${clip.height}`);
}

try {
  await send('Page.enable'); await send('Runtime.enable');
  const dir = path.join(OUT, 'linkedin-carousel');
  fs.mkdirSync(dir, { recursive: true });
  await load('carousel.html', 1080, 1350);
  const n = await evaluate('document.querySelectorAll(".slide").length');
  for (let i = 1; i <= n; i++) await shot(`#s${i}`, path.join(dir, `keel-carousel-${String(i).padStart(2, '0')}.png`));
  await evaluate('document.documentElement.style.background = document.body.style.background = "none"');
  const pdf = await send('Page.printToPDF', { printBackground: true, paperWidth: 11.25, paperHeight: 14.0625, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, preferCSSPageSize: false });
  fs.writeFileSync(path.join(dir, 'keel-carousel.pdf'), Buffer.from(pdf.result.data, 'base64'));
  console.log('linkedin-carousel/keel-carousel.pdf');
  if (fs.existsSync(path.join(HERE, 'thumbnail.html'))) {
    await load('thumbnail.html', 1600, 1200);
    await shot('#thumb', path.join(OUT, 'keel-thumbnail-1600x1200.png'));
    await shot('#og', path.join(OUT, 'keel-og-1200x630.png'));
  }
} finally {
  ws && ws.close(); proc.kill();
}
