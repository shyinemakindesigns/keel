// Minimal Chrome DevTools Protocol driver for Keel's test suite. No dependencies:
// launches headless Chrome, drives one page, collects console errors, exceptions
// and failed requests.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch() {
  const port = 9200 + Math.floor(Math.random() * 600);
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'keel-test-'));
  const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
  let ws = null;
  for (let i = 0; i < 80 && !ws; i++) {
    try {
      const page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page');
      if (page) { ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r)); }
    } catch (e) { await sleep(120); }
  }
  if (!ws) throw new Error('Chrome did not start');
  let id = 0;
  const pending = new Map();
  const log = { errors: [], failed: [] };
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      log.errors.push('exception: ' + ((d.exception && d.exception.description) || d.text).split('\n')[0].slice(0, 200));
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      log.errors.push('console: ' + m.params.args.map((a) => a.value || a.description || '').join(' ').slice(0, 200));
    }
    if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) {
      log.failed.push(m.params.response.status + ' ' + m.params.response.url);
    }
    if (m.method === 'Network.loadingFailed' && !m.params.canceled && m.params.errorText !== 'net::ERR_ABORTED') {
      log.failed.push('failed ' + m.params.errorText);
    }
  };
  // every call times out, so a page that stops answering fails the run instead of hanging it
  const send = (method, params = {}, ms = 30000) => new Promise((resolve, reject) => {
    const i = ++id;
    const t = setTimeout(() => { pending.delete(i); reject(new Error(`${method} got no answer in ${ms / 1000}s`)); }, ms);
    pending.set(i, (m) => { clearTimeout(t); resolve(m); });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  const api = {
    log, send,
    // Evaluates test code inside the test browser's page (Keel's own pages, served locally).
    async run(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.result && r.result.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300));
      return r.result.result && r.result.result.value;
    },
    async viewport(width, height, { mobile = width < 768, dpr = 1 } = {}) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dpr, mobile });
    },
    async media({ reduced = true, scheme = 'light' } = {}) {
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }, { name: 'prefers-color-scheme', value: scheme }] });
    },
    async go(url, settle = 1500) {
      await send('Page.navigate', { url }); await sleep(settle);
      try { await api.run('document.fonts ? document.fonts.ready.then(() => 1) : 1'); } catch (e) { /* page mid-navigation */ }
    },
    async key(key, times = 1, shift = false) {
      const code = { Tab: 9, Enter: 13, Escape: 27, ' ': 32 }[key] || 0;
      for (let i = 0; i < times; i++) {
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: code, text: key === 'Enter' ? '\r' : undefined, modifiers: shift ? 8 : 0 });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: code, modifiers: shift ? 8 : 0 });
        await sleep(40);
      }
    },
    async shot(file) {
      const r = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(file, Buffer.from(r.result.data, 'base64'));
    },
    clearLog() { log.errors.length = 0; log.failed.length = 0; },
    close() { try { ws.close(); } catch (e) { /* ignore */ } proc.kill(); },
  };
  return api;
}
