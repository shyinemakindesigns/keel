// Records the Steady screen for the animated Wix thumbnail: rest, check a $250 purchase
// (the keel previews the change, settling from 9 days to 4 with the old depth as an outline,
// and the result reads "steady through Oct 20"), rest, clear, settle back.
// The last frame matches the first, so the composed video loops without a jump.
// Output: rec-thumb/frames/*.jpg and rec-thumb/frames.json [{f, t}], rec-thumb/taps.json, rec-thumb/meta.json
// Needs the built site on http://127.0.0.1:4319 and Chrome.   node record-thumb.mjs
import fs from 'node:fs'; import path from 'node:path';
import { launch, sleep } from '../../../tests/cdp.mjs';

const OUT = path.resolve('rec-thumb');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, 'frames'), { recursive: true });
const b = await launch();
const frames = [], taps = []; let t0 = null, n = 0;
const now = () => (performance.now() - t0) / 1000;
const ws = b.send;   // CDP send
try {
  await b.viewport(390, 844, { dpr: 2, mobile: true });   // 780 px wide: the phone is 520 px in the thumbnail
  await b.media({ reduced: false, scheme: 'light' });
  const URL = 'http://127.0.0.1:4319/prototype/?screen=home';
  await b.go(URL, 600);
  await b.run(`localStorage.clear(); localStorage.setItem('keel-theme','light'); localStorage.setItem('keel-motion','full'); localStorage.setItem('keel-visitor','{"state":"completed"}')`);
  await b.go(URL, 2500);
  await b.run('document.fonts.ready.then(() => 1)');
  for (let i = 0; i < 50 && !(await b.run("!!document.querySelector('#wi-amt') && document.querySelector('.screen.in')?.dataset.screen === 'home'")); i++) await sleep(200);
  console.log('ready:', await b.run("document.querySelector('.screen.in')?.dataset.screen + ' ' + !!document.querySelector('#wi-amt')"));
  const center = (sel) => b.run(`(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return { missing: ${JSON.stringify(sel)}, screen: document.querySelector('.screen.in')?.dataset.screen, ids: [...document.querySelectorAll('#whatif [id], #whatif button')].map((x) => x.id || x.textContent.trim()).join(',') }; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  const tap = async (sel) => { const c = await center(sel); if (c.missing) { console.log('MISSING', JSON.stringify(c)); return; } taps.push({ t: +now().toFixed(3), x: c.x, y: c.y }); await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c.x, y: c.y }); await b.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }); await sleep(80); await b.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }); };
  // frames stream from Chrome as they are painted
  let pre = null;   // the stream's first frames arrive before t0: keep the latest as frame zero
  b.on('Page.screencastFrame', ({ data, sessionId }) => {
    b.send('Page.screencastFrameAck', { sessionId });
    if (t0 === null) { pre = data; return; }
    const f = `f${String(++n).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(OUT, 'frames', f), Buffer.from(data, 'base64')); frames.push({ f, t: +now().toFixed(4) });
  });
  await b.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 780, maxHeight: 1688, everyNthFrame: 1 });
  await sleep(400);
  t0 = performance.now();
  // frames only arrive on change, so the resting state is the stream's own first frame (same renderer as the rest)
  if (!pre) throw new Error('no screencast frame before the start');
  fs.writeFileSync(path.join(OUT, 'frames', 'f00000.jpg'), Buffer.from(pre, 'base64')); frames.unshift({ f: 'f00000.jpg', t: 0 });
  await sleep(1300);                                   // rest
  await tap('#wi-amt'); await sleep(250);
  for (const ch of '250') { await b.send('Input.insertText', { text: ch }); await sleep(140); }
  await sleep(250); await tap('#whatif button[type=submit]');
  await sleep(3000);                                   // the keel settles, then rests at 4 days
  await tap('#wi-clear'); await sleep(60);
  await b.run('document.activeElement && document.activeElement.blur()');   // no focus ring: the end matches the start
  await b.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 });   // and no hover left on a button
  await sleep(2600);                                   // settles back, rests
  await b.send('Page.stopScreencast');
  fs.writeFileSync(path.join(OUT, 'frames.json'), JSON.stringify(frames));
  fs.writeFileSync(path.join(OUT, 'taps.json'), JSON.stringify(taps));
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ duration: +now().toFixed(3) }));
  console.log('frames', frames.length, 'duration', now().toFixed(2), 'fps', (frames.length / now()).toFixed(1));
} finally { b.close(); }
