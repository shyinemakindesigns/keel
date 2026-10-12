// Keel test suite. Run against a served build:
//   npm run build && python3 -m http.server 4319 --directory dist
//   npm test                       all suites
//   node tests/run.mjs journeys    one or more of: pages links clicks keyboard journeys media
// Results: tests/results/<suite>.json, and a summary printed at the end.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { launch, sleep } from './cdp.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const BASE = process.env.BASE || 'http://127.0.0.1:4319';
const OUT = path.join(HERE, 'results');
fs.mkdirSync(OUT, { recursive: true });
const AUDIT = fs.readFileSync(path.join(HERE, 'audit-page.js'), 'utf8');
const WIDTHS = (process.env.WIDTHS || '320,390,768,1280').split(',').map(Number);

const SCROLL = `(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y < H; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 35)); } scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400)); return H; })()`;
const visitor = (v) => `localStorage.setItem('keel-visitor', ${JSON.stringify(JSON.stringify(v))})`;

// Page states: [label, url, setup js (run after a first load, then reload), after js]
const STATES = [
  ['case study', '/', null, null, true],
  ['design system', '/design-system/', null, null, true],
  ['animation library', '/system.html', null, null, true],
  ['prototype · welcome', '/prototype/', 'localStorage.removeItem("keel-visitor")', null],
  ['prototype · overview', '/prototype/', 'localStorage.removeItem("keel-visitor")', `[...document.querySelectorAll('button')].find(b => b.textContent.includes('Take a guided tour')).click()`],
  ['prototype · setup', '/prototype/?screen=welcome', visitor({ state: 'completed' }), null],
  ['prototype · steady', '/prototype/?screen=home', visitor({ state: 'completed' }), null],
  ['prototype · spending', '/prototype/?screen=spending', visitor({ state: 'completed' }), null],
  ['prototype · goals', '/prototype/?screen=goals', visitor({ state: 'completed' }), null],
  ['prototype · plan', '/prototype/?screen=plan', visitor({ state: 'completed' }), null],
  ['prototype · tour step 2', '/prototype/', visitor({ state: 'touring', step: 1 }), null],
  ['prototype · tour step 5', '/prototype/', visitor({ state: 'touring', step: 4 }), null],
  ['prototype · tour finish', '/prototype/', visitor({ state: 'touring', step: 7 }), null],
  ['prototype · guide sheet', '/prototype/?screen=home', visitor({ state: 'completed' }), `document.querySelector('[data-screen=home] .guide-btn').click()`],
];

async function load(b, url, setup, theme) {
  await b.go(BASE + url, 700);
  await b.run(`localStorage.removeItem('keel-demo-v2'); localStorage.setItem('keel-theme', '${theme}');` + (setup ? setup : ''));
  b.clearLog();
  await b.go(BASE + url, 1600);
}

// ------------------------------------------------------------------ pages
async function pages() {
  const b = await launch(); const res = [];
  try {
    for (const theme of ['light', 'dark']) {
      await b.media({ reduced: true, scheme: theme });
      for (const w of WIDTHS) {
        await b.viewport(w, w < 768 ? 800 : 900);
        for (const [label, url, setup, after, long] of STATES) {
          if (process.env.VERBOSE) console.log(`  pages: ${label} · ${theme} · ${w}px`);
          await load(b, url, setup, theme);
          if (after) { await b.run(after); await sleep(700); }
          if (long) await b.run(SCROLL);
          const a = await b.run(AUDIT);
          res.push({ label, theme, width: w, ...a, errors: [...b.log.errors], failed: [...b.log.failed] });
        }
      }
    }
  } finally { b.close(); }
  return res;
}

