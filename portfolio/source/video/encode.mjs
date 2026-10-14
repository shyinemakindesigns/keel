import { spawn } from 'node:child_process'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const out = process.argv[2];
const port = 9800 + Math.floor(Math.random() * 90);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'enc-'));
const proc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pending = new Map();
for (let i = 0; i < 60 && !ws; i++) { try { const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r)); } } catch (e) { await sleep(150); } }
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true })).result.result.value;
try {
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:4320/' + (process.argv[3] || 'compose.html') });   // node encode.mjs out.mp4 [showcase.html]
  let st = '', last = '';
  for (;;) { await sleep(2000); st = await ev('window.__status || ""'); if (st !== last) { console.log(st); last = st; } if (st.startsWith('done') || st.startsWith('encode-error')) break; }
  if (!st.startsWith('done')) throw new Error(st);
  const len = await ev('window.__mp4.length'); const parts = [];
  for (let s = 0; s < len; s += 2_000_000) parts.push(Buffer.from(await ev(`window.__mp4b64(${s}, 2000000)`), 'base64'));
  fs.writeFileSync(out, Buffer.concat(parts)); console.log('wrote', out, len);
} finally { ws.close(); proc.kill(); }
