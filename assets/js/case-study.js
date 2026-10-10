/* Case study page behavior. Shares components with the app:
   keel-lottie.js (player), keel-charts.js (data-bound charts), motion-registry.js (descriptions). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function reduced() { return window.keelMotion.reduced(); }
  function isDark() { return window.keelMotion.isDark(); }
  var frame = $('#proto-frame');
  function toFrame(msg) { try { frame.contentWindow.postMessage(msg, '*'); } catch (e) {} }

  // ================================================================ theme and motion switches
  function syncToggles() {
    var dark = isDark(), red = document.documentElement.getAttribute('data-motion') === 'reduced';
    $('#theme-label').textContent = dark ? 'Light' : 'Dark';
    $('#theme-toggle').setAttribute('aria-pressed', String(dark));
    $('#theme-toggle').setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    $('#motion-label').textContent = red ? 'Full motion' : 'Reduce motion';
    $('#motion-toggle').setAttribute('aria-pressed', String(red));
  }
  $('#theme-toggle').addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('keel-theme', next); } catch (e) {}
    document.dispatchEvent(new Event('keel-theme'));
    syncToggles(); renderAudit();
    toFrame({ keel: 'theme', value: next });
  });
  $('#motion-toggle').addEventListener('click', function () {
    var red = document.documentElement.getAttribute('data-motion') === 'reduced';
    if (red) document.documentElement.removeAttribute('data-motion'); else document.documentElement.setAttribute('data-motion', 'reduced');
    try { localStorage.setItem('keel-motion', red ? 'full' : 'reduced'); } catch (e) {}
    syncToggles();
    document.dispatchEvent(new Event('keel-motion'));
    toFrame({ keel: 'motion', value: red ? 'full' : 'reduced' });
    if (!red) $$('keel-lottie').forEach(function (el) { if (el.isPlaying && !el.hasAttribute('loop')) el.stop(); });
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!document.documentElement.getAttribute('data-theme')) { syncToggles(); renderAudit(); }
  });

  // ================================================================ contrast table
  // Generated from source/contrast_audit.json (python3 source/contrast_audit.py)
  var AUDIT = [["light", "Ink", "#252A28", "canvas", "#F6F3ED", "Headings, body, balances", 13.16, 4.5], ["light", "Ink", "#252A28", "surface", "#E6E2D9", "Text on panels and rows", 11.28, 4.5], ["light", "Ink", "#252A28", "surface-2", "#DCD7CC", "Chart labels in the water band", 10.16, 4.5], ["light", "Secondary", "#656B66", "canvas", "#F6F3ED", "Supporting copy, metadata", 4.93, 4.5], ["light", "Secondary on surface", "#555B56", "surface", "#E6E2D9", "Metadata in rows and panels", 5.38, 4.5], ["light", "Secondary on surface", "#555B56", "surface-2", "#DCD7CC", "Depth ticks in the water band", 4.85, 4.5], ["light", "Accent text", "#9E412B", "canvas", "#F6F3ED", "Links, text-button underline color", 5.84, 4.5], ["light", "Accent text", "#9E412B", "surface", "#E6E2D9", "Links on panels", 5.01, 4.5], ["light", "Label", "#FFFFFF", "accent", "#B94F36", "Primary button, selected chip", 4.96, 4.5], ["light", "Label", "#FFFFFF", "accent hover", "#A4452F", "Primary button, hover", 6.05, 4.5], ["light", "Label", "#FFFFFF", "accent pressed", "#8F3C29", "Primary button, pressed", 7.38, 4.5], ["light", "Disabled label", "#555B56", "disabled", "#DCD7CC", "Disabled buttons stay readable", 4.85, 4.5], ["light", "Positive", "#2E6A4E", "canvas", "#F6F3ED", "Positive status text", 5.77, 4.5], ["light", "Positive", "#2E6A4E", "surface", "#E6E2D9", "Positive status text on panels", 4.94, 4.5], ["light", "Negative", "#9B2C3A", "canvas", "#F6F3ED", "Negative status text", 6.74, 4.5], ["light", "Negative", "#9B2C3A", "surface", "#E6E2D9", "Negative status text on panels", 5.77, 4.5], ["light", "Warning", "#7D5300", "canvas", "#F6F3ED", "Warning status text", 6.1, 4.5], ["light", "Warning", "#7D5300", "surface", "#E6E2D9", "Warning status text on panels", 5.22, 4.5], ["light", "Info", "#3B5A72", "canvas", "#F6F3ED", "Info status text", 6.56, 4.5], ["light", "Info", "#3B5A72", "surface", "#E6E2D9", "Info status text on panels", 5.62, 4.5], ["light", "Control border", "#7D7E7B", "canvas", "#F6F3ED", "Inputs, chips, switches", 3.69, 3.0], ["light", "Control border", "#767772", "surface", "#E6E2D9", "Inputs on panels", 3.49, 3.0], ["light", "Accent fill", "#B94F36", "canvas", "#F6F3ED", "Primary button and active tab marker", 4.48, 3.0], ["light", "Focus ring", "#9E412B", "canvas", "#F6F3ED", "Keyboard focus", 5.84, 3.0], ["light", "Focus ring", "#9E412B", "surface", "#E6E2D9", "Keyboard focus on panels", 5.01, 3.0], ["light", "Switch thumb on", "#FFFFFF", "accent", "#B94F36", "Switch, on state", 4.96, 3.0], ["light", "Keel (chart mark)", "#252A28", "surface-2", "#DCD7CC", "The reading: keel depth", 10.16, 3.0], ["light", "Hull (chart mark)", "#B94F36", "canvas", "#F6F3ED", "The reading: hull on the waterline", 4.48, 3.0], ["light", "Data 1", "#252A28", "canvas", "#F6F3ED", "Largest category share", 13.16, 3.0], ["light", "Data 3", "#7A7F79", "canvas", "#F6F3ED", "Mid category share", 3.69, 3.0], ["light", "Hairline", "#CFCCC4", "canvas", "#F6F3ED", "Card edges (fill already separates)", 1.45, null], ["light", "Row rule", "#C3C1B9", "surface", "#E6E2D9", "Row dividers inside lists", 1.39, null], ["light", "Data 4", "#A6A9A2", "canvas", "#F6F3ED", "Small category share; same text equivalent as Data 5", 2.15, null], ["light", "Data 5", "#C9C8BF", "canvas", "#F6F3ED", "Smallest category share; labeled with name and percent in a chip", 1.52, null], ["dark", "Ink", "#F4F0E7", "canvas", "#202725", "Headings, body, balances", 13.4, 4.5], ["dark", "Ink", "#F4F0E7", "surface", "#2A322F", "Text on panels and rows", 11.57, 4.5], ["dark", "Ink", "#F4F0E7", "surface-2", "#353E3A", "Chart labels in the water band", 9.71, 4.5], ["dark", "Secondary", "#B3B6AE", "canvas", "#202725", "Supporting copy, metadata", 7.41, 4.5], ["dark", "Secondary on surface", "#B3B6AE", "surface", "#2A322F", "Metadata in rows and panels", 6.4, 4.5], ["dark", "Secondary on surface", "#B3B6AE", "surface-2", "#353E3A", "Depth ticks in the water band", 5.37, 4.5], ["dark", "Accent text", "#E38A6C", "canvas", "#202725", "Links, text-button underline color", 5.89, 4.5], ["dark", "Accent text", "#E38A6C", "surface", "#2A322F", "Links on panels", 5.09, 4.5], ["dark", "Label", "#202725", "accent", "#E07F60", "Primary button, selected chip", 5.35, 4.5], ["dark", "Label", "#202725", "accent hover", "#E68D70", "Primary button, hover", 6.1, 4.5], ["dark", "Label", "#202725", "accent pressed", "#D9714F", "Primary button, pressed", 4.66, 4.5], ["dark", "Disabled label", "#B3B6AE", "disabled", "#353E3A", "Disabled buttons stay readable", 5.37, 4.5], ["dark", "Positive", "#7FC4A0", "canvas", "#202725", "Positive status text", 7.48, 4.5], ["dark", "Positive", "#7FC4A0", "surface", "#2A322F", "Positive status text on panels", 6.46, 4.5], ["dark", "Negative", "#F09AA3", "canvas", "#202725", "Negative status text", 7.15, 4.5], ["dark", "Negative", "#F09AA3", "surface", "#2A322F", "Negative status text on panels", 6.18, 4.5], ["dark", "Warning", "#E2B45C", "canvas", "#202725", "Warning status text", 7.92, 4.5], ["dark", "Warning", "#E2B45C", "surface", "#2A322F", "Warning status text on panels", 6.84, 4.5], ["dark", "Info", "#9DBCD6", "canvas", "#202725", "Info status text", 7.69, 4.5], ["dark", "Info", "#9DBCD6", "surface", "#2A322F", "Info status text on panels", 6.64, 4.5], ["dark", "Control border", "#8A8C86", "canvas", "#202725", "Inputs, chips, switches", 4.48, 3.0], ["dark", "Control border", "#8F918B", "surface", "#2A322F", "Inputs on panels", 4.13, 3.0], ["dark", "Accent fill", "#E07F60", "canvas", "#202725", "Primary button and active tab marker", 5.35, 3.0], ["dark", "Focus ring", "#E38A6C", "canvas", "#202725", "Keyboard focus", 5.89, 3.0], ["dark", "Focus ring", "#E38A6C", "surface", "#2A322F", "Keyboard focus on panels", 5.09, 3.0], ["dark", "Switch thumb on", "#202725", "accent", "#E07F60", "Switch, on state", 5.35, 3.0], ["dark", "Keel (chart mark)", "#F4F0E7", "surface-2", "#353E3A", "The reading: keel depth", 9.71, 3.0], ["dark", "Hull (chart mark)", "#E07F60", "canvas", "#202725", "The reading: hull on the waterline", 5.35, 3.0], ["dark", "Data 1", "#F4F0E7", "canvas", "#202725", "Largest category share", 13.4, 3.0], ["dark", "Data 3", "#9A9E97", "canvas", "#202725", "Mid category share", 5.59, 3.0], ["dark", "Hairline", "#424945", "canvas", "#202725", "Card edges (fill already separates)", 1.65, null], ["dark", "Row rule", "#4A504C", "surface", "#2A322F", "Row dividers inside lists", 1.59, null], ["dark", "Data 4", "#6E746E", "canvas", "#202725", "Small category share; same text equivalent as Data 5", 3.18, null], ["dark", "Data 5", "#4D5550", "canvas", "#202725", "Smallest category share; labeled with name and percent in a chip", 1.98, null]];
  function renderAudit() {
    var theme = isDark() ? 'dark' : 'light', body = $('#contrast-rows'); if (!body) return;
    body.innerHTML = AUDIT.filter(function (r) { return r[0] === theme; }).map(function (r) {
      var res = r[7] === null ? '<span class="exempt">Exempt, decorative</span>' : '<span class="pass">Pass</span>';
      return '<tr><td><span class="pair"><i style="background:' + r[4] + ';color:' + r[2] + '">Aa</i>' + r[1] + ' on ' + r[3] + '</span></td><td>' + r[5] + '</td><td>' + r[6].toFixed(2) + ':1</td><td>' + (r[7] ? r[7] + ':1' : 'n/a') + '</td><td>' + res + '</td></tr>';
    }).join('');
    $('#audit-theme').textContent = (theme === 'dark' ? 'Dark' : 'Light') + ' theme contrast audit';
  }

  // ================================================================ replay buttons beside animations
  $('#hero-replay').addEventListener('click', function () { $('#hero-lottie').replay(); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-replay-prev]'); if (!b) return;
    var scope = b.closest('.compare, figure, .closing'); var el = scope && $('keel-lottie', scope);
    if (el) el.replay();
  });

  // ================================================================ easing curves (motion section)
  function bez(p1x, p1y, p2x, p2y, t) { var u = 1 - t; return [3 * u * u * t * p1x + 3 * u * t * t * p2x + t * t * t, 3 * u * u * t * p1y + 3 * u * t * t * p2y + t * t * t]; }
  function plot(id, pts, cls) {
    var W = 200, H = 110, ox = 10, oy = 128, el = $(id); if (!el) return;
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + (ox + p[0] * W).toFixed(1) + ' ' + (oy - p[1] * H).toFixed(1); }).join('');
    el.innerHTML = '<rect class="f-surface" x="' + ox + '" y="' + (oy - H) + '" width="' + W + '" height="' + H + '"/>' +
      '<path class="s-ink" d="M' + ox + ' ' + (oy - H) + 'h' + W + '" stroke-width="1.25" stroke-dasharray="3 3"/>' +
      '<path class="s-ink2s" d="M' + ox + ' ' + oy + 'h' + W + '" stroke-width="1"/>' +
      '<path class="' + cls + '" d="' + d + '" fill="none" stroke-width="2.5" stroke-linejoin="round"/>';
  }
  (function () {
    var s = [], n = [], sp = [], t, x = 0, v = 0, dt = 1 / 600;
    for (t = 0; t <= 1.0001; t += 0.01) { s.push(bez(0.2, 0.7, 0.2, 1, t)); n.push(bez(0.17, 0.89, 0.32, 1.28, t)); }
    for (var i = 0; i <= 600; i++) { if (i % 6 === 0) sp.push([i / 600, x]); var a = -70 * (x - 1) - 15 * v; v += a * dt; x += v * dt; }
    plot('#curve-settle', s, 's-ink'); plot('#curve-snap', n, 's-ink2s'); plot('#curve-spring', sp, 's-accent-ink');
  })();

  // ================================================================ snap vs settle (motion section) and the playground keel
  function keelDrawer(finSel, bulbSel, X, TOP, PER) {
    return function (days) {
      $(finSel).setAttribute('d', 'M' + (X - 5) + ' ' + TOP + 'h10l-2 ' + (8 + days * PER) + 'h-6z');
      $(bulbSel).setAttribute('cy', TOP + 9 + days * PER);
    };
  }
  function spring(from, to, draw, done) {
    if (reduced()) { draw(to); if (done) done(); return; }
    var x = from, v = 0, last = performance.now();
    (function step(now) {
      var dt = Math.min(0.032, Math.max(0, (now - last) / 1000)); last = now;
      var a = -70 * (x - to) - 15 * v; v += a * dt; x += v * dt; draw(x);
      if (Math.abs(x - to) > 0.01 || Math.abs(v) > 0.01) requestAnimationFrame(step); else { draw(to); if (done) done(); }
    })(last);
  }
  if ($('#motion-run')) {
    var drawSnap = keelDrawer('#snap-path', '#snap-bulb', 130, 38, 7), drawSettle = keelDrawer('#settle-path', '#settle-bulb', 130, 38, 7);
    var cur = 3; drawSnap(cur); drawSettle(cur);
    $('#motion-run').addEventListener('click', function () {
      var from = cur, to = cur === 3 ? 13 : 3; cur = to;
      if (reduced()) { drawSnap(to); drawSettle(to); $('#motion-note').textContent = 'Motion is reduced, so both jump straight to the new depth.'; return; }
      $('#motion-note').textContent = 'Runs both at once so you can feel the difference.';
      var t0 = performance.now();
      (function f(now) {
        var p = Math.min(1, (now - t0) / 350), tt = p;
        for (var k = 0; k < 6; k++) { var bx = bez(0.17, 0.89, 0.32, 1.28, tt)[0] - p, d = (bez(0.17, 0.89, 0.32, 1.28, tt + 0.001)[0] - bez(0.17, 0.89, 0.32, 1.28, tt)[0]) / 0.001; if (Math.abs(d) < 1e-6) break; tt = Math.max(0, Math.min(1, tt - bx / d)); }
        drawSnap(from + (to - from) * bez(0.17, 0.89, 0.32, 1.28, tt)[1]);
        if (p < 1) requestAnimationFrame(f); else drawSnap(to);
      })(t0);
      spring(from, to, drawSettle);
    });
  }

  // ================================================================ scroll reveals (once; nothing hidden without JS)
  var revealIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }) : null;
  $$('.reveal, .horizon, .ia-draw').forEach(function (el) { if (revealIO) revealIO.observe(el); else el.classList.add('in'); });

  // ================================================================ lo-fi to hi-fi comparison
  var lohiR = $('#lohi-range');
  if (lohiR) lohiR.addEventListener('input', function () { $('#lohi').style.setProperty('--cut', this.value + '%'); });

  // ================================================================ sample data for gallery and playground charts
  var C = window.KeelCharts, D = function (m, d) { return new Date(2026, m, d); }, TODAY = D(9, 8);
  var CATS = [
    { key: 'Groceries', label: 'Groceries', color: 'var(--data-1)', value: 138.90, last: 98.20 },
    { key: 'Eating out', label: 'Eating out', color: 'var(--data-2)', value: 60.55, last: 52.10 },
    { key: 'Getting around', label: 'Getting around', color: 'var(--data-3)', value: 47.25, last: 41.00 },
    { key: 'Everything else', label: 'Everything else', color: 'var(--data-5)', value: 47.59, last: 33.50 }
  ];
  function catRows(moved) {
    return CATS.map(function (c) {
      var v = c.value + (moved ? (c.key === 'Groceries' ? 38.5 : c.key === 'Eating out' ? -38.5 : 0) : 0);
      var d = v - c.last;
      return { key: c.key, label: c.label, color: c.color, value: v, last: c.last,
        note: Math.abs(d) < 5 ? 'About the same as last stretch' : C.money(Math.abs(d)) + (d > 0 ? ' more' : ' less') + ' than by this point last stretch' };
    });
  }
  var WEEK = [54.30, 32.85, 19.99, 82.50, 61.20, 28.95, 26.65].map(function (a, i) { return { date: D(9, 2 + i), amt: a }; });
  var BILLS = [['Streaming', 10, 17, true], ['Phone', 12, 65], ['Internet', 14, 70], ['Car insurance', 15, 142], ['Gym', 21, 40], ['Rent', 32, 1450]]
    .map(function (b) { return { name: b[0], date: D(9, b[1]), amt: b[2], next: !!b[3] }; });
  function series(extra) {
    var dates = [TODAY], cur = [380], wth = [380];
    for (var k = 0; k < 13; k++) { dates.push(D(9, 16 + 14 * k)); cur.push(380 + 50 * (k + 1)); wth.push(380 + (50 + extra) * (k + 1)); }
    return { today: TODAY, dates: dates, cur: cur, wth: wth };
  }

  // ================================================================ Motion gallery (built from motion-registry.js)
  var GAL = $('#gallery');
  var POSTER = { line: 86, goal: 76, onboarding: 240, loading: 0 };
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  function playItem(m, el) {
    if (m.id === 'line') { el.playSegment(0, 36).then(function () { setTimeout(function () { el._scrub = 0; el.scrubTo(0.41, { from: 36, to: 136, duration: 900 }); }, reduced() ? 0 : 620); }); return; }
    if (m.id === 'goal') { el._scrub = 0; el.scrubTo(0.38, { from: 0, to: 200, duration: 1200 }); return; }
    if (m.id === 'onboarding') { el.playSegment(0, 240); return; }
    el.replay();
  }
  function chartStage(m, stage) {
    if (m.chart === 'bars') {
      var box = document.createElement('div'); box.className = 'rows cats'; stage.appendChild(box);
      var moved = false; C.bars(box, catRows(false));
      return { replay: function () { box._rows = null; C.bars(box, catRows(moved)); }, change: function () { moved = !moved; C.bars(box, catRows(moved)); }, changeLabel: 'Move a transaction' };
    }
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'chart ' + (m.chart === 'week' ? 'week' : m.chart === 'timeline' ? 'timeline' : 'scenario'));
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', m.title);
    stage.appendChild(svg);
    if (m.chart === 'week') { svg.setAttribute('viewBox', '0 0 340 150'); var w = function () { C.week(svg, { days: WEEK, usual: 48, today: TODAY }); }; w(); return { replay: w }; }
    if (m.chart === 'timeline') { svg.setAttribute('viewBox', '0 0 340 74'); var t = function () { C.timeline(svg, { today: TODAY, payday: D(9, 16), span: 24, bills: BILLS }); }; t(); return { replay: t }; }
    svg.setAttribute('viewBox', '0 0 340 210');
    var ex = [0, 100, 200], i = 1, shown = null;
    shown = C.scenario(svg, series(ex[i]), { duration: 0 });
    return { replay: function () { shown = C.scenario(svg, series(ex[i]), { from: [series(0).cur, series(0).cur] }); },
      change: function () { i = (i + 1) % ex.length; shown = C.scenario(svg, series(ex[i]), { from: shown }); this.changeLabel = '+$' + ex[i]; }, changeLabel: 'Change the amount' };
  }
  function buildGallery() {
    if (!GAL || !window.KEEL_MOTION) return;
    window.KEEL_MOTION.forEach(function (m, idx) {
      var art = document.createElement('article');
      art.className = 'g-item reveal' + (idx % 2 ? ' flip' : ''); art.id = 'motion-' + m.id; art.setAttribute('aria-labelledby', 'gt-' + m.id);
      var isLottie = !!m.file;
      var stage = document.createElement('div'); stage.className = 'g-stage';
      var el = null, chart = null;
      if (isLottie) {
        el = document.createElement('keel-lottie');
        el.setAttribute('name', m.file);
        if (m.loop) el.setAttribute('loop', '');
        else el.setAttribute('trigger', m.tech.indexOf('progress') < 0 && m.id !== 'onboarding' ? 'inview' : 'manual');
        el.setAttribute('poster', POSTER[m.id] !== undefined ? POSTER[m.id] : 'end');
        el.setAttribute('label', m.title + ': ' + m.intention);
        el.style.aspectRatio = m.aspect;
        if (m.aspect === '1/1') el.style.maxWidth = '200px';
        stage.appendChild(el);
      } else chart = chartStage(m, stage);
      var ctrl = document.createElement('div'); ctrl.className = 'g-ctrl';
      if (isLottie) {
        ctrl.innerHTML = '<button class="btn btn-primary" type="button" data-a="play">Play</button><button class="btn btn-quiet" type="button" data-a="pause">Pause</button><button class="btn btn-quiet" type="button" data-a="replay">Replay</button>' +
          (m.id === 'goal' ? '<button class="btn btn-quiet" type="button" data-a="full">Fill to 100%</button>' : '');
      } else {
        ctrl.innerHTML = '<button class="btn btn-primary" type="button" data-a="replay">Replay</button>' + (chart.change ? '<button class="btn btn-quiet" type="button" data-a="change">' + chart.changeLabel + '</button>' : '');
      }
      $$('button', ctrl).forEach(function (b) { b.setAttribute('aria-label', b.textContent + ': ' + m.title); });
      ctrl.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        var a = b.getAttribute('data-a');
        if (isLottie) {
          if (a === 'play') { if (el.anim && el.anim.isPaused && el.anim.currentFrame > 0 && el.anim.currentFrame < el.totalFrames - 1 && !el.hasAttribute('loop')) el.play(); else playItem(m, el); }
          if (a === 'pause') el.pause();
          if (a === 'replay') playItem(m, el);
          if (a === 'full') el.scrubTo(1, { from: 0, to: 200, duration: 900 }).then(function () { el.playSegment(200, 259); });
        } else {
          if (a === 'replay') chart.replay();
          if (a === 'change') { chart.change(); b.textContent = chart.changeLabel; }
        }
      });
      stage.appendChild(ctrl);
      var txt = document.createElement('div');
      txt.innerHTML = '<span class="g-num">' + m.n + '</span><h3 id="gt-' + m.id + '">' + esc(m.title) + '</h3>' +
        '<span class="g-tech' + (isLottie ? ' lottie' : '') + '">' + esc(m.tech) + '</span>' +
        '<p class="intent">' + esc(m.intention) + '</p>' +
        '<p class="problem"><b>The problem.</b> ' + esc(m.problem) + '</p>' +
        '<dl class="g-specs"><dt>Behavior</dt><dd>' + esc(m.behavior) + '</dd><dt>Trigger</dt><dd>' + esc(m.trigger) + '</dd><dt>Timing</dt><dd>' + esc(m.timing) + '</dd>' +
        '<dt>Easing</dt><dd>' + esc(m.easing) + '</dd><dt>Principles</dt><dd>' + esc(m.principles.join(', ')) + '</dd><dt>Where</dt><dd>' + esc(m.where) + '</dd><dt>Accessibility</dt><dd>' + esc(m.a11y) + '</dd></dl>';
      var impl = document.createElement('details'); impl.className = 'g-more';
      impl.innerHTML = '<summary>Implementation details</summary><pre><code>' + esc(m.impl) + '</code></pre><p class="small muted">' +
        (isLottie ? 'Source: <code>source/lottie/build.py</code>, function <code>' + esc(m.file.replace('-', '_')) + '</code>. Files: <a href="assets/lottie/' + m.file + '.json">' + m.file + '.json</a>, <a href="assets/lottie/' + m.file + '-dark.json">' + m.file + '-dark.json</a>, static fallback <a href="assets/fallbacks/' + m.file + '.svg">' + m.file + '.svg</a>.'
          : 'Source: <code>assets/js/keel-charts.js</code>. Drawn from data on every change; colors from token classes, so both themes come free.') + '</p>';
      txt.appendChild(impl);
      art.appendChild(stage); art.appendChild(txt);
      if (m.storyboard) {
        var sb = document.createElement('details'); sb.className = 'g-more g-sb';
        sb.innerHTML = '<summary>Storyboard: ' + m.storyboard.length + ' frames from the shipped file</summary>';
        sb.addEventListener('toggle', function () {
          if (!sb.open || sb._built) return; sb._built = true;
          var strip = document.createElement('div'); strip.className = 'strip'; strip.style.setProperty('--n', m.storyboard.length);
          m.storyboard.forEach(function (f) {
            var fig = document.createElement('figure');
            var k = document.createElement('keel-lottie'); k.setAttribute('name', m.file); k.setAttribute('poster', f[0]); k.setAttribute('no-fallback', ''); k.style.aspectRatio = m.aspect;
            k.setAttribute('label', 'Frame ' + f[0] + ': ' + f[1]);
            var cap = document.createElement('figcaption'); cap.innerHTML = '<b>' + esc(f[1]) + ' · f' + f[0] + '</b>' + esc(f[2]);
            fig.appendChild(k); fig.appendChild(cap); strip.appendChild(fig);
          });
          sb.appendChild(strip);
          var p = document.createElement('p'); p.className = 'small muted'; p.style.marginTop = '8px';
          p.textContent = 'Duration: ' + m.timing + '. Easing: ' + m.easing + '. Trigger: ' + m.trigger + ' Benefit: ' + m.intention;
          sb.appendChild(p);
        });
        art.appendChild(sb);
      }
      GAL.appendChild(art);
      if (revealIO) revealIO.observe(art); else art.classList.add('in');
    });
  }
  buildGallery();

  // ================================================================ Motion playground
  (function playground() {
    // button feedback
    var fb = $('#fb-btn'), busy = false;
    if (fb) fb.addEventListener('click', function () {
      if (busy) return; busy = true;
      var lbl = $('.lbl', fb), note = $('#fb-note');
      fb.classList.add('loading'); fb.setAttribute('aria-busy', 'true');
      var l = document.createElement('keel-lottie'); l.setAttribute('name', 'loading'); l.setAttribute('loop', ''); l.setAttribute('no-fallback', ''); l.setAttribute('label', '');
      fb.appendChild(l); l.play();
      note.textContent = 'Working on it.';
      setTimeout(function () {
        l.remove(); fb.classList.remove('loading'); fb.removeAttribute('aria-busy');
        fb.classList.add('done'); lbl.textContent = 'Moved'; note.textContent = 'Done: $50 moved. The state says so in words, not only color.';
        setTimeout(function () { fb.classList.remove('done'); lbl.textContent = 'Move $50 to goal'; busy = false; }, 1800);
      }, reduced() ? 400 : 1200);
    });
    // navigation
    var nav = $('.nav-demo');
    if (nav) nav.addEventListener('click', function (e) {
      var b = e.target.closest('[role=tab]'); if (!b) return;
      var i = +b.getAttribute('data-i');
      $$('[role=tab]', nav).forEach(function (t) { t.setAttribute('aria-selected', String(t === b)); });
      nav.style.setProperty('--i', i);
      $('.ind', nav).style.setProperty('--i', i);
      $$('.nav-panels p').forEach(function (p, k) { p.classList.toggle('on', k === i); });
    });
    // chart
    var pb = $('#pg-bars'), moved = false;
    if (pb) { C.bars(pb, catRows(false)); $('#pg-move').addEventListener('click', function () { moved = !moved; C.bars(pb, catRows(moved)); this.textContent = moved ? 'Move it back to Eating out' : 'Move dinner ($38.50) to Groceries'; }); }
    // goal
    var pgg = $('#pg-goal'), pgr = $('#pg-goal-r');
    if (pgg) {
      var go = function (instant) {
        var v = +pgr.value; $('#pg-goal-v').textContent = C.money(v);
        pgg.setAttribute('aria-label', 'Goal progress: ' + C.money(v) + ' of $1,000.');
        pgg.scrubTo(v / 1000, { from: 0, to: 200, duration: instant ? 0 : 520 }).then(function () { if (v >= 1000) pgg.playSegment(200, 259); });
      };
      pgr.addEventListener('input', function () { go(false); }); go(true);
    }
    // check
    var cats = ['Eating out', 'Groceries'], ci = 0;
    if ($('#pg-check-b')) $('#pg-check-b').addEventListener('click', function () {
      ci = 1 - ci; $('#pg-check-t').textContent = 'Hana Sushi: moved to ' + cats[ci] + '. Your reading doesn’t change.'; $('#pg-check').replay();
    });
    // equilibrium spring
    if ($('#pg-eq')) {
      var drawEq = keelDrawer('#pg-eq-fin', '#pg-eq-bulb', 120, 38, 7), eqAt = 9; drawEq(eqAt);
      $('#pg-eq-r').addEventListener('input', function () { var to = +this.value; $('#pg-eq-v').textContent = to; spring(eqAt, to, drawEq); eqAt = to; });
    }
    // loading
    if ($('#pg-load-b')) $('#pg-load-b').addEventListener('click', function () {
      var on = this.getAttribute('aria-pressed') !== 'true', l = $('#pg-load');
      this.setAttribute('aria-pressed', String(on)); this.textContent = on ? 'Stop loading' : 'Start loading';
      if (on) l.play(); else l.stop();
    });
    // onboarding
    var ends = [60, 120, 180, 240], step = 0, msgs = ['Step 1 of 4: what you have', 'Step 2 of 4: what’s already spoken for', 'Step 3 of 4: the shore you measure toward', 'Step 4 of 4: your reading is ready'];
    function onb(n) { if (n < 0 || n > 3 || n === step) return; $('#pg-onb').playSegment(ends[step], ends[n]); step = n; $('#pg-onb-t').textContent = msgs[n]; }
    if ($('#pg-onb-next')) { $('#pg-onb-next').addEventListener('click', function () { onb(step + 1); }); $('#pg-onb-back').addEventListener('click', function () { onb(step - 1); }); }
    // design system demos
    var dsIn = $('#ds-in');
    if (dsIn) dsIn.addEventListener('input', function () {
      var bad = /[^0-9.,\s]/.test(this.value);
      $('#ds-field').setAttribute('aria-invalid', String(bad));
      $('#ds-msg').textContent = bad ? 'Use numbers only, like 40 or 12.50.' : this.value ? 'Looks right.' : 'Type an amount, or a letter to see the error.';
      $('#ds-msg').style.color = bad ? 'var(--negative)' : '';
    });
    if ($('#ds-sw')) $('#ds-sw').addEventListener('click', function () { this.setAttribute('aria-checked', String(this.getAttribute('aria-checked') !== 'true')); });
    $$('#system .chips .chip').forEach(function (c, i, all) { c.addEventListener('click', function () { all.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); }); }); });
    if ($('#ds-confirm-b')) $('#ds-confirm-b').addEventListener('click', function () {
      var box = $('#ds-confirm'); box.style.opacity = 1; $('keel-lottie', box).replay();
      clearTimeout(box._t); box._t = setTimeout(function () { box.style.opacity = 0; }, 3500);
    });
  })();

  // ================================================================ Experience Keel: mobile and desktop previews
  var shell = $('#frame-shell'), vp = $('#viewport'), mode = 'mobile', SIZES = { mobile: [390, 844], desktop: [1280, 800] };
  function fitFrame() {
    if (!shell) return;
    var size = SIZES[mode], avail = mode === 'mobile' ? Math.min(390, shell.clientWidth - 20) : shell.clientWidth;
    var s = Math.min(1, avail / size[0]);
    frame.style.width = size[0] + 'px'; frame.style.height = size[1] + 'px';
    frame.style.transform = s < 1 ? 'scale(' + s + ')' : '';
    vp.style.width = mode === 'mobile' ? (size[0] * s) + 'px' : '100%';
    vp.style.height = (size[1] * s) + 'px';
  }
  $$('.seg [data-mode]').forEach(function (b) {
    b.addEventListener('click', function () {
      mode = b.getAttribute('data-mode');
      $$('.seg [data-mode]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      shell.className = 'frame-shell ' + mode; $('#exp').className = 'exp figure ' + mode;
      fitFrame();
    });
  });
  if ('ResizeObserver' in window && shell) new ResizeObserver(fitFrame).observe(shell.parentElement);
  window.addEventListener('resize', fitFrame); fitFrame();

  // loading and failure states
  var ready = false, state = $('#frame-state');
  function frameReady() {
    if (ready) return; ready = true; state.hidden = true;
    toFrame({ keel: 'theme', value: isDark() ? 'dark' : 'light' });
    toFrame({ keel: 'motion', value: document.documentElement.getAttribute('data-motion') === 'reduced' ? 'reduced' : 'full' });
  }
  if (frame) {
    frame.addEventListener('load', function () { setTimeout(frameReady, 150); });
    var watch = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; watch.disconnect();
      $('keel-lottie', state).play();
      setTimeout(function () {
        if (ready) return;
        $('keel-lottie', state).stop();
        $('#frame-msg').innerHTML = 'The prototype didn’t load here. <a href="prototype.html" target="_blank" rel="noopener">Open it in its own tab</a>.';
      }, 12000);
    });
    watch.observe(state);
  }
  var walkBtns = $$('#walk button');
  function mark(name) { walkBtns.forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.jump === name)); }); }
  walkBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.jump) toFrame({ keel: 'go', name: b.dataset.jump });
      if (b.dataset.whatif) toFrame({ keel: 'whatif', amount: +b.dataset.whatif });
      walkBtns.forEach(function (x) { x.setAttribute('aria-current', String(x === b)); });
    });
  });
  window.addEventListener('message', function (e) {
    if (e.source !== frame.contentWindow) return;
    var d = e.data || {};
    if (d.keel === 'screen') { frameReady(); if (!d.fromWalk) mark(d.name); }
  });
  if ($('#exp-reset')) $('#exp-reset').addEventListener('click', function () { toFrame({ keel: 'reset' }); });

  // ================================================================ Rive in practice (a real .riv in the Rive web runtime)
  // Third-party file, CC BY 4.0: "Toggle switch" by ashishb, recolored by source/rive/recolor_toggle.py.
  (function riveDemo() {
    var btn = $('#rv-switch'), canvas = $('#rv-canvas'), box = $('.rive-demo');
    if (!btn) return;
    var r = null, on = false, loading = null, visible = false;
    // Same sample model as the app: $1,240, $48 a day, bills; pausing the gym removes the Oct 21 bill.
    var BILLS = [[10, 17], [12, 65], [14, 70], [15, 142], [21, 40], [32, 1450]];
    function through(gym) {
      var bal = 1240;
      for (var i = 0; i < 90; i++) {
        var day = 8 + i, due = BILLS.filter(function (b) { return b[0] === day && (gym || b[0] !== 21); }).reduce(function (t, b) { return t + b[1]; }, 0);
        var next = bal - 48 - due;
        if (next < 0) return new Date(2026, 9, day - 1);
        bal = next;
      }
    }
    function read() {
      var t = through(!on), m = Math.round((t - new Date(2026, 9, 16)) / 864e5);
      $('#rv-read').innerHTML = 'Steady through <b>' + C.fmtDate(t) + '</b>: ' + m + ' days past payday.' + (on ? ' The gym is paused.' : '');
    }
    function runtime() {
      if (window.rive && window.rive.Rive) return Promise.resolve();
      if (loading) return loading;
      loading = new Promise(function (res, rej) {
        var sc = document.createElement('script'); sc.src = 'assets/vendor/rive.js';
        sc.onload = function () { window.rive.RuntimeLoader.setWasmUrl('assets/vendor/rive.wasm'); res(); };
        sc.onerror = rej; document.head.appendChild(sc);
      });
      return loading;
    }
    function fire() {
      var ins = r && r.stateMachineInputs('Switch'), p = ins && ins.filter(function (i) { return i.name === 'Pressed'; })[0];
      if (p) p.fire();
    }
    function jump() { try { r.scrub(on ? 'On' : 'Off', 10); } catch (e) {} }
    function build() {
      if (r) { r.cleanup(); r = null; }
      var red = reduced();
      r = new window.rive.Rive({
        src: 'assets/rive/keel-toggle' + (isDark() ? '-dark' : '') + '.riv', canvas: canvas,
        autoplay: !red, stateMachines: red ? undefined : 'Switch', animations: red ? ['Off', 'On'] : undefined,
        shouldDisableRiveListeners: true,
        onLoad: function () {
          r.resizeDrawingSurfaceToCanvas();
          btn.disabled = false;
          $('#rv-status').textContent = 'Running in the Rive web runtime' + (red ? ', motion reduced: it jumps to the end state.' : '.');
          if (red) jump(); else if (on) fire();
          if (!visible) r.stopRendering();
        },
        onLoadError: function () { btn.disabled = false; $('#rv-status').textContent = 'The Rive file didn’t load here; the switch still works as a plain control.'; }
      });
    }
    btn.addEventListener('click', function () {
      on = !on; btn.setAttribute('aria-checked', String(on)); read();
      if (!r) return;
      r.startRendering();
      if (reduced()) jump(); else fire();
    });
    var io = new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !r && !loading) runtime().then(build).catch(function () { btn.disabled = false; $('#rv-status').textContent = 'The Rive runtime didn’t load; the switch still works as a plain control.'; });
      if (r) { if (visible) r.startRendering(); else r.stopRendering(); }   // no rendering off-screen
    }, { rootMargin: '300px 0px' });
    io.observe(box);
    document.addEventListener('keel-theme', function () { if (r) build(); });
    document.addEventListener('keel-motion', function () { if (r) build(); });
    window.__keelRive = function () { return { on: on, ready: !!r, sm: r ? r.playingStateMachineNames : null, anims: r ? r.playingAnimationNames : null }; };
    read();
  })();

  // ================================================================ Rive: Keel's four state machines
  // assets/rive/{equilibrium,goal,onboarding,scenario}.riv, authored in code by
  // source/rive/build_rive.py. Each canvas is aria-hidden; its wrapper carries
  // role="img" and a label updated from the same state that feeds the inputs.
  (function riveFour() {
    var root = $('#rive-four');
    if (!root) return;
    var loading = null, inst = {}, visible = false;
    var BILLS = [[10, 17], [12, 65], [14, 70], [15, 142], [21, 40], [32, 1450]], PAYDAY = new Date(2026, 9, 16);
    function through(spend) {
      var bal = 1240 - spend;
      if (bal < 0) return new Date(2026, 9, 7);
      for (var i = 0; i < 90; i++) {
        var day = 8 + i, due = BILLS.filter(function (b) { return b[0] === day; }).reduce(function (t, b) { return t + b[1]; }, 0);
        var next = bal - 48 - due;
        if (next < 0) return new Date(2026, 9, day - 1);
        bal = next;
      }
      return new Date(2026, 9, 97);
    }
    function margin(spend) { return Math.round((through(spend) - PAYDAY) / 864e5); }
    function depth(m) { return Math.max(0.4, Math.min(14, m)); }
    function days(n) { n = Math.abs(n); return n + (n === 1 ? ' day' : ' days'); }
    function runtime() {
      if (window.rive && window.rive.Rive) return Promise.resolve();
      if (loading) return loading;
      loading = new Promise(function (res, rej) {
        var sc = document.createElement('script'); sc.src = 'assets/vendor/rive.js';
        sc.onload = function () { window.rive.RuntimeLoader.setWasmUrl('assets/vendor/rive.wasm'); res(); };
        sc.onerror = rej; document.head.appendChild(sc);
      });
      return loading;
    }
    var SM = { equilibrium: 'Equilibrium', goal: 'Goal', onboarding: 'Onboarding', scenario: 'Scenario' };
    function input(name, key) {
      var r = inst[name]; if (!r || !r.__ready) return null;
      return (r.stateMachineInputs(SM[name]) || []).filter(function (i) { return i.name === key; })[0] || null;
    }
    function set(name, key, v) { var i = input(name, key); if (i) { i.value = v; wake(name); } }
    function fire(name, key) { var i = input(name, key); if (i && !reduced()) { i.fire(); wake(name); } }
    // Render only while something can move, then stop (rive-spec: rendering rule).
    function wake(name) {
      var r = inst[name]; if (!r || !visible) return;
      r.startRendering(); clearTimeout(r.__sleep);
      r.__sleep = setTimeout(function () { if (inst[name] === r) r.stopRendering(); }, 1600);
    }
    // Host-side easing: the spec keeps springs and settles out of the file.
    var tw = {};
    function ease(name, key, from, to, dur, curve) {
      cancelAnimationFrame(tw[name + key]);
      if (reduced() || dur === 0 || from === to) { set(name, key, to); return; }
      var t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - t0) / dur);
        set(name, key, from + (to - from) * curve(k));
        if (k < 1) tw[name + key] = requestAnimationFrame(step);
      })(t0);
    }
    function settleCurve(k) { return 1 - Math.pow(1 - k, 3); }
    function spring(name, key, from, to) {
      cancelAnimationFrame(tw[name + key]);
      if (reduced()) { set(name, key, to); return; }
      var x = from, v = 0, last = performance.now();
      (function step(now) {
        var dt = Math.min(0.032, Math.max(0, (now - last) / 1000)); last = now;
        v += (-70 * (x - to) - 15 * v) * dt; x += v * dt;
        set(name, key, x);
        if (Math.abs(x - to) > 0.01 || Math.abs(v) > 0.01) tw[name + key] = requestAnimationFrame(step); else set(name, key, to);
      })(last);
    }

    // ---- state, owned by the page; the files only draw it
    var st = { buy: 0, eqShown: depth(margin(0)), saved: 380, step: 0, extra: 0 };
    var STEPS = ['what you have', 'what’s spoken for', 'when you’re paid', 'your first reading'];
    function eqSync(animate) {
      var m = margin(st.buy), t = through(st.buy), d = depth(m);
      $('#rv4-buy-out').textContent = C.money(st.buy);
      $('#rv4-eq-read').innerHTML = (m >= 0 ? 'Steady through <b>' : 'Covered through <b>') + C.fmtDate(t) + '</b>: ' + days(m) + (m >= 0 ? ' past' : ' before') + ' payday.' + (st.buy ? ' Before the purchase: Oct 25.' : '');
      $('#rv4-eq-img').setAttribute('aria-label', 'Keel depth: covered ' + days(m) + (m >= 0 ? ' past' : ' before') + ' payday' + (st.buy ? ', down from 9 days before the purchase.' : '.'));
      set('equilibrium', 'ghostValue', depth(margin(0)));
      set('equilibrium', 'isInteracting', st.buy > 0);
      if (animate) spring('equilibrium', 'steadinessValue', st.eqShown, d); else set('equilibrium', 'steadinessValue', d);
      st.eqShown = d;
    }
    function goalSync(from) {
      var p = Math.min(1, st.saved / 1000);
      $('#rv4-goal-read').innerHTML = st.saved >= 1000 ? 'Car repair fund: <b>done</b>, $1,000 set aside.' : 'Car repair fund: <b>' + C.money(st.saved) + '</b> of $1,000.';
      $('#rv4-goal-img').setAttribute('aria-label', st.saved >= 1000 ? 'Car repair fund complete: $1,000 of $1,000.' : 'Car repair fund: ' + C.money(st.saved) + ' of $1,000.');
      $('#rv4-add').disabled = st.saved >= 1000;
      if (from === undefined) { set('goal', 'progress', p); set('goal', 'isComplete', p >= 1); return; }
      ease('goal', 'progress', from, p, 900, settleCurve);
      setTimeout(function () { set('goal', 'isComplete', p >= 1); }, reduced() ? 0 : 900);
    }
    function onbSync() {
      $('#rv4-onb-read').innerHTML = 'Step ' + (st.step + 1) + ' of 4: <b>' + STEPS[st.step] + '</b>.';
      $('#rv4-onb-img').setAttribute('aria-label', 'Step ' + (st.step + 1) + ' of 4: ' + STEPS[st.step] + '.');
      $('#rv4-back').disabled = st.step === 0; $('#rv4-next').disabled = st.step === 3;
      set('onboarding', 'step', st.step);
    }
    var END = new Date(2027, 3, 2);
    function scSync(animate, from) {
      var cur = 380 + 50 * 13, wth = 380 + (50 + st.extra) * 13;
      $('#rv4-extra-out').textContent = C.money(st.extra);
      $('#rv4-sc-read').innerHTML = st.extra ? 'By Apr 2, 2027: <b>' + C.money(wth) + '</b> set aside instead of ' + C.money(cur) + '.' : 'By Apr 2, 2027: <b>' + C.money(cur) + '</b> set aside on the current plan.';
      $('#rv4-sc-img').setAttribute('aria-label', 'Projected savings to Apr 2, 2027: ' + C.money(cur) + ' on the current plan' + (st.extra ? ', ' + C.money(wth) + ' with ' + C.money(st.extra) + ' more each paycheck.' : '.'));
      $('#rv4-apply').disabled = st.extra === 0;
      if (animate) ease('scenario', 'extraPerPaycheck', from, st.extra, 520, function (k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; });
      else set('scenario', 'extraPerPaycheck', st.extra);
    }
    function syncAll() { eqSync(false); goalSync(); onbSync(); scSync(false); }

    $('#rv4-buy').addEventListener('input', function () { st.buy = +this.value; eqSync(true); });
    $('#rv4-buy').addEventListener('change', function () { fire('equilibrium', 'hasUpdated'); });
    $('#rv4-add').addEventListener('click', function () { var from = Math.min(1, st.saved / 1000); st.saved = Math.min(1000, st.saved + 100); fire('goal', 'contributed'); goalSync(from); });
    $('#rv4-goal-reset').addEventListener('click', function () { st.saved = 380; goalSync(); $('#rv4-add').focus(); });
    $('#rv4-next').addEventListener('click', function () { if (st.step < 3) { st.step++; set('onboarding', 'direction', 1); onbSync(); } if (st.step === 3) $('#rv4-back').focus(); });
    $('#rv4-back').addEventListener('click', function () { if (st.step > 0) { st.step--; set('onboarding', 'direction', -1); onbSync(); } if (st.step === 0) $('#rv4-next').focus(); });
    var scFrom = 0;
    $('#rv4-extra').addEventListener('input', function () { var f = scFrom; st.extra = +this.value; scFrom = st.extra; scSync(true, f); });
    $('#rv4-apply').addEventListener('click', function () { fire('scenario', 'applied'); $('#rv4-sc-read').innerHTML += ' Applied.'; });

    function build(name) {
      if (inst[name]) { inst[name].cleanup(); inst[name] = null; }
      var fig = root.querySelector('[data-rv="' + name + '"]'), canvas = fig.querySelector('canvas');
      var r = new window.rive.Rive({
        src: 'assets/rive/' + name + '.riv', canvas: canvas, artboard: isDark() ? 'dark' : 'light',
        stateMachines: SM[name], autoplay: true, shouldDisableRiveListeners: true,
        onLoad: function () {
          r.resizeDrawingSurfaceToCanvas(); r.__ready = true;
          set(name, 'reducedMotion', reduced());
          syncAll(); wake(name);
          if (Object.keys(inst).every(function (k) { return inst[k] && inst[k].__ready; })) $('#rv4-status').textContent = 'All four are running in the Rive web runtime' + (reduced() ? ', with motion reduced: every transition is instant.' : '.');
        },
        onLoadError: function () { $('#rv4-status').textContent = 'A Rive file didn’t load here; the readouts and controls still work.'; }
      });
      inst[name] = r;
    }
    function buildAll() { Object.keys(SM).forEach(build); }
    var io = new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !loading) runtime().then(buildAll).catch(function () { $('#rv4-status').textContent = 'The Rive runtime didn’t load; the readouts and controls still work.'; });
      Object.keys(inst).forEach(function (k) { var r = inst[k]; if (r) { if (visible) wake(k); else r.stopRendering(); } });
    }, { rootMargin: '300px 0px' });
    io.observe(root);
    document.addEventListener('keel-theme', function () { if (Object.keys(inst).length) buildAll(); });
    document.addEventListener('keel-motion', function () { Object.keys(SM).forEach(function (k) { set(k, 'reducedMotion', reduced()); }); });
    window.__keelRiveFour = function () { var o = {}; Object.keys(SM).forEach(function (k) { var r = inst[k]; o[k] = r && r.__ready ? (r.stateMachineInputs(SM[k]) || []).reduce(function (a, i) { a[i.name] = i.value; return a; }, {}) : null; }); return o; };
    syncAll();
  })();

  // ================================================================ table of contents
  var links = $$('.toc a'), secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function onScroll() {
    var y = window.scrollY + 140, idx = -1;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= y) idx = i; });
    links.forEach(function (a, i) { a.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  syncToggles();
  renderAudit();
})();