// ------------------------------------------------------------------ links
async function links() {
  const b = await launch(); const urls = new Map();
  try {
    await b.viewport(1280, 900); await b.media({ reduced: true });
    const COLLECT = `(() => {
      const u = new Set();
      document.querySelectorAll('a[href], link[href]:not([rel=preconnect]):not([rel=dns-prefetch]), script[src], img[src], iframe[src], source[src], video[src]').forEach((e) => u.add((e.href || e.src)));
      document.querySelectorAll('keel-lottie[name]').forEach((e) => { const n = e.getAttribute('name'); ['', '-dark'].forEach((s) => { u.add(location.origin + '/assets/lottie/' + n + s + '.json'); u.add(location.origin + '/assets/fallbacks/' + n + s + '.svg'); }); });
      return [...u];
    })()`;
    for (const [label, url, setup, after, long] of STATES) {
      await load(b, url, setup, 'light');
      if (after) { await b.run(after); await sleep(500); }
      if (long) await b.run(SCROLL);
      for (const u of await b.run(COLLECT)) { if (!urls.has(u.split('#')[0])) urls.set(u.split('#')[0], label); }
    }
  } finally { b.close(); }
  const out = [];
  for (const [u, from] of urls) {
    if (u.startsWith('mailto:') || u.startsWith('javascript:')) continue;
    const internal = u.startsWith(BASE);
    let status;
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), internal ? 8000 : 12000);
      const r = await fetch(u, { method: 'GET', redirect: 'follow', signal: ctrl.signal, headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36' } });
      clearTimeout(t); status = r.status;
    } catch (e) { status = 'error ' + (e.name === 'AbortError' ? 'timeout' : e.message); }
    out.push({ url: u, internal, status, from });
  }
  return out;
}

// ------------------------------------------------------------------ clicks: press every control, watch for errors
async function clicks() {
  const b = await launch(); const res = [];
  try {
    await b.viewport(1280, 900); await b.media({ reduced: true });
    const targets = [['case study', '/', null], ['design system', '/design-system/', null], ['animation library', '/system.html', null],
      ...['home', 'spending', 'goals', 'plan'].map((s) => ['prototype · ' + s, '/prototype/?screen=' + s, visitor({ state: 'completed' })])];
    for (const [label, url, setup] of targets) {
      await load(b, url, setup, 'light');
      const n = await b.run(`(() => { const all = [...document.querySelectorAll('button, [role=switch], summary, input[type=range]')]; all.forEach((e, i) => e.setAttribute('data-test-i', i)); return all.length; })()`);
      let pressed = 0;
      for (let i = 0; i < n; i++) {
        const did = await b.run(`(() => {
          const e = document.querySelector('[data-test-i="${i}"]');
          if (!e || e.disabled || e.closest('[inert]') || !e.getClientRects().length) return false;
          let p = e; while (p) { const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden') return false; p = p.parentElement; }
          if (/reset/i.test(e.textContent) && !/sheet|guide/i.test(e.className)) return false;   // keep sample data for the remaining presses
          e.scrollIntoView({ block: 'center' });
          if (e.type === 'range') { e.value = e.max / 2; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }
          else e.click();
          return true;
        })()`);
        if (did) { pressed++; await sleep(120); }
        // close whatever opened: sheets, dialogs, the tour
        await b.run(`(() => { const s = document.getElementById('sheet'); if (s && s.classList.contains('on')) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); } const d = document.querySelector('dialog[open]'); if (d) d.close(); })()`);
        await sleep(40);
      }
      res.push({ label, controls: n, pressed, errors: [...b.log.errors], failed: [...b.log.failed] });
    }
  } finally { b.close(); }
  return res;
}

