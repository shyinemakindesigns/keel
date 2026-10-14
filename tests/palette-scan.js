// Runs inside a page. Finds any rendered color from Keel's earlier palettes (Mineral & Ember
// and v1), in any element or pseudo-element, including SVG fills and strokes and translucent
// versions (matched by RGB, ignoring alpha). Returns [{color, where, prop}].
(() => {
  const OLD = {
    'F6F3ED': 'porcelain', 'E6E2D9': 'mineral stone', 'DCD7CC': 'mineral deep', '252A28': 'volcanic ink', '656B66': 'weathered slate',
    '555B56': 'slate deep', 'B94F36': 'oxidized ember', '9E412B': 'ember text', 'A4452F': 'ember hover', '8F3C29': 'ember pressed',
    '202725': 'basalt', '2A322F': 'basalt raised', '353E3A': 'basalt deep', 'F4F0E7': 'chalk', 'B3B6AE': 'chalk muted',
    'E07F60': 'ember lifted', 'E38A6C': 'ember lifted text', 'E68D70': 'ember lifted hover', 'D9714F': 'ember lifted pressed',
    '2E6A4E': 'old positive', '9B2C3A': 'old negative', '7D5300': 'old warning', '3B5A72': 'old info',
    '7FC4A0': 'old positive dark', 'F09AA3': 'old negative dark', 'E2B45C': 'old warning dark', '9DBCD6': 'old info dark',
    '4A504C': 'old data 2', '7A7F79': 'old data 3', 'A6A9A2': 'old data 4', 'C9C8BF': 'old data 5', 'DFDBD2': 'old data muted',
    '9A9E97': 'old dark data', '6E746E': 'old dark data', '4D5550': 'old dark data', '2F3734': 'old dark data',
    'C9664D': 'old ember top', 'EA9A80': 'old ember top dark', 'B9634A': 'old ember side', 'F1EDE5': 'old porcelain',
    'DDD8CD': 'old porcelain side', 'EEEAE2': 'old mineral top', 'C6C0B3': 'old mineral side', '4A5450': 'old basalt top', '343C39': 'old basalt',
    '8C928D': 'old slate top', '4C524E': 'old slate side', 'C3C6BF': 'old slate dark', '9EA39B': 'old slate dark', '7D827B': 'old slate dark',
    '56605B': 'old mineral dark', '454F4B': 'old mineral dark', '36403C': 'old mineral dark', 'D9D4C8': 'old porcelain dark', 'B8B3A8': 'old porcelain dark',
    '2C3532': 'old basalt dark', '1A201E': 'old basalt dark', '121715': 'old basalt dark', '3A4440': 'old device frame',
    '241A13': 'v1 ink', 'E2603D': 'v1 accent', 'DED3C3': 'v1 water', 'F6F1EA': 'v1 canvas', 'EAE1D4': 'v1 surface', 'A3381A': 'v1 accent text',
  };
  const key = (c) => { const m = c && c.match(/rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/); if (!m) return null;
    return [m[1], m[2], m[3]].map((v) => Math.round(+v).toString(16).padStart(2, '0')).join('').toUpperCase(); };
  const PROPS = ['color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'fill', 'stroke', 'textDecorationColor', 'boxShadow', 'caretColor', 'accentColor', 'stopColor'];
  const hits = []; const seen = new Set();
  const name = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const scan = (el, pseudo) => {
    const cs = getComputedStyle(el, pseudo);
    if (pseudo && (cs.content === 'none' || cs.content === 'normal')) return;
    if (cs.display === 'none') return;
    for (const p of PROPS) {
      const v = cs[p]; if (!v || v === 'none') continue;
      for (const m of v.matchAll(/rgba?\([^)]+\)/g)) {
        const k = key(m[0]);
        if (k && OLD[k]) { const id = k + name(el) + p; if (!seen.has(id)) { seen.add(id); hits.push({ color: '#' + k + ' (' + OLD[k] + ')', where: name(el) + (pseudo || ''), prop: p }); } }
      }
    }
  };
  const walk = (root) => root.querySelectorAll('*').forEach((el) => { scan(el); scan(el, '::before'); scan(el, '::after'); if (el.shadowRoot) walk(el.shadowRoot); });
  scan(document.documentElement); walk(document);
  // images that are still the old screenshots are caught by file name list, passed in by the runner
  return hits.slice(0, 40);
})()
