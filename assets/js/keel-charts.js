/* keel-charts.js: the data-bound SVG charts, shared by the app and the case study.
   These are the animations that must stay numerically exact, so they are SVG
   driven by data, not Lottie (a keyframed file can't hold arbitrary values).

     KeelCharts.timeline(svg, { today, payday, span, bills: [{ name, date, amt, next }] })
     KeelCharts.week(svg, { days: [{ date, amt }], usual, today })
     KeelCharts.scenario(svg, { today, dates, cur, wth }, { from, duration })   -> returns drawn values
     KeelCharts.bars(container, rows, { selected, onCount })                   category bars
   Every chart animates with the motion tokens and jumps straight to its end
   state under reduced motion. Colors come from token classes in tokens.css. */
(function () {
  'use strict';
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function reduced() { return window.keelMotion ? window.keelMotion.reduced() : window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function ms(name) { var v = getComputedStyle(document.documentElement).getPropertyValue(name); return reduced() ? 0 : (parseFloat(v) || 0); }
  function money(n, cents) {
    var s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
    return (n < 0 ? '-$' : '$') + s;
  }
  function fmtDate(d) { return MON[d.getMonth()] + ' ' + d.getDate(); }
  function fmtLong(d) { return fmtDate(d) + (d.getFullYear() !== 2026 ? ', ' + d.getFullYear() : ''); }
  function diffDays(a, b) { return Math.round((a - b) / 86400000); }
  function same(a, b) { return diffDays(a, b) === 0; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // --ease-standard
  function easeStandard(t) {
    var lo = 0, hi = 1, m = t;
    for (var i = 0; i < 18; i++) { m = (lo + hi) / 2; var u = 1 - m, x = 3 * u * u * m * 0.4 + 3 * u * m * m * 0.2 + m * m * m; if (x < t) lo = m; else hi = m; }
    var v = 1 - m; return 3 * v * m * m + m * m * m;
  }
  function tween(dur, fn, done) {
    if (!dur) { fn(1); if (done) done(); return; }
    var t0 = performance.now();
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      fn(easeStandard(k));
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  }
  function rerun(el) { el.classList.remove('run'); void el.getBoundingClientRect(); el.classList.add('run'); }

  // ---------------------------------------------------------------- Upcoming Expenses (Reveal + emphasis on the nearest)
  function timeline(svg, o) {
    var SPAN = o.span || 24, X0 = 14, X1 = 326, Y = 44;
    var x = function (d) { return X0 + Math.max(0, Math.min(SPAN, diffDays(d, o.today))) / SPAN * (X1 - X0); };
    var bills = o.bills.filter(function (b) { var n = diffDays(b.date, o.today); return n >= 0 && n <= SPAN; });
    var out = '<desc></desc><path class="tl-line s-ink" d="M' + X0 + ' ' + Y + 'H' + X1 + '" stroke-width="1.5"/>';
    out += '<g class="tl-mark" style="transition-delay:0ms"><path class="s-ink2s" d="M' + X0 + ' ' + (Y - 6) + 'v12" stroke-width="1.5"/><text class="f-ink2s" x="' + X0 + '" y="' + (Y + 22) + '">Today</text></g>';
    var px = x(o.payday);
    out += '<g class="tl-mark" style="transition-delay:' + (bills.length + 1) * 60 + 'ms"><path class="s-ink" d="M' + px + ' ' + (Y + 8) + 'V' + (Y - 18) + '" stroke-width="2"/><path class="f-hull" d="M' + px + ' ' + (Y - 18) + 'l11 3.5-11 3.5z"/><text class="f-ink" x="' + (px + 4) + '" y="' + (Y + 22) + '" font-weight="600">Payday ' + fmtDate(o.payday) + '</text></g>';
    bills.forEach(function (b, i) {
      var bx = x(b.date);
      if (b.next) {
        var anchor = bx < 80 ? 'start' : bx > 260 ? 'end' : 'middle', tx = bx < 80 ? Math.max(0, bx - 6) : bx > 260 ? bx + 6 : bx;
        out += '<g class="tl-mark" style="transition-delay:' + ((bills.length + 2) * 60) + 'ms"><circle class="f-hull" cx="' + bx + '" cy="' + Y + '" r="6.5"/>' +
          '<text class="f-ink" x="' + tx + '" y="' + (Y - 27) + '" text-anchor="' + anchor + '" font-weight="600">' + esc(b.name) + ', ' + fmtDate(b.date) + '</text></g>';
      } else {
        out += '<g class="tl-mark" style="transition-delay:' + ((i + 1) * 60) + 'ms"><circle class="f-ink" cx="' + bx + '" cy="' + Y + '" r="3.5"/></g>';
      }
    });
    svg.innerHTML = out;
    svg.querySelector('desc').textContent = 'Next ' + SPAN + ' days. ' + bills.map(function (b) { return b.name + ' ' + money(b.amt) + ' on ' + fmtDate(b.date) + (b.next ? ' (next)' : ''); }).join(', ') + '. Payday ' + fmtDate(o.payday) + '.';
    rerun(svg);
  }

  // ---------------------------------------------------------------- Weekly Summary (Reveal, in order)
  function week(svg, o) {
    var X0 = 6, W = 328, B = 118, days = o.days;
    var top = Math.ceil(Math.max(o.usual, Math.max.apply(null, days.map(function (x) { return x.amt; }))) / 20) * 20;
    var y = function (v) { return B - v / top * 92; }, col = W / days.length, out = '<desc></desc>';
    out += '<path class="s-ink2s" d="M' + X0 + ' ' + y(o.usual) + 'H' + (X0 + W) + '" stroke-width="1" stroke-dasharray="3 3"/>';
    out += '<text class="f-ink2s" x="' + (X0 + W) + '" y="' + (y(o.usual) - 5) + '" text-anchor="end">usual ' + money(o.usual) + '</text>';
    days.forEach(function (x, i) {
      var cx = X0 + col * i + col / 2, h = B - y(x.amt), isToday = o.today && same(x.date, o.today);
      out += '<rect class="wk-bar ' + (isToday ? 'f-hull' : 'f-ink') + '" style="transition-delay:' + i * 60 + 'ms;opacity:' + (isToday ? 1 : 0.82) + '" x="' + (cx - 11) + '" y="' + (B - h) + '" width="22" height="' + Math.max(h, 0.5) + '" rx="3"/>';
      out += '<text class="f-ink" x="' + cx + '" y="' + (B - h - 6) + '" text-anchor="middle" style="font-variant-numeric:tabular-nums">' + (x.amt ? '$' + Math.round(x.amt) : '') + '</text>';
      out += '<text class="' + (isToday ? 'f-ink' : 'f-ink2s') + '" x="' + cx + '" y="' + (B + 16) + '" text-anchor="middle"' + (isToday ? ' font-weight="600"' : '') + '>' + DOW[x.date.getDay()] + '</text>';
      out += '<text class="f-ink2s" x="' + cx + '" y="' + (B + 30) + '" text-anchor="middle">' + x.date.getDate() + '</text>';
    });
    out += '<path class="s-ink" d="M' + X0 + ' ' + B + 'H' + (X0 + W) + '" stroke-width="1.5"/>';
    svg.innerHTML = out;
    svg.querySelector('desc').textContent = 'Spending by day: ' + days.map(function (x) { return DOW[x.date.getDay()] + ' ' + fmtDate(x.date) + ' ' + money(x.amt, true); }).join(', ') + '. Usual is ' + money(o.usual) + ' a day.';
    rerun(svg);
  }

  // ---------------------------------------------------------------- Scenario Comparison (Explain: the path moves to the new numbers)
  function scenario(svg, s, opts) {
    opts = opts || {};
    var from = opts.from || [s.cur.slice(), s.cur.slice()];
    var target = [s.cur.slice(), s.wth.slice()];
    var dur = opts.duration === undefined ? ms('--dur-chart') : (reduced() ? 0 : opts.duration);
    tween(dur, function (k) {
      draw(svg, s, [lerp(from[0], target[0], k), lerp(from[1], target[1], k)], opts.desc);
    });
    return target;
  }
  function lerp(a, b, k) { return a.map(function (v, i) { return v + (b[i] - v) * k; }); }
  function draw(svg, s, vals, desc) {
    var X0 = 44, X1 = 300, YT = 18, YB = 168, span = diffDays(s.dates[s.dates.length - 1], s.today);
    var maxV = Math.max(Math.max.apply(null, vals[1]), Math.max.apply(null, vals[0]), 1000);
    var step = maxV > 4000 ? 2000 : maxV > 2000 ? 1000 : 500, top = Math.ceil(maxV / step) * step;
    var x = function (d) { return X0 + diffDays(d, s.today) / span * (X1 - X0); };
    var y = function (v) { return YB - v / top * (YB - YT); };
    function stepPath(arr) {
      var p = 'M' + x(s.dates[0]).toFixed(1) + ' ' + y(arr[0]).toFixed(1);
      for (var i = 1; i < arr.length; i++) p += 'H' + x(s.dates[i]).toFixed(1) + 'V' + y(arr[i]).toFixed(1);
      return p + 'H' + X1;
    }
    var out = '<desc></desc>';
    for (var v = 0; v <= top; v += step) {
      out += '<path class="s-rule" d="M' + X0 + ' ' + y(v) + 'H' + X1 + '" stroke-width="1"/>' +
        '<text class="f-ink2s" x="' + (X0 - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + (v >= 1000 ? '$' + (v / 1000) + 'k' : '$' + v) + '</text>';
    }
    var m = new Date(s.today.getFullYear(), s.today.getMonth() + 1, 1);
    while (m <= s.dates[s.dates.length - 1]) {
      out += '<text class="f-ink2s" x="' + x(m) + '" y="' + (YB + 18) + '" text-anchor="middle">' + MON[m.getMonth()] + '</text>';
      m = new Date(m.getFullYear(), m.getMonth() + 1, 1);
    }
    out += '<path class="s-ink" d="M' + X0 + ' ' + YB + 'H' + X1 + '" stroke-width="1.5"/>';
    out += '<path d="' + stepPath(vals[0]) + '" fill="none" class="s-ink2s" stroke-width="2" stroke-dasharray="5 4"/>';
    out += '<path d="' + stepPath(vals[1]) + '" fill="none" class="s-hull" stroke-width="3" stroke-linejoin="round"/>';
    var last = vals[1].length - 1;
    out += '<circle class="f-hull" cx="' + X1 + '" cy="' + y(vals[1][last]) + '" r="4.5"/>';
    out += '<text class="f-ink" x="' + (X1 + 8) + '" y="' + (y(vals[1][last]) + 4) + '" font-weight="600" style="font-variant-numeric:tabular-nums">' + money(Math.round(vals[1][last] / 10) * 10) + '</text>';
    if (Math.abs(y(vals[1][last]) - y(vals[0][last])) > 14) {
      out += '<text class="f-ink2s" x="' + (X1 + 8) + '" y="' + (y(vals[0][last]) + 4) + '" style="font-variant-numeric:tabular-nums">' + money(Math.round(vals[0][last] / 10) * 10) + '</text>';
    }
    svg.innerHTML = out;
    svg.querySelector('desc').textContent = desc || ('Step chart of projected savings to ' + fmtLong(s.dates[s.dates.length - 1]) + '. Current plan ' + money(s.cur[s.cur.length - 1]) + ', with the change ' + money(s.wth[s.wth.length - 1]) + '.');
  }

  // ---------------------------------------------------------------- Spending Insight bars (Explain: widths move from old to new values)
  // rows: [{ key, label, color, value, last, note }]. Builds once, then updates in place so CSS transitions run.
  function bars(box, rows, opts) {
    opts = opts || {};
    var max = 0;
    rows.forEach(function (r) { max = Math.max(max, r.value, r.last || 0); });
    if (!box._rows) {
      box.innerHTML = rows.map(function (r) {
        return '<button class="row cat-row" data-cat="' + esc(r.key) + '" aria-pressed="false" type="button">' +
          '<span class="name"><span class="cat-dot" style="background:' + r.color + '"></span>' + esc(r.label) + '</span>' +
          '<span class="val num" data-val="0">$0.00</span>' +
          '<span class="bar" aria-hidden="true"><i style="background:' + r.color + '"></i><s></s></span>' +
          '<span class="cmp"></span></button>';
      }).join('');
      box._rows = {};
      Array.prototype.forEach.call(box.querySelectorAll('.cat-row'), function (el) { box._rows[el.getAttribute('data-cat')] = el; });
      opts.reveal = true;
    }
    var dur = ms('--dur-chart');
    rows.forEach(function (r, i) {
      var row = box._rows[r.key]; if (!row) return;
      var bar = row.querySelector('i'), tick = row.querySelector('s'), val = row.querySelector('.val');
      row.setAttribute('aria-pressed', String(opts.selected === r.key));
      bar.style.background = opts.selected === r.key ? 'var(--data-highlight)' : (opts.selected ? 'var(--data-4)' : r.color);
      tick.style.display = r.last === undefined ? 'none' : '';
      tick.style.setProperty('--last', max ? (r.last || 0) / max : 0);
      if (opts.reveal) { row.style.setProperty('--w', 0); bar.style.transitionDelay = (i * 40) + 'ms'; }
      else bar.style.transitionDelay = '0ms';
      requestAnimationFrame(function () { requestAnimationFrame(function () { row.style.setProperty('--w', max ? r.value / max : 0); }); });
      var from = parseFloat(val.getAttribute('data-val')) || 0;
      val.setAttribute('data-val', r.value);
      tween(dur, function (k) { val.textContent = money(from + (r.value - from) * k, true); });
      row.querySelector('.cmp').textContent = r.note || '';
      row.setAttribute('aria-label', r.label + ', ' + money(r.value, true) + (r.note ? '. ' + r.note : '') + '.');
    });
  }

  window.KeelCharts = { timeline: timeline, week: week, scenario: scenario, bars: bars, money: money, fmtDate: fmtDate, fmtLong: fmtLong };
})();