// ------------------------------------------------------------------ keyboard: Tab through each page
async function keyboard() {
  const b = await launch(); const res = [];
  try {
    for (const w of [390, 1280]) {
      await b.viewport(w, w < 768 ? 800 : 900); await b.media({ reduced: true });
      for (const [label, url, setup, max] of [['case study', '/', null, 220], ['design system', '/design-system/', null, 160], ['animation library', '/system.html', null, 120],
        ['prototype · welcome', '/prototype/', 'localStorage.removeItem("keel-visitor")', 20], ['prototype · steady', '/prototype/?screen=home', visitor({ state: 'completed' }), 40],
        ['prototype · tour', '/prototype/', visitor({ state: 'touring', step: 1 }), 30]]) {
        await load(b, url, setup, 'light');
        const stops = []; const bad = []; let stuck = 0, prev = null;
        for (let i = 0; i < max; i++) {
          await b.key('Tab');
          // a lazy iframe can take focus before its app mounts when tabbing at machine speed; give it a moment
          const probe = () => b.run(`(() => {
            let e = document.activeElement; if (!e || e === document.body) return { body: true };
            let frame = null;   // a same-origin iframe hands focus to its own document
            if (e.tagName === 'IFRAME') { try { const d = e.contentDocument; if (d && d.activeElement && d.activeElement !== d.body) { frame = e; e = d.activeElement; } else if (d) return { frameLoading: !d.querySelector('.screen'), frameIdle: true }; } catch (x) { /* cross-origin */ } }
            const view = frame ? frame.contentWindow : window;
            const r0 = e.getBoundingClientRect(), fr = frame ? frame.getBoundingClientRect() : { left: 0, top: 0 };
            const r = { width: r0.width, height: r0.height, top: r0.top + fr.top, bottom: r0.bottom + fr.top, left: r0.left + fr.left, right: r0.right + fr.left };
            const outl = (x) => { const c = view.getComputedStyle(x); return c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 1; };
            const cs = view.getComputedStyle(e);
            let ring = outl(e) || (cs.boxShadow && cs.boxShadow !== 'none');
            // the ring may sit on a wrapping field (:focus-within) or on an inner part (a switch track)
            for (let p = e.parentElement, i = 0; !ring && p && i < 3; p = p.parentElement, i++) ring = outl(p);
            if (!ring) ring = [...e.querySelectorAll('*')].slice(0, 20).some(outl);
            if (!ring && e.nextElementSibling) ring = outl(e.nextElementSibling);   // visually hidden radio + styled span
            const inner = false;
            const inView = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
            return { id: (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + ' ' + (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30)), w: r.width, h: r.height, ring: ring || inner, inView };
          })()`);
          let f = await probe();
          for (let k = 0; f.frameLoading && k < 10; k++) { await sleep(300); f = await probe(); }
          if (f.frameLoading) { bad.push('focus sits on an iframe whose page never loaded'); continue; }
          if (f.frameIdle) continue;   // loaded now; the next Tab moves into the frame
          if (f.body) continue;
          stops.push(f.id);
          if (f.id === prev) stuck++; prev = f.id;
          if (!f.w || !f.h) bad.push('zero-size: ' + f.id);
          else if (!f.inView) bad.push('off-screen: ' + f.id);
          else if (!f.ring) bad.push('no visible focus: ' + f.id);
        }
        res.push({ label, width: w, stops: stops.length, unique: new Set(stops).size, stuck, problems: [...new Set(bad)], errors: [...b.log.errors] });
      }
    }
  } finally { b.close(); }
  return res;
}

