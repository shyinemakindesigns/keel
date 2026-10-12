// WCAG 2.x contrast, computed from the colors actually rendered.
// Accepts #rgb, #rrggbb and rgb()/rgba(); translucent colors are composited
// over the background they sit on before measuring.

export function parse(c) {
  c = (c || '').trim();
  if (c.startsWith('#')) {
    let h = c.slice(1);
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
  }
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  return null;
}

function over(fg, bg) {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

function lum({ r, g, b }) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function ratio(fgColor, bgColor) {
  const bg = parse(bgColor), fg0 = parse(fgColor);
  if (!bg || !fg0) return null;
  const fg = fg0.a < 1 ? over(fg0, bg) : fg0;
  const a = lum(fg), b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export const NEEDS = { text: 4.5, large: 3, ui: 3 };
export const NEED_LABEL = { text: 'Normal text, 4.5:1', large: 'Large text, 3:1', ui: 'UI boundary or indicator, 3:1' };

/** Read a custom property's resolved value inside a given element (e.g. a forced-theme specimen). */
export function token(el, name) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}
