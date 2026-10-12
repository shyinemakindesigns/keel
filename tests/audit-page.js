// Runs inside a page. Returns structural, accessibility and layout findings for the
// current state. Plain ES2019, no dependencies; evaluated through tests/cdp.mjs.
(() => {
  const out = { dupIds: [], overflow: null, contrast: [], textMeasured: 0, unnamed: [], under24: [], under44: [], noAlt: [], headingSkips: [], h1: 0 };
  const visible = (el) => {
    if (!el.getClientRects().length) return false;
    for (let p = el; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
      if (p.inert || p.hidden) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const srOnly = (el) => { for (let p = el; p; p = p.parentElement) { const r = p.getBoundingClientRect(); if (r.width <= 1 && r.height <= 1 && getComputedStyle(p).overflow === 'hidden') return true; } return false; };
  const label = (el) => {
    let s = el.getAttribute('aria-label') || '';
    const lb = el.getAttribute('aria-labelledby');
    if (lb) s += lb.split(/\s+/).map((i) => (document.getElementById(i) || {}).textContent || '').join(' ');
    s += el.textContent || '';
    s += el.getAttribute('title') || '';
    el.querySelectorAll('img[alt]').forEach((i) => { s += i.alt; });
    if (el.id) document.querySelectorAll(`label[for="${CSS.escape(el.id)}"]`).forEach((l) => { s += l.textContent; });
    const wrap = el.closest('label'); if (wrap) s += wrap.textContent;
    if (el.tagName === 'INPUT' && el.type === 'submit') s += el.value;
    return s.trim();
  };
  const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '') + ' "' + (label(el) || '').slice(0, 24) + '"';

  // duplicate ids
  const ids = {};
  document.querySelectorAll('[id]').forEach((el) => { ids[el.id] = (ids[el.id] || 0) + 1; });
  out.dupIds = Object.keys(ids).filter((k) => ids[k] > 1);

  // horizontal overflow
  if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) out.overflow = document.documentElement.scrollWidth;

  // contrast of every visible text node's element
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = (el) => { const st = []; for (let p = el; p; p = p.parentElement) { const c = parse(getComputedStyle(p).backgroundColor); if (c && c.a > 0) { st.push(c); if (c.a === 1) break; } } let b = { r: 255, g: 255, b: 255, a: 1 }; for (let i = st.length - 1; i >= 0; i--) b = over(st[i], b); return b; };
  const seen = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const t = w.currentNode; if (!t.textContent.trim()) continue;
    const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    if (el.closest('svg, noscript, script, style') || !visible(el) || srOnly(el)) continue;
    if (el.closest('button:disabled, [disabled], .is-disabled, [aria-hidden="true"]')) continue;   // disabled and hidden specimens are exempt
    if (el.closest('.wf, .lohi-stage .wf')) continue;   // lo-fi wireframe specimens are deliberately grey
    const cs = getComputedStyle(el);
    const fg0 = parse(cs.color); if (!fg0) continue;
    const bg = bgOf(el), fg = fg0.a < 1 ? over(fg0, bg) : fg0;
    const a = lum(fg), b = lum(bg), ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    out.textMeasured++;
    if (ratio < need) out.contrast.push(`${ratio.toFixed(2)} < ${need} "${el.textContent.trim().slice(0, 30)}" (${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]})`);
  }

  // controls: names and target size
  const ctrls = document.querySelectorAll('a[href], button, input, select, textarea, [role="switch"], [role="tab"], summary');
  ctrls.forEach((el) => {
    if (!visible(el)) return;
    if (el.closest('[aria-hidden="true"]')) return;
    const isRadio = el.type === 'radio' || el.type === 'checkbox';
    if (!isRadio && !label(el)) out.unnamed.push(name(el));
    if (isRadio) return;   // the visible label is the target
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    const inline = el.tagName === 'A' && cs.display === 'inline' && el.closest('p, li, td, th, dd, figcaption, cite, span, small');
    if (inline) return;   // inline links in text are exempt (2.5.8)
    if (r.width < 24 || r.height < 24) out.under24.push(name(el) + ` ${Math.round(r.width)}x${Math.round(r.height)}`);
    else if (r.width < 43.5 || r.height < 43.5) out.under44.push(name(el) + ` ${Math.round(r.width)}x${Math.round(r.height)}`);
  });

  // images
  document.querySelectorAll('img').forEach((i) => { if (!i.hasAttribute('alt') && visible(i)) out.noAlt.push(i.src.split('/').pop()); });

  // headings
  let last = 0;
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    // count headings that are rendered: a 1px screen-reader heading counts, and so does the page
    // heading behind an open modal (inert, but still the page's h1)
    const rendered = () => { for (let p = h; p; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.display === 'none' || cs.visibility === 'hidden' || p.hidden) return false; } return true; };
    if (!rendered()) return;
    const lv = +h.tagName[1];
    if (lv === 1) out.h1++;
    if (last && lv > last + 1) out.headingSkips.push(`h${last} -> h${lv} "${h.textContent.trim().slice(0, 30)}"`);
    last = lv;
  });
  return out;
})()
