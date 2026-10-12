// Records a scripted walk through the Keel prototype with CDP screencast.
// Output: rec/frames/*.jpg, rec/frames.json [{f, t}], rec/taps.json [{t, x, y}], rec/scenes.json [{id, t}]
import { spawn } from 'node:child_process';
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';

const OUT = path.resolve('rec');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });
const URL = 'http://127.0.0.1:4319/prototype.html';
const port = 9600 + Math.floor(Math.random() * 90);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'rec-'));
const proc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--hide-scrollbars', '--force-device-scale-factor=2', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0; const pending = new Map(); const handlers = [];
for (let i = 0; i < 60 && !ws; i++) { try { const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r)); } } catch (e) { await sleep(150); } }
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } if (m.method) handlers.forEach((h) => h(m)); };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (e) => { const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) console.log('JS ERR', JSON.stringify(r.result.exceptionDetails).slice(0, 300)); return r.result.result && r.result.result.value; };

const frames = [], taps = [], scenes = [];
let t0 = null, n = 0;
const now = () => (performance.now() - t0) / 1000;
handlers.push(async (m) => {
  if (m.method !== 'Page.screencastFrame') return;
  const { data, sessionId, metadata } = m.params;
  send('Page.screencastFrameAck', { sessionId });
  if (t0 === null) return;
  const f = `f${String(++n).padStart(5, '0')}.jpg`;
  fs.writeFileSync(path.join(OUT, 'frames', f), Buffer.from(data, 'base64'));
  frames.push({ f, t: +now().toFixed(4) });
});
const mark = (sid) => { scenes.push({ id: sid, t: +now().toFixed(3) }); console.log('scene', sid, now().toFixed(2)); };

async function center(sel) {
  return ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)}); if(!e) return null; e.scrollIntoView({block:'nearest'}); const r=e.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2}})()`);
}
async function tap(sel, hold = 90) {
  const c = await center(sel);
  if (!c) { console.log('missing', sel); return; }
  taps.push({ t: +now().toFixed(3), x: c.x, y: c.y });
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c.x, y: c.y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 });
  await sleep(hold);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 });
}
async function type(text, gap = 140) {
  for (const ch of text) { await send('Input.insertText', { text: ch }); await sleep(gap); }
}
async function scrollScreen(px, ms = 700) {
  await ev(`(()=>{const s=document.querySelector('.screen.on, .screen[aria-hidden="false"], .screen:not([hidden])'); const all=[...document.querySelectorAll('.screen')].filter(x=>getComputedStyle(x).display!=='none' && x.getBoundingClientRect().width>0); const el=all.find(x=>x.scrollHeight>x.clientHeight)||document.scrollingElement; el.scrollBy({top:${px},behavior:'smooth'}); return el.className})()`);
  await sleep(ms);
}

try {
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }, { name: 'prefers-color-scheme', value: 'light' }] });
  await send('Page.navigate', { url: URL }); await sleep(1200);
  await ev(`localStorage.clear(); localStorage.setItem('keel-theme','light'); localStorage.setItem('keel-motion','full')`);
  await send('Page.navigate', { url: URL }); await sleep(2500);
  await ev('document.fonts.ready.then(()=>1)');
  await send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 780, maxHeight: 1688, everyNthFrame: 1 });
  await sleep(300);
  t0 = performance.now();
  // ---- scene: hook, welcome screen
  mark('hook'); await sleep(2600);
  // ---- scene: onboarding
  mark('onboard');
  await tap('[data-screen="welcome"] [data-go="accounts"]'); await sleep(1500);
  await tap('[data-screen="accounts"] [data-go="bills"]'); await sleep(1500);
  await tap('[data-screen="bills"] [data-go="payday"]'); await sleep(1500);
  await tap('[data-screen="payday"] [data-go="taking"]'); await sleep(3600);
  // ---- scene: the reading
  mark('reading'); await sleep(3200);
  // ---- scene: purchase check
  mark('check');
  await tap('#wi-amt'); await sleep(300); await type('250'); await sleep(250);
  await tap('#whatif button[type="submit"]'); await sleep(3300);
  // ---- scene: spending
  mark('spending');
  await tap('#tabbar [data-tab="spending"]'); await sleep(2000);
  await ev(`document.querySelector('[data-tx="t3"]').scrollIntoView({behavior:'smooth', block:'center'})`); await sleep(1100);
  await tap('[data-tx="t3"]'); await sleep(3000);
  await tap('#sheet [data-close]'); await sleep(700);
  // ---- scene: goals
  mark('goals');
  await tap('#tabbar [data-tab="goals"]'); await sleep(1500);
  await tap('[data-goal-add="car"]'); await sleep(1100);
  await tap('[data-add="100"]'); await sleep(900);
  await tap('[data-confirm-add]'); await sleep(3000);
  // ---- scene: plan
  mark('plan');
  await tap('#tabbar [data-tab="plan"]'); await sleep(1500);
  const sl = await center('#pl-extra');
  const r = await ev(`(()=>{const e=document.getElementById('pl-extra').getBoundingClientRect(); return {l:e.left+10, w:e.width-20, y:e.top+e.height/2}})()`);
  for (let v = 25; v <= 100; v += 25) {
    taps.push({ t: +now().toFixed(3), x: r.l + (v / 300) * r.w, y: r.y, drag: true });
    await ev(`(()=>{const e=document.getElementById('pl-extra'); e.value=${v}; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true}))})()`);
    await sleep(260);
  }
  void sl;
  await sleep(3400);
  mark('end');
  await sleep(400);
  await send('Page.stopScreencast');
  fs.writeFileSync(path.join(OUT, 'frames.json'), JSON.stringify(frames));
  fs.writeFileSync(path.join(OUT, 'taps.json'), JSON.stringify(taps));
  fs.writeFileSync(path.join(OUT, 'scenes.json'), JSON.stringify(scenes));
  console.log('frames', frames.length, 'duration', now().toFixed(2));
} finally { ws.close(); proc.kill(); }