// ------------------------------------------------------------------ journeys with expected results
async function journeys() {
  const b = await launch(); const res = [];
  const check = async (name, expr, expect) => {
    let got; try { got = await b.run(expr); } catch (e) { got = 'ERROR ' + e.message; }
    const ok = typeof expect === 'function' ? expect(got) : String(got).includes(expect);
    res.push({ name, ok, got: typeof got === 'string' ? got.slice(0, 160) : got });
  };
  const click = (sel, text) => b.run(text
    ? `(() => { const e = [...document.querySelectorAll(${JSON.stringify(sel)})].find((x) => x.textContent.includes(${JSON.stringify(text)})); e.click(); return !!e; })()`
    : `(() => { const e = document.querySelector(${JSON.stringify(sel)}); e.click(); return !!e; })()`);
  const type = (sel, v) => b.run(`(() => { const i = document.querySelector(${JSON.stringify(sel)}); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, ${JSON.stringify(v)}); i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  try {
    await b.viewport(390, 844); await b.media({ reduced: true });
    // first visit and the guided tour
    await load(b, '/prototype/', 'localStorage.clear()', 'light');
    await check('first visit shows the welcome', `document.querySelector('.screen.in')?.dataset.screen`, 'intro');
    await click('button', 'Take a guided tour'); await sleep(500);
    await check('overview lists the four tabs', `[...document.querySelectorAll('.ov-item .ov-name')].map(e => e.textContent).join(',')`, (g) => /Steady.*Spending.*Goals.*Plan/.test(g));
    await check('overview previews load', `Promise.all([...document.querySelectorAll('.ov-shot img')].map(i => i.decode().then(() => i.naturalWidth).catch(() => 0))).then(a => a.every(x => x > 0))`, (g) => g === true);
    await click('button', 'Start the guided tour'); await sleep(800);
    await check('tour step 1 on Steady', `document.getElementById('tp-title').textContent + '|' + document.querySelector('.screen.in').dataset.screen`, 'Step 1 of 8: Start with what is steady.|home');
    await check('focus on step heading', `document.activeElement.id`, 'tp-title');
    await click('.tp-next'); await sleep(500);
    await click('.tp-seg input'); await sleep(300);
    await check('keel demo: less room shows example + now', `[...document.querySelectorAll('#keelviz text')].map(t => t.textContent).join('|')`, 'Now|Example');
    await click('.tp-next'); await sleep(700);
    await click('#cats [data-cat="Eating out"]'); await sleep(300);
    await check('category filter reported', `document.querySelector('.tp-status').textContent`, 'Showing Eating out: 3 sample transactions');
    await click('.tp-next'); await sleep(700);
    await click('.tp-action'); await sleep(500);
    await check('transaction detail in days', `document.querySelector('[data-tour="tx-weight"]').textContent`, '$16.80 is about a third of a day');
    await check('tour inert under the sheet', `document.getElementById('tour-layer').inert`, (g) => g === true);
    await b.key('Escape'); await sleep(500);
    await check('sheet closed, focus restored', `document.activeElement.textContent`, 'Open Hana Sushi');
    await click('.tp-next'); await sleep(700);
    await click('.tp-action'); await sleep(400); await click('[data-add="100"]'); await sleep(150); await click('[data-confirm-add]'); await sleep(700);
    await check('goal contribution reported', `document.querySelector('.tp-status').textContent`, 'Added $100');
    await click('.tp-next'); await sleep(700);
    await b.run(`document.querySelectorAll('.daily-opts input')[2].click()`); await sleep(300);
    await check('daily scenario: $10 less', `document.querySelector('.daily-diff').textContent`, '5 days more room');
    await click('.tp-next'); await sleep(500);
    for (const t of ['spending', 'goals', 'plan', 'home']) { await click(`#tabbar [data-tab="${t}"]`); await sleep(250); }
    await check('all tabs visited', `document.querySelector('.tp-visits').getAttribute('aria-label')`, '4 of 4');
    await click('.tp-next'); await sleep(500);
    await check('finish dialog focused', `document.getElementById('tf-h').textContent + '|' + document.activeElement.textContent`, 'You’re ready to explore.|Launch app');
    await click('.tf-actions button'); await sleep(500);
    await check('launch: Steady, focus on heading, completed', `document.querySelector('.screen.in').dataset.screen + '|' + document.activeElement.id + '|' + localStorage.getItem('keel-visitor')`, 'home|home-h|{"state":"completed"}');
    await b.go(BASE + '/prototype/', 1500);
    await check('returning visitor opens the app', `document.querySelector('.screen.in').dataset.screen + '|' + !!document.querySelector('.tour-panel')`, 'home|false');
    await click('[data-screen=home] .guide-btn'); await sleep(400);
    await click('.guide-item', 'Take the guided tour'); await sleep(900);
    await check('guide restarts the tour', `document.getElementById('tp-title').textContent`, 'Step 1 of 8');
    await click('.tp-skip'); await sleep(400);
    await check('skip ends the tour', `!!document.querySelector('.tour-panel') + '|' + localStorage.getItem('keel-visitor')`, 'false|{"state":"exploring"}');
    await load(b, '/prototype/', 'localStorage.clear()', 'light');
    await click('button', 'Explore on my own'); await sleep(400);
    await check('explore on my own', `document.querySelector('.screen.in').dataset.screen + '|' + localStorage.getItem('keel-visitor')`, 'home|{"state":"exploring"}');
    // the app's numbers
    await load(b, '/prototype/?screen=home', visitor({ state: 'completed' }), 'light');
    await check('reading', `document.getElementById('r-date').textContent`, 'Oct 25');
    await type('#wi-amt', '700'); await click('#whatif button[type=submit]'); await sleep(200);
    await check('purchase check $700', `document.getElementById('wi-result').textContent`, 'covered through Oct 14, 2 days before payday. Car insurance ($142) on Oct 15');
    await load(b, '/prototype/?screen=welcome', visitor({ state: 'completed' }), 'light');
    await click('button', 'Begin'); await sleep(200); await click('button', 'Use sample accounts'); await sleep(200);
    await click('[data-bill=gym]'); await click('button', 'Continue'); await sleep(200); await click('button', 'Take my first reading'); await sleep(1200);
    await check('setup with gym paused', `document.getElementById('r-date').textContent`, 'Oct 26');
    await load(b, '/prototype/?screen=spending', visitor({ state: 'completed' }), 'light');
    await click('[data-tx=t3]'); await sleep(300); await click('#sheet input[value=Groceries]'); await click('#sheet button[type=submit]'); await sleep(300); await click('#sheet button', 'Done'); await sleep(700);
    await check('recategorize moves $16.80', `document.querySelector('[data-cat="Eating out"] .val').textContent + '|' + document.querySelector('[data-cat="Groceries"] .val').textContent`, '$43.75|$155.70');
    await load(b, '/prototype/?screen=goals', visitor({ state: 'completed' }), 'light');
    await click('[data-goal-add=car]'); await sleep(300); await click('[data-confirm-add]'); await sleep(500);
    await check('add $50 to goal', `document.querySelector('.confirm.on span').textContent`, 'Added $50. Steady through Oct 24.');
    await load(b, '/prototype/?screen=plan', visitor({ state: 'completed' }), 'light');
    await type('#pl-extra', '100'); await sleep(300);
    // the horizon follows today's date, so check the shape: +$100 a paycheck adds a whole number of $100s
    await check('plan +$100 adds $100 per paycheck', `document.getElementById('pl-read').textContent`, (g) => {
      const m = /\$([\d,]+) set aside instead of \$([\d,]+)/.exec(g || ''); if (!m) return false;
      const gap = +m[1].replace(/,/g, '') - +m[2].replace(/,/g, ''); return gap > 0 && gap % 100 === 0 && /done around/.test(g);
    });
    // design system
    await b.viewport(1280, 900);
    await load(b, '/design-system/', null, 'light');
    await check('ds contrast table computed', `document.querySelectorAll('.ct-row[role=row]').length`, (g) => g >= 20);
    await click('.sh-sections a[href="#components"]'); await sleep(400);
    await check('ds nav marks section', `document.querySelector('.sh-sections [aria-current=location]').textContent`, 'Components');
    await click('#c-switch .switch'); await sleep(100);
    await check('ds switch toggles', `document.querySelector('#c-switch .switch').getAttribute('aria-checked')`, 'true');
    await click('#c-input form button[type=submit]'); await sleep(150);
    await check('ds input error', `document.getElementById('amt').getAttribute('aria-invalid') + '|' + document.getElementById('amt-err').textContent`, 'true|Enter an amount greater than zero.');
    await click('#c-row .row'); await sleep(400);
    await check('ds sheet opens', `document.querySelector('dialog.sheet').open`, (g) => g === true);
    await b.key('Escape'); await sleep(300);
    await check('ds sheet closes', `document.querySelector('dialog.sheet').open`, (g) => g === false);
    await click('.sh-util button'); await sleep(200);
    await check('ds theme toggle persists', `document.documentElement.dataset.theme + '|' + localStorage.getItem('keel-theme')`, 'dark|dark');
    // case study
    await load(b, '/', null, 'light');
    await b.run(`document.querySelector('.exp').scrollIntoView()`); await sleep(3500);
    await check('case study embeds the prototype', `(() => { const d = document.getElementById('proto-frame').contentDocument; return d.querySelector('.screen.in').dataset.screen + '|' + d.body.classList.contains('embedded'); })()`, 'welcome|true');
    await b.run(`[...document.querySelectorAll('.walk button')].find(b => b.textContent.includes('Spending')).click()`); await sleep(900);
    await check('case study walkthrough drives it', `document.getElementById('proto-frame').contentDocument.querySelector('.screen.in').dataset.screen`, 'spending');
    await b.run(`document.getElementById('rive-four').scrollIntoView()`); await sleep(3500);
    await check('rive demos run', `JSON.stringify(window.__keelRiveFour && window.__keelRiveFour())`, (g) => g && !g.includes('null'));
    // redirect
    // the old address is a Netlify rule (netlify.toml), so it only redirects on Netlify
    if (/netlify\.app/.test(BASE)) {
      await b.go(BASE + '/prototype.html?screen=plan', 2500);
      await check('old prototype link redirects', `location.pathname + location.search`, '/prototype/?screen=plan');
    } else {
      res.push({ name: 'old prototype link has a redirect rule', ok: /from = "\/prototype\.html"\s+to = "\/prototype\/"/.test(fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8')) });
    }
    res.push({ name: 'no script errors during journeys', ok: b.log.errors.length === 0, got: b.log.errors.slice(0, 5) });
  } finally { b.close(); }
  return res;
}

// ------------------------------------------------------------------ media
function media() {
  const out = [];
  const pf = path.join(ROOT, 'portfolio');
  const dims = (f) => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
  for (const [f, w, h] of [['keel-thumbnail-1600x1200.png', 1600, 1200], ['keel-og-1200x630.png', 1200, 630], ['video/keel-prototype-demo-cover.png', 1080, 1350],
    ...Array.from({ length: 9 }, (_, i) => [`linkedin-carousel/keel-carousel-0${i + 1}.png`, 1080, 1350])]) {
    const p = path.join(pf, f); const ok = fs.existsSync(p) && dims(p)[0] === w && dims(p)[1] === h;
    out.push({ name: f, ok, got: fs.existsSync(p) ? dims(p).join('x') : 'missing' });
  }
  const pdf = fs.readFileSync(path.join(pf, 'linkedin-carousel/keel-carousel.pdf'));
  out.push({ name: 'carousel PDF pages', ok: (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length === 9 });
  try {
    const tmp = path.join(OUT, 'video-check.mov');
    execFileSync('avconvert', ['-s', path.join(pf, 'video/keel-prototype-demo-1080x1350.mp4'), '-p', 'PresetPassthrough', '-o', tmp, '--replace'], { stdio: 'pipe' });
    out.push({ name: 'video decodes (AVFoundation)', ok: fs.statSync(tmp).size > 1e6 }); fs.rmSync(tmp);
  } catch (e) { out.push({ name: 'video decodes (AVFoundation)', ok: false, got: e.message.slice(0, 120) }); }
  return out;
}

// ------------------------------------------------------------------ summaries: list every problem
const FAILS = {
  pages: (r) => r.flatMap((p) => {
    const at = `${p.label} · ${p.theme} · ${p.width}px`;
    return [
      ...p.errors.map((e) => `${at}: ${e}`), ...p.failed.map((e) => `${at}: request ${e}`),
      ...(p.dupIds.length ? [`${at}: duplicate ids ${p.dupIds.join(', ')}`] : []),
      ...(p.overflow ? [`${at}: page scrolls sideways (${p.overflow}px wide)`] : []),
      ...p.contrast.map((c) => `${at}: contrast ${c}`), ...p.unnamed.map((c) => `${at}: no accessible name ${c}`),
      ...p.under24.map((c) => `${at}: target under 24px ${c}`), ...p.noAlt.map((c) => `${at}: image without alt ${c}`),
      ...p.headingSkips.map((c) => `${at}: heading skip ${c}`), ...(p.h1 !== 1 ? [`${at}: ${p.h1} h1 elements`] : []),
    ];
  }),
  links: (r) => r.filter((l) => l.internal && l.status !== 200).map((l) => `${l.status} ${l.url} (from ${l.from})`),
  clicks: (r) => r.flatMap((p) => [...p.errors, ...p.failed].map((e) => `${p.label}: ${e}`)),
  keyboard: (r) => r.flatMap((p) => [...p.problems, ...p.errors, ...(p.stuck > 2 ? [`focus stuck ${p.stuck} times`] : [])].map((e) => `${p.label} · ${p.width}px: ${e}`)),
  journeys: (r) => r.filter((j) => !j.ok).map((j) => `${j.name}: got ${JSON.stringify(j.got)}`),
  media: (r) => r.filter((j) => !j.ok).map((j) => `${j.name}: ${j.got || 'failed'}`),
};
const NOTES = {
  pages: (r) => `${r.length} page states, ${r.reduce((n, p) => n + p.textMeasured, 0)} text elements measured; ${r.reduce((n, p) => n + p.under44.length, 0)} targets between 24 and 44px (AA passes; AAA advisory)`,
  links: (r) => { const ext = r.filter((l) => !l.internal); const bad = ext.filter((l) => l.status !== 200); return `${r.length - ext.length} internal URLs, ${ext.length} external` + (bad.length ? `; external not 200 (warning): ${bad.map((l) => l.status + ' ' + l.url).join(', ')}` : ''); },
  clicks: (r) => `${r.reduce((n, p) => n + p.pressed, 0)} controls pressed across ${r.length} pages`,
  keyboard: (r) => `${r.reduce((n, p) => n + p.stops, 0)} tab stops across ${r.length} page runs`,
  journeys: (r) => `${r.filter((j) => j.ok).length} of ${r.length} checks pass`,
  media: (r) => `${r.filter((j) => j.ok).length} of ${r.length} files check out`,
};

const SUITES = { pages, links, clicks, keyboard, journeys, media };
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SUITES);
let total = 0;
for (const s of want) {
  const t0 = Date.now();
  let r, f;
  try {
    r = await SUITES[s]();
    fs.writeFileSync(path.join(OUT, s + '.json'), JSON.stringify(r, null, 1));
    f = [...new Set(FAILS[s](r))];
  } catch (e) { r = []; f = ['suite stopped: ' + e.message]; NOTES[s] = () => 'did not finish'; }
  total += f.length;
  console.log(`\n${f.length ? '✗' : '✓'} ${s} (${Math.round((Date.now() - t0) / 1000)}s): ${NOTES[s](r)}`);
  f.slice(0, 40).forEach((x) => console.log('   - ' + x));
  if (f.length > 40) console.log(`   … ${f.length - 40} more in tests/results/${s}.json`);
}
console.log(total ? `\n${total} problems found.` : '\nAll suites pass.');
process.exit(total ? 1 : 0);
