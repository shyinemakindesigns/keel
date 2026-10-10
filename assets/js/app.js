/* Keel app. One file, no build step.
   Sample data only. Every figure on screen is computed from the state below,
   so a change anywhere (a bill toggled, a category edited, money moved into a
   goal, a plan applied) shows up everywhere it should. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ================================================================ data
  var TODAY = new Date(2026, 9, 8);   // Thu Oct 8 2026, fixed so the dates always make sense
  var DAILY = 48;                     // usual day-to-day spending
  var LAST_PAYDAY = new Date(2026, 9, 2);
  var STORE = 'keel-demo-v2';
  var CATS = ['Groceries', 'Eating out', 'Getting around', 'Health', 'Everything else', 'Travel'];
  var CAT_COLOR = { 'Groceries': 'var(--data-1)', 'Eating out': 'var(--data-2)', 'Getting around': 'var(--data-3)', 'Health': 'var(--data-4)', 'Everything else': 'var(--data-5)', 'Travel': 'var(--data-5)' };
  // By this point in the previous stretch (its first 7 days). Sample data.
  var LAST = { 'Groceries': 98.20, 'Eating out': 52.10, 'Getting around': 41.00, 'Health': 0, 'Everything else': 33.50, 'Travel': 0 };

  function defaults() {
    return {
      checking: 1240,
      payday: '2026-10-16',
      cadence: 'Every two weeks',
      paycheck: 1980,
      bills: [
        { id: 'stream', name: 'Streaming', day: '2026-10-10', amt: 17, on: true },
        { id: 'phone', name: 'Phone', day: '2026-10-12', amt: 65, on: true },
        { id: 'net', name: 'Internet', day: '2026-10-14', amt: 70, on: true },
        { id: 'car', name: 'Car insurance', day: '2026-10-15', amt: 142, on: true },
        { id: 'gym', name: 'Gym', day: '2026-10-21', amt: 40, on: true },
        { id: 'rent', name: 'Rent', day: '2026-11-01', amt: 1450, on: true }
      ],
      tx: [
        { id: 't1', date: '2026-10-08', name: 'Corner Market', cat: 'Groceries', amt: 23.40 },
        { id: 't2', date: '2026-10-08', name: 'Metro fare', cat: 'Getting around', amt: 3.25 },
        { id: 't3', date: '2026-10-07', name: 'Hana Sushi', cat: 'Eating out', amt: 16.80 },
        { id: 't4', date: '2026-10-07', name: 'Fairway Pharmacy', cat: 'Health', amt: 12.15 },
        { id: 't5', date: '2026-10-06', name: 'Northside Grocer', cat: 'Groceries', amt: 61.20 },
        { id: 't6', date: '2026-10-05', name: 'Fuel stop', cat: 'Getting around', amt: 44.00 },
        { id: 't7', date: '2026-10-05', name: 'Dinner with Sam', cat: 'Eating out', amt: 38.50 },
        { id: 't8', date: '2026-10-04', name: 'Second Story Books', cat: 'Everything else', amt: 19.99 },
        { id: 't9', date: '2026-10-03', name: 'Harbor Coffee', cat: 'Eating out', amt: 5.25 },
        { id: 't10', date: '2026-10-03', name: 'Ace Hardware', cat: 'Everything else', amt: 27.60 },
        { id: 't11', date: '2026-10-02', name: 'Northside Grocer', cat: 'Groceries', amt: 54.30 }
      ],
      goals: [
        { id: 'car', name: 'Car repair fund', note: 'For the brakes, before winter', saved: 380, target: 1000, per: 50 }
      ]
    };
  }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(STORE)); if (s && s.bills && s.tx && s.goals) return s; } catch (e) {}
    return defaults();
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }
  var S = load();

  // ================================================================ helpers
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtDate(d) { return MON[d.getMonth()] + ' ' + d.getDate(); }
  function fmtLong(d) { return MON[d.getMonth()] + ' ' + d.getDate() + (d.getFullYear() !== 2026 ? ', ' + d.getFullYear() : ''); }
  function dayLabel(d) { return DOW[d.getDay()] + ', ' + fmtDate(d); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function diffDays(a, b) { return Math.round((a - b) / 86400000); }
  function same(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function money(n, cents) {
    var s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
    return (n < 0 ? '-$' : '$') + s;
  }
  function daysWord(n) {
    if (n === 1) return '1 day';
    if (n === 7) return 'a week';
    if (n === 14) return 'two weeks';
    return n + ' days';
  }
  function ordinal(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function reduced() { return window.keelMotion ? window.keelMotion.reduced() : window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function payday() { return parse(S.payday); }
  function announce(msg) { var a = $('#announce'); a.textContent = ''; setTimeout(function () { a.textContent = msg; }, 30); }
  function tween(from, to, dur, fn, ease) {
    if (reduced() || dur === 0) { fn(to); return; }
    var t0 = performance.now();
    ease = ease || function (t) { return 1 - Math.pow(1 - t, 3); };
    (function step(now) {
      var k = Math.min(1, (now - t0) / dur);
      fn(from + (to - from) * ease(k));
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  // --ease-standard, cubic-bezier(0.4, 0, 0.2, 1)
  function easeStandard(t) {
    var lo = 0, hi = 1, m = t;
    for (var i = 0; i < 18; i++) { m = (lo + hi) / 2; var u = 1 - m, x = 3 * u * u * m * 0.4 + 3 * u * m * m * 0.2 + m * m * m; if (x < t) lo = m; else hi = m; }
    var v = 1 - m; return 3 * v * m * m + m * m * m + 0 * v;
  }
  function cssMs(name) { var v = getComputedStyle(document.documentElement).getPropertyValue(name); return reduced() ? 0 : (parseFloat(v) || 0); }

  // ================================================================ the reading
  // "Steady through" = the last day your money covers your bills and your usual
  // spending if nothing else came in. Payday is ignored on purpose: the reading
  // answers "how much room do I have", not "what's my balance".
  function reading(extraSpend) {
    var bal = S.checking - (extraSpend || 0);
    var bills = S.bills.filter(function (b) { return b.on; });
    var through = null, shortOn = null;
    for (var i = 0; i < 90; i++) {
      var day = addDays(TODAY, i);
      var due = bills.filter(function (b) { return same(parse(b.day), day); });
      var dueAmt = due.reduce(function (s, b) { return s + b.amt; }, 0);
      var next = bal - DAILY - dueAmt;
      if (next < 0) { through = addDays(day, -1); shortOn = due.length ? due[0] : null; break; }
      bal = next;
    }
    if (!through) through = addDays(TODAY, 89);
    var pd = payday(), toPay = diffDays(pd, TODAY);
    var billsBefore = bills.filter(function (b) { return parse(b.day) < pd; });
    var billsBeforeAmt = billsBefore.reduce(function (s, b) { return s + b.amt; }, 0);
    return {
      through: through, margin: diffDays(through, pd), shortBill: shortOn,
      billsBefore: billsBefore, billsBeforeAmt: billsBeforeAmt,
      landing: S.checking - (extraSpend || 0) - billsBeforeAmt - DAILY * toPay
    };
  }

  // ================================================================ Equilibrium Indicator
  // Web implementation of the Rive spec (docs/motion-system/rive-spec.md).
  // Inputs, named as they would be in the state machine:
  //   steadinessValue (number, days past payday, 0-14)   isInteracting (bool: a preview is showing)
  //   isLoading (bool)                                     hasUpdated (trigger)
  // The waterline is payday. The keel hangs below it: its depth is how many
  // days past payday your money would still cover you.
  var KV = { x: 120, top: 38, zero: 40, perDay: 7, maxDays: 14 };
  function depthFor(margin) { return Math.max(0.4, Math.min(KV.maxDays, margin)); }
  function yFor(days) { return KV.zero + days * KV.perDay; }
  function finPath(days) { return 'M' + (KV.x - 5) + ' ' + KV.top + 'h10l-2 ' + (yFor(days) - KV.top) + 'h-6z'; }
  function drawTicks() {
    var out = '<path class="s-ink2s" d="M226 ' + KV.zero + 'V' + yFor(14) + '" stroke-width="1"/>';
    [[0, 'Payday'], [3, '+3 days'], [7, '+1 week'], [14, '+2 weeks']].forEach(function (t) {
      var y = yFor(t[0]);
      out += '<path class="s-ink2s" d="M220 ' + y + 'h6" stroke-width="1"/>' +
        '<text x="234" y="' + (y + 4) + '"' + (t[0] === 0 ? ' class="f-ink" font-weight="600"' : '') + '>' + t[1] + '</text>';
    });
    $('#kv-ticks').innerHTML = out;
  }
  var kvCurrent = null, kvRaf = null;
  function setKeel(days, instant) {
    if (kvCurrent === null || instant || reduced()) { cancelAnimationFrame(kvRaf); kvCurrent = days; renderKeel(days); return; }
    // A damped spring: the keel finds its new depth and settles in about 900ms.
    // Damping ratio 0.9, so any overshoot is about 0.2%: no visible bounce. The one physical object in the UI.
    cancelAnimationFrame(kvRaf);
    var x = kvCurrent, v = 0, k = 70, c = 15, last = performance.now();
    kvCurrent = days;
    (function step(now) {
      var dt = Math.min(0.032, Math.max(0, (now - last) / 1000)); last = now;
      var a = -k * (x - days) - c * v; v += a * dt; x += v * dt;
      renderKeel(x);
      if (Math.abs(x - days) > 0.01 || Math.abs(v) > 0.01) kvRaf = requestAnimationFrame(step);
      else renderKeel(days);
    })(last);
  }
  function renderKeel(days) {
    $('#kv-fin').setAttribute('d', finPath(days));
    $('#kv-bulb').setAttribute('cy', yFor(days) + 1);
  }
  var baseDepth = null;
  function setPreview(days, label) {
    var g = $('#kv-ghost');
    if (days === null) { g.setAttribute('opacity', '0'); setKeel(baseDepth); return; }
    var y = yFor(baseDepth);
    $('#kv-ghost-fin').setAttribute('d', finPath(baseDepth) + ' M' + (KV.x - 13) + ' ' + (y + 1) + 'a13 5.5 0 1 0 26 0a13 5.5 0 1 0 -26 0');
    $('#kv-ghost-label').setAttribute('y', y + 5);
    var ny = yFor(days), lbl = $('#kv-new-label');
    lbl.textContent = label; lbl.setAttribute('y', ny + 5);
    $('#kv-ghost-label').style.display = Math.abs(ny - y) < 14 ? 'none' : '';
    g.setAttribute('opacity', '1');
    setKeel(days);
  }
  window.keelEquilibrium = {
    inputs: { steadinessValue: 0, isInteracting: false, isLoading: false },
    set: function (name, value) {
      this.inputs[name] = value;
      if (name === 'steadinessValue') { baseDepth = depthFor(value); if (!this.inputs.isInteracting) setKeel(baseDepth); }
      if (name === 'isInteracting' && !value) setPreview(null);
      if (name === 'isLoading') $('#keelviz').style.opacity = value ? 0.5 : '';
    },
    fire: function (trigger) { if (trigger === 'hasUpdated') renderHome(); }
  };

  // ================================================================ home
  var paceIntroDone = false;
  function renderHome() {
    var r = reading(0), steady = r.margin >= 0, pd = payday();
    $('#r-kicker').textContent = steady ? 'You’re steady through' : 'You’re covered through';
    $('#r-date').textContent = fmtDate(r.through);
    $('#r-sub').innerHTML = steady
      ? '<b>' + daysWord(r.margin) + ' past</b> your next payday on ' + fmtDate(pd) + '. Your bills before then are already set aside.'
      : 'That’s <b>' + daysWord(-r.margin) + ' before</b> payday on ' + fmtDate(pd) + '. One change usually covers it; see Coming up below.';
    $('#kv-desc').textContent = 'Keel depth: covered ' + daysWord(Math.abs(r.margin)) + (steady ? ' past' : ' before') + ' payday.';
    $('#f-bills').textContent = money(r.billsBeforeAmt);
    $('#f-landing').textContent = r.landing >= 0 ? 'about ' + money(Math.round(r.landing / 5) * 5) : 'short ' + money(Math.round(-r.landing / 5) * 5);
    window.keelEquilibrium.inputs.steadinessValue = r.margin;
    baseDepth = depthFor(r.margin);
    var pending = parseFloat(($('#wi-amt').value || '').replace(/[^0-9.]/g, ''));
    if ($('#wi-result').textContent && pending > 0) runWhatIf(pending); else setKeel(baseDepth);

    var up = S.bills.filter(function (b) { return b.on; }).sort(function (a, b) { return parse(a.day) - parse(b.day); }).slice(0, 5);
    var nextBill = up.filter(function (b) { return parse(b.day) >= TODAY; })[0];
    $('#upcoming').innerHTML = up.map(function (b) {
      var d = parse(b.day), covered = d <= r.through;
      return '<div class="row"><div class="bill-when"><b>' + d.getDate() + '</b><small>' + MON[d.getMonth()] + '</small></div>' +
        '<div class="grow"><div class="title">' + esc(b.name) + (b === nextBill ? '<span class="next-flag">Next</span>' : '') + '</div><div class="tag">' + (covered ? 'Set aside' : 'After your reading, comes from your next paycheck') + '</div></div>' +
        '<div class="amt">' + money(b.amt) + '</div></div>';
    }).join('');
    var allCovered = up.every(function (b) { return parse(b.day) <= r.through || parse(b.day) >= pd; });
    $('#upcoming-sub').textContent = allCovered ? 'covered by this paycheck or the next' : '';
    renderTimeline(nextBill);
    renderPace();
  }

  // ---------------------------------------------------------------- Upcoming Expenses timeline (SVG, data-bound: keel-charts.js)
  function renderTimeline(nextBill) {
    KeelCharts.timeline($('#timeline'), {
      today: TODAY, payday: payday(), span: 24,
      bills: S.bills.filter(function (b) { return b.on; }).sort(function (a, b) { return parse(a.day) - parse(b.day); })
        .map(function (b) { return { name: b.name, date: parse(b.day), amt: b.amt, next: b === nextBill }; })
    });
  }

  // ---------------------------------------------------------------- Spending pace (Lottie 02, progress-mapped)
  function pace() {
    var spent = S.tx.reduce(function (s, t) { return s + t.amt; }, 0);
    var days = diffDays(TODAY, LAST_PAYDAY) + 1, usual = DAILY * days, ratio = spent / usual;
    return { spent: spent, days: days, usual: usual, ratio: ratio, progress: Math.max(0, Math.min(1, ratio - 0.5)) };
  }
  function renderPace() {
    var p = pace(), diff = Math.round(p.usual - p.spent);
    var text = Math.abs(diff) < 10
      ? 'You’ve spent <b>' + money(p.spent) + '</b> in ' + p.days + ' days, right around your usual pace.'
      : 'You’ve spent <b>' + money(p.spent) + '</b> in ' + p.days + ' days. Your usual pace would be about ' + money(p.usual) + ', so you’re running <b>' + money(Math.abs(diff)) + (diff > 0 ? ' lighter' : ' heavier') + '</b> than usual.' + (diff < 0 ? ' Your reading already counts it.' : '');
    $('#pace-read').innerHTML = text;
    var el = $('#pace-lottie');
    el.setAttribute('label', 'Spending pace marker at ' + Math.round(p.ratio * 100) + ' percent of your usual pace.');
    el.setAttribute('aria-label', el.getAttribute('label'));
    el.ready.then(function (a) {
      if (!paceIntroDone && !reduced()) {
        paceIntroDone = true;
        a.playSegments([0, 36], true);
        setTimeout(function () { el.scrubTo(p.progress, { from: 36, to: 136, duration: 900 }); }, 620);
      } else {
        paceIntroDone = true;
        el.scrubTo(p.progress, { from: 36, to: 136, duration: cssMs('--dur-chart') });
      }
    });
  }

  // ---------------------------------------------------------------- purchase check
  function runWhatIf(amount) {
    var res = $('#wi-result');
    if (!(amount > 0)) { res.textContent = 'Enter an amount to see how it would move your reading.'; setPreview(null); return; }
    var base = reading(0), r = reading(amount), line;
    if (r.margin >= 0) {
      line = 'With ' + money(amount) + ' spent today, you’d be steady through <b>' + fmtDate(r.through) + '</b>, ' + daysWord(r.margin) + ' past payday. ' +
        (diffDays(base.through, r.through) > 0 ? 'That’s ' + daysWord(diffDays(base.through, r.through)) + ' less room than now.' : 'Your reading wouldn’t change.');
    } else {
      line = 'With ' + money(amount) + ' spent today, you’d be covered through <b>' + fmtDate(r.through) + '</b>, ' + daysWord(-r.margin) + ' before payday.' +
        (r.shortBill ? ' ' + esc(r.shortBill.name) + ' (' + money(r.shortBill.amt) + ') on ' + fmtDate(parse(r.shortBill.day)) + ' is the first bill it would reach.' : ' Your usual spending would run past what’s left.');
    }
    res.innerHTML = line;
    window.keelEquilibrium.inputs.isInteracting = true;
    setPreview(depthFor(r.margin), 'With ' + money(amount));
    $('#wi-clear').hidden = false;
  }

  // ================================================================ onboarding
  function renderAccounts() {
    $('#acct-checking').textContent = money(S.checking, true);
    var car = S.goals.filter(function (g) { return g.id === 'car'; })[0];
    $('#acct-goal').textContent = money(car ? car.saved : 0, true);
  }
  function renderBillToggles() {
    $('#bill-toggles').innerHTML = S.bills.map(function (b) {
      return '<div class="row"><div class="grow"><div class="title" id="bl-' + b.id + '">' + esc(b.name) + '</div><div class="meta">' + money(b.amt) + ' around the ' + ordinal(parse(b.day).getDate()) + '</div></div>' +
        '<button class="switch" role="switch" aria-checked="' + b.on + '" aria-labelledby="bl-' + b.id + '" data-bill="' + b.id + '"></button></div>';
    }).join('');
  }
  function renderPaydayChips() {
    var opts = [new Date(2026, 9, 9), new Date(2026, 9, 15), new Date(2026, 9, 16), new Date(2026, 9, 23)], pd = payday();
    $('#payday-chips').innerHTML = opts.map(function (d) {
      return '<button class="chip" aria-pressed="' + same(d, pd) + '" data-payday="' + iso(d) + '">' + dayLabel(d) + '</button>';
    }).join('');
    $('#cadence-chips').innerHTML = ['Weekly', 'Every two weeks', 'Twice a month', 'Monthly'].map(function (c) {
      return '<button class="chip" aria-pressed="' + (c === S.cadence) + '" data-cadence="' + c + '">' + c + '</button>';
    }).join('');
  }
  // Onboarding Transition (Lottie 13): one object, one segment per step.
  var ONB = { accounts: 60, bills: 120, payday: 180, taking: 240 };
  var onbAt = null;   // frame the art is resting on
  function onboardArt(name) {
    var art = $('#onb-art'), el = $('#onb-lottie');
    var inFlow = name in ONB;
    var wide = window.matchMedia('(min-width: 900px)').matches;
    art.classList.toggle('on', inFlow && (name !== 'taking' || wide));
    if (!inFlow) { onbAt = null; return; }
    var to = ONB[name];
    if (onbAt === null) {
      var from = to - 60;
      if (reduced()) el.goTo(to); else el.ready.then(function () { el.goTo(from).then(function () { el.playSegment(from, to); }); });
    } else if (onbAt !== to) {
      el.playSegment(onbAt, to);   // backwards when onbAt > to
    }
    onbAt = to;
  }

  // ================================================================ spending
  var activeCat = null, txSaved = false;
  function totals(list) { var t = {}; CATS.forEach(function (c) { t[c] = 0; }); list.forEach(function (x) { t[x.cat] += x.amt; }); return t; }
  function renderSpending() {
    var tot = totals(S.tx);
    // Spending Insight (SVG/HTML, data-bound: keel-charts.js)
    KeelCharts.bars($('#cats'), CATS.map(function (c) {
      var v = tot[c], last = LAST[c], d = v - last;
      return { key: c, label: c, color: CAT_COLOR[c], value: v, last: last,
        note: (v === 0 && last === 0) ? 'None yet this stretch' : Math.abs(d) < 5 ? 'About the same as last stretch'
          : money(Math.abs(d)) + (d > 0 ? ' more' : ' less') + ' than by this point last stretch' };
    }), { selected: activeCat });
    renderWeek();
    renderTx();
  }
  function renderWeek() {
    var days = [];
    for (var i = 0; i < 7; i++) {
      var d = addDays(LAST_PAYDAY, i);
      days.push({ date: d, amt: S.tx.filter(function (t) { return t.date === iso(d); }).reduce(function (s, t) { return s + t.amt; }, 0) });
    }
    KeelCharts.week($('#week'), { days: days, usual: DAILY, today: TODAY });
    $('#wk-sub').textContent = money(days.reduce(function (s, x) { return s + x.amt; }, 0)) + ' total';
  }
  function renderTx() {
    var list = S.tx.filter(function (t) { return !activeCat || t.cat === activeCat; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    $('#tx-sub').textContent = activeCat ? activeCat : 'all categories';
    var box = $('#tx-list');
    if (!list.length) {
      box.innerHTML = '<div class="empty-state"><keel-lottie name="empty" trigger="inview" poster="end" label="A small ember resting on an empty platform."></keel-lottie>' +
        '<h3>Nothing in ' + esc(activeCat) + ' yet</h3><p>When there is, it’ll land here. Nothing’s wrong; this stretch just didn’t need it.</p></div>';
      return;
    }
    var html = '', lastDay = null, open = false;
    list.forEach(function (t) {
      if (t.date !== lastDay) {
        if (open) html += '</div>';
        html += '<p class="day-head">' + dayLabel(parse(t.date)) + '</p><div class="rows">';
        open = true; lastDay = t.date;
      }
      html += '<button class="row" data-tx="' + t.id + '"><span class="cat-dot" style="background:' + CAT_COLOR[t.cat] + '"></span><span class="grow"><span class="title" style="display:block">' + esc(t.name) + '</span><span class="meta">' + t.cat + '</span></span><span class="amt">' + money(t.amt, true) + '</span></button>';
    });
    if (open) html += '</div>';
    box.innerHTML = html;
  }
  function weightPhrase(amt) {
    var d = amt / DAILY;
    // Each phrase completes "… of your usual spending". $16.80 at $48 a day is 0.35: about a third of a day.
    return d < 0.2 ? 'a small slice of a day' : d < 0.42 ? 'about a third of a day' : d < 0.75 ? 'about half a day' : d < 1.5 ? 'about a day' : d < 2.5 ? 'about two days' : 'about ' + Math.round(d) + ' days';
  }
  function txSheet(id) {
    var t = S.tx.filter(function (x) { return x.id === id; })[0]; if (!t) return;
    openSheet('<h2 id="sheet-h">' + esc(t.name) + '</h2><p class="meta" style="margin-bottom:14px">' + dayLabel(parse(t.date)) + ' · ' + money(t.amt, true) + '</p>' +
      '<p class="lede"><b style="color:var(--ink)">' + money(t.amt, true) + '</b> is ' + weightPhrase(t.amt) + ' of your usual spending. It’s already counted in your reading.</p>' +
      '<form id="cat-form"><fieldset><legend>Category</legend><div class="chips">' + CATS.map(function (c) {
        return '<label class="radio-chip"><input type="radio" name="cat" value="' + c + '"' + (c === t.cat ? ' checked' : '') + '><span class="chip">' + c + '</span></label>';
      }).join('') + '</div></fieldset>' +
      '<div class="foot"><button class="btn btn-primary btn-block" type="submit">Save category</button><button class="btn-text" type="button" data-close>Cancel</button></div></form>');
    $('#cat-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var c = new FormData(this).get('cat');
      if (c === t.cat) { closeSheet(); return; }
      t.cat = c; save(); txSaved = true;
      // Transaction Update (Lottie 06): quick confirmation, then the bars move behind the sheet
      $('#sheet-body').innerHTML = '<keel-lottie class="done-art" name="check" poster="end" label=""></keel-lottie>' +
        '<h2 id="sheet-h" style="text-align:center;margin-top:6px">Moved to ' + esc(c) + '</h2>' +
        '<p class="lede" style="text-align:center">Your reading doesn’t change: the money was already counted.</p>' +
        '<div class="foot"><button class="btn btn-quiet btn-block" data-close>Done</button></div>';
      var ck = $('#sheet-body keel-lottie'); ck.replay();
      $('#sheet-body [data-close]').focus();
      announce(t.name + ' moved to ' + c + '.');
    });
  }

  // ================================================================ goals
  var goalCards = {};
  function estimate(g, perOverride) {
    var per = perOverride === undefined ? g.per : perOverride;
    if (g.saved >= g.target) return { done: true };
    if (!per) return { none: true };
    var n = Math.ceil((g.target - g.saved) / per);
    return { date: addDays(payday(), 14 * (n - 1)), paychecks: n };
  }
  function goalEstimateText(g) {
    var e = estimate(g);
    if (e.done) return 'Funded. Nice and steady.';
    if (e.none) return 'No regular amount yet.';
    return money(g.per) + ' each paycheck · done around ' + fmtLong(e.date);
  }
  function renderGoals(opts) {
    opts = opts || {};
    var list = $('#goal-list');
    S.goals.forEach(function (g) {
      var card = goalCards[g.id];
      if (!card || !card.isConnected) {
        card = document.createElement('article');
        card.className = 'panel card goal' + (opts.fresh === g.id ? ' goal-new' : '');
        card.setAttribute('aria-labelledby', 'gh-' + g.id);
        card.innerHTML = '<h2 id="gh-' + g.id + '">' + esc(g.name) + '</h2><p class="meta">' + esc(g.note) + '</p>' +
          '<keel-lottie class="progress" name="goal" poster="start" label="Goal progress"></keel-lottie>' +
          '<div class="nums"><div><b class="g-saved">$0</b><div class="meta">saved</div></div><div style="text-align:right"><b>' + money(g.target) + '</b><div class="meta">goal</div></div></div>' +
          '<p class="est"></p>' +
          '<div class="actions"><button class="btn btn-quiet" data-goal-add="' + g.id + '">Add money</button></div>' +
          '<div class="confirm" aria-live="polite"><keel-lottie name="complete" poster="end" label=""></keel-lottie><span></span></div>';
        list.appendChild(card);
        goalCards[g.id] = card;
        card._shown = 0;
        if (opts.fresh === g.id) { void card.offsetWidth; card.classList.add('in'); }
      }
      updateGoal(g, card);
    });
  }
  function updateGoal(g, card) {
    var p = Math.min(1, g.saved / g.target), lot = $('keel-lottie.progress', card);
    lot.setAttribute('aria-label', 'Progress: ' + money(g.saved) + ' of ' + money(g.target) + ' saved, ' + Math.round(p * 100) + ' percent.');
    $('.est', card).textContent = goalEstimateText(g);
    var from = card._shown || 0;
    tween(from, g.saved, reduced() ? 0 : 900, function (x) { $('.g-saved', card).textContent = money(Math.round(x)); });
    card._shown = g.saved;
    // Goal Progress (Lottie 05, progress-mapped): frames 0-200 are linear in progress
    lot.scrubTo(p, { from: 0, to: 200, duration: reduced() ? 0 : 900 }).then(function () {
      if (p >= 1) lot.playSegment(200, 259);
    });
  }
  function showConfirm(box, text) {
    $('span', box).textContent = text;
    box.classList.add('on');
    $('keel-lottie', box).replay();
    clearTimeout(box._t);
    box._t = setTimeout(function () { box.classList.remove('on'); }, 4000);
  }
  var pendingAdd = 50;
  function addSheet(id) {
    var g = S.goals.filter(function (x) { return x.id === id; })[0]; if (!g) return;
    pendingAdd = Math.min(50, Math.max(25, g.target - g.saved));
    function body() {
      var now = reading(0), after = reading(pendingAdd);
      return '<h2 id="sheet-h">Add to ' + esc(g.name) + '</h2>' +
        '<div class="chips" style="margin:14px 0 16px" role="group" aria-label="Amount">' + [25, 50, 100].map(function (a) {
          return '<button class="chip" aria-pressed="' + (a === pendingAdd) + '" data-add="' + a + '">' + money(a) + '</button>';
        }).join('') + '</div>' +
        '<p class="lede" aria-live="polite">' + (same(now.through, after.through)
          ? 'Your reading stays at <b style="color:var(--ink)">' + fmtDate(now.through) + '</b>.'
          : 'Your reading would move from ' + fmtDate(now.through) + ' to <b style="color:var(--ink)">' + fmtDate(after.through) + '</b>, ' + (after.margin >= 0 ? 'still ' + daysWord(after.margin) + ' past payday.' : daysWord(-after.margin) + ' before payday.')) + '</p>' +
        '<div class="foot"><button class="btn btn-primary btn-block" data-confirm-add>Move ' + money(pendingAdd) + ' to this goal</button><button class="btn-text" data-close>Not now</button></div>';
    }
    openSheet(body());
    $('#sheet-body').onclick = function (e) {
      var a = e.target.closest('[data-add]');
      if (a) { pendingAdd = +a.getAttribute('data-add'); $('#sheet-body').innerHTML = body(); $('[data-add="' + pendingAdd + '"]').focus(); return; }
      if (e.target.closest('[data-confirm-add]')) {
        S.checking -= pendingAdd; g.saved += pendingAdd; save();
        closeSheet();
        var card = goalCards[g.id];
        updateGoal(g, card);
        var r = reading(0);
        showConfirm($('.confirm', card), 'Added ' + money(pendingAdd) + '. Steady through ' + fmtDate(r.through) + '.');
        announce('Added ' + money(pendingAdd) + ' to ' + g.name + '.');
        renderHome();
      }
      if (e.target.closest('[data-close]')) closeSheet();
    };
  }
  function newGoalSheet() {
    var draft = { name: '', target: 1000, per: 50 };
    function est() {
      var n = Math.ceil(draft.target / draft.per);
      return 'At ' + money(draft.per) + ' a paycheck, you’d get there around <b style="color:var(--ink)">' + fmtLong(addDays(payday(), 14 * (n - 1))) + '</b>. It starts with your next paycheck, so today’s reading doesn’t move.';
    }
    openSheet('<h2 id="sheet-h">New goal</h2><form id="goal-form" novalidate>' +
      '<label class="lbl" for="ng-name">What’s it for?</label>' +
      '<div class="field text"><input id="ng-name" name="name" autocomplete="off" placeholder="Winter coat" aria-describedby="ng-err"></div>' +
      '<p class="meta" id="ng-err" role="alert" style="color:var(--negative);margin-top:6px"></p>' +
      '<fieldset><legend>Target</legend><div class="chips">' + [500, 1000, 2500].map(function (v) {
        return '<label class="radio-chip"><input type="radio" name="target" value="' + v + '"' + (v === draft.target ? ' checked' : '') + '><span class="chip">' + money(v) + '</span></label>';
      }).join('') + '</div></fieldset>' +
      '<fieldset><legend>Each paycheck</legend><div class="chips">' + [25, 50, 100].map(function (v) {
        return '<label class="radio-chip"><input type="radio" name="per" value="' + v + '"' + (v === draft.per ? ' checked' : '') + '><span class="chip">' + money(v) + '</span></label>';
      }).join('') + '</div></fieldset>' +
      '<p class="lede" id="ng-est" style="margin-top:16px;font-size:15px" aria-live="polite">' + est() + '</p>' +
      '<div class="foot"><button class="btn btn-primary btn-block" type="submit">Set this goal</button><button class="btn-text" type="button" data-close>Cancel</button></div></form>');
    var f = $('#goal-form');
    f.addEventListener('change', function () {
      var fd = new FormData(f); draft.target = +fd.get('target'); draft.per = +fd.get('per');
      $('#ng-est').innerHTML = est();
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#ng-name').value.trim();
      if (!name) {
        $('#ng-err').textContent = 'Give it a name so you’ll recognize it.';
        $('#ng-name').setAttribute('aria-invalid', 'true'); $('#ng-name').focus(); return;
      }
      var g = { id: 'g' + Date.now(), name: name, note: 'Set ' + fmtDate(TODAY), saved: 0, target: draft.target, per: draft.per };
      S.goals.push(g); save();
      // Goal Created (Lottie 08)
      $('#sheet-body').innerHTML = '<keel-lottie class="made-art" name="goal-created" poster="end" label="Blocks assemble into a small structure with an ember cap."></keel-lottie>' +
        '<h2 id="sheet-h" style="text-align:center">' + esc(name) + ' is set</h2>' +
        '<p class="lede" style="text-align:center">The first ' + money(g.per) + ' goes in on ' + fmtDate(payday()) + '.</p>' +
        '<div class="foot"><button class="btn btn-quiet btn-block" data-close data-fresh="' + g.id + '">See it in Goals</button></div>';
      $('#sheet-body keel-lottie').replay();
      $('#sheet-body [data-close]').focus();
      announce(name + ' goal created.');
      freshGoal = g.id;
    });
  }
  var freshGoal = null;

  // ================================================================ plan (Scenario Comparison, SVG data-bound)
  var planShown = null;   // [current[], with[]] currently drawn, for transitions
  function planSeries(extra) {
    var saved0 = S.goals.reduce(function (s, g) { return s + g.saved; }, 0);
    var per = S.goals.reduce(function (s, g) { return s + g.per; }, 0);
    var pts = [], cur = [], wth = [];
    for (var k = 0; k < 13; k++) pts.push(addDays(payday(), 14 * k));
    cur.push(saved0); wth.push(saved0);
    pts.forEach(function (d, k) { cur.push(saved0 + per * (k + 1)); wth.push(saved0 + (per + extra) * (k + 1)); });
    return { dates: [TODAY].concat(pts), cur: cur, wth: wth, per: per };
  }
  function renderPlan(animate) {
    var extra = +$('#pl-extra').value;
    $('#pl-out').textContent = money(extra);
    var car = S.goals.filter(function (g) { return g.id === 'car'; })[0];
    $('#pl-help').textContent = 'On top of the ' + money(car ? car.per : 0) + ' already going to Car repair fund. Pay arrives every two weeks.';
    var s = planSeries(extra), N = s.cur.length;
    // Scenario Comparison (SVG, data-bound: keel-charts.js)
    planShown = KeelCharts.scenario($('#scenario'), { today: TODAY, dates: s.dates, cur: s.cur, wth: s.wth },
      { from: planShown, duration: animate ? undefined : 0 });
    // readouts
    var end = s.dates[N - 1];
    var curEst = car ? estimate(car) : null, newEst = car ? estimate(car, car.per + extra) : null;
    var r = reading(0), items = [];
    if (extra === 0) {
      items.push('By ' + fmtLong(end) + ', your goals would hold about <b>' + money(s.cur[N - 1]) + '</b> on the current plan.');
      items.push('Move the slider to compare a different amount.');
    } else {
      items.push('By ' + fmtLong(end) + ': <b>' + money(s.wth[N - 1]) + '</b> set aside instead of ' + money(s.cur[N - 1]) + '.');
      if (curEst && newEst && newEst.date && curEst.date) items.push('Car repair fund done around <b>' + fmtLong(newEst.date) + '</b> instead of ' + fmtLong(curEst.date) + '.');
      items.push('Between paydays you’d have about <b>' + money(extra / 14, true) + ' a day</b> less to spend.');
      items.push('Today’s reading stays at <b>' + fmtDate(r.through) + '</b>.');
    }
    $('#pl-read').innerHTML = items.map(function (t) { return '<li>' + t + '</li>'; }).join('');
    $('#pl-apply').disabled = extra === 0;
    // accessible table
    var rows = '<caption>Projected savings, current plan and with ' + money(extra) + ' more each paycheck</caption><tr><th scope="col">Date</th><th scope="col">Current plan</th><th scope="col">With the change</th></tr>';
    for (var i = 0; i < N; i += 2) rows += '<tr><th scope="row">' + fmtLong(s.dates[i]) + '</th><td>' + money(s.cur[i]) + '</td><td>' + money(s.wth[i]) + '</td></tr>';
    $('#sc-table').innerHTML = rows;
  }
  // ================================================================ sheet
  var lastFocus = null;
  function openSheet(html) {
    lastFocus = document.activeElement;
    $('#sheet-body').innerHTML = html;
    $('#sheet-body').onclick = function (e) { if (e.target.closest('[data-close]')) closeSheet(e.target.closest('[data-close]')); };
    var s = $('#sheet'); s.hidden = false;
    $$('#main, #tabbar, #onb-art').forEach(function (el) { el.inert = true; });   // focus stays in the dialog
    void s.offsetWidth; s.classList.add('on'); $('#scrim').classList.add('on');
    setTimeout(function () { var f = s.querySelector('input[type=radio]:checked, input:not([type=radio]), button'); if (f) f.focus(); }, 60);
  }
  function closeSheet(btn) {
    var s = $('#sheet'); s.classList.remove('on'); $('#scrim').classList.remove('on');
    $$('#main, #tabbar, #onb-art').forEach(function (el) { el.inert = false; });
    setTimeout(function () { s.hidden = true; $('#sheet-body').innerHTML = ''; }, cssMs('--dur-move'));
    if (lastFocus && lastFocus.isConnected) lastFocus.focus();
    if (txSaved) { txSaved = false; renderSpending(); }
    if (freshGoal) { var id = freshGoal; freshGoal = null; renderGoals({ fresh: id }); if (current !== 'goals') go('goals'); }
  }
  $('#scrim').addEventListener('click', function () { closeSheet(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#sheet').classList.contains('on')) closeSheet(); });

  // ================================================================ navigation
  var current = null;
  var TABS = { home: 1, spending: 1, goals: 1, plan: 1 };
  function placeIndicator() {
    var b = $('#tabbar [aria-current="page"]'), ind = $('#tab-ind');
    if (!b) return;
    ind.style.setProperty('--tx', (b.offsetLeft + b.offsetWidth / 2 - 11 - 8) + 'px');
    ind.style.setProperty('--ty', (b.offsetTop + (b.offsetHeight - 28) / 2) + 'px');
  }
  function go(name, opts) {
    if (name === 'activity') name = 'spending';
    if (name === current) return;
    var next = $('[data-screen="' + name + '"]'); if (!next) return;
    var prev = current && $('[data-screen="' + current + '"]');
    if (prev) { prev.classList.remove('in'); prev.classList.remove('shown'); }
    next.classList.add('shown'); next.scrollTop = 0;
    void next.offsetWidth; next.classList.add('in');
    current = name;
    $('#tabbar').classList.toggle('on', !!TABS[name]);
    $$('#tabbar [data-tab]').forEach(function (b) { if (b.getAttribute('data-tab') === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    placeIndicator();
    onboardArt(name);
    if (name === 'welcome') { var w = $('#welcome-lottie'); if (reduced()) w.stop(); else w.replay(); }
    if (name === 'accounts') renderAccounts();
    if (name === 'taking') runTaking();
    if (name === 'home') { if (opts && opts.fromTaking) kvCurrent = 0.6; renderHome(); }
    if (name === 'spending') renderSpending();
    if (name === 'goals') renderGoals();
    if (name === 'plan') renderPlan(false);
    if (!(opts && opts.silent)) { var h = next.querySelector('h1, h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    try { parent.postMessage({ keel: 'screen', name: name }, '*'); } catch (e) {}
  }
  var takingTimer = null;
  function runTaking() {
    var el = $('[data-screen="taking"]');
    el.classList.remove('run'); void el.offsetWidth; el.classList.add('run');
    clearTimeout(takingTimer);
    takingTimer = setTimeout(function () { go('home', { fromTaking: true }); }, reduced() ? 600 : 2300);
  }

  // ================================================================ theme, motion, reset
  function setTheme(t) {
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
    document.dispatchEvent(new Event('keel-theme'));
  }
  function setMotion(m) {
    if (m === 'reduced') document.documentElement.setAttribute('data-motion', 'reduced');
    else document.documentElement.removeAttribute('data-motion');
  }
  function resetDemo() {
    try { localStorage.removeItem(STORE); } catch (e) {}
    S = defaults();
    $('#goal-list').innerHTML = ''; goalCards = {};
    $('#cats')._rows = null; activeCat = null; planShown = null; $('#pl-extra').value = 0;
    $('#wi-amt').value = ''; $('#wi-result').textContent = ''; $('#wi-clear').hidden = true;
    $('#kv-ghost').setAttribute('opacity', '0');
    renderBillToggles(); renderPaydayChips(); renderAccounts();
    var c = current; current = null; go(c || 'home', { silent: true });
    announce('Sample data reset.');
  }

  // ================================================================ events
  document.addEventListener('click', function (e) {
    var t;
    if (e.target.closest('#sheet')) return;   // the sheet handles its own clicks
    if ((t = e.target.closest('[data-reset]'))) resetDemo();
    else if ((t = e.target.closest('[data-go]'))) go(t.getAttribute('data-go'));
    else if ((t = e.target.closest('[data-tab]'))) go(t.getAttribute('data-tab'));
    else if ((t = e.target.closest('[data-bill]'))) {
      var b = S.bills.filter(function (x) { return x.id === t.getAttribute('data-bill'); })[0];
      b.on = !b.on; t.setAttribute('aria-checked', b.on); save();
    }
    else if ((t = e.target.closest('[data-payday]'))) { S.payday = t.getAttribute('data-payday'); save(); renderPaydayChips(); $('[data-payday="' + S.payday + '"]').focus(); }
    else if ((t = e.target.closest('[data-cadence]'))) { S.cadence = t.getAttribute('data-cadence'); save(); renderPaydayChips(); $('[data-cadence="' + S.cadence + '"]').focus(); }
    else if ((t = e.target.closest('[data-cat]'))) { var c = t.getAttribute('data-cat'); activeCat = activeCat === c ? null : c; renderSpending(); }
    else if ((t = e.target.closest('[data-tx]'))) txSheet(t.getAttribute('data-tx'));
    else if ((t = e.target.closest('[data-goal-add]'))) addSheet(t.getAttribute('data-goal-add'));
    else if (e.target.closest('#goal-new')) newGoalSheet();
  });
  $('#whatif').addEventListener('submit', function (e) {
    e.preventDefault();
    runWhatIf(parseFloat(($('#wi-amt').value || '').replace(/[^0-9.]/g, '')));
  });
  $('#wi-clear').addEventListener('click', function () {
    $('#wi-amt').value = ''; $('#wi-result').textContent = ''; window.keelEquilibrium.inputs.isInteracting = false;
    setPreview(null); this.hidden = true; $('#wi-amt').focus();
  });
  $('#pl-extra').addEventListener('input', function () { renderPlan(true); });
  $('#pl-apply').addEventListener('click', function () {
    var extra = +$('#pl-extra').value, car = S.goals.filter(function (g) { return g.id === 'car'; })[0];
    if (!extra || !car) return;
    car.per += extra; save();
    $('#pl-extra').value = 0; planShown = null; renderPlan(true);
    // Completion (Lottie 15)
    showConfirm($('#pl-confirm'), 'Saved: ' + money(car.per) + ' each paycheck to Car repair fund.');
    announce('Plan saved.');
  });
  window.addEventListener('resize', placeIndicator);

  // Let the case study page drive the prototype.
  window.addEventListener('message', function (e) {
    var d = e.data || {};
    if (d.keel === 'go' && d.name) go(d.name, { silent: true });
    if (d.keel === 'theme') setTheme(d.value);
    if (d.keel === 'motion') setMotion(d.value);
    if (d.keel === 'reset') resetDemo();
    if (d.keel === 'whatif') { go('home', { silent: true }); $('#wi-amt').value = d.amount; runWhatIf(d.amount); }
  });

  // ================================================================ boot
  // Show the loading animation only if fonts take longer than 300ms; never a fake delay.
  var booted = false;
  setTimeout(function () { if (!booted) $('#boot').classList.add('on'); }, 300);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { booted = true; $('#boot').classList.remove('on'); });

  drawTicks();
  renderBillToggles();
  renderPaydayChips();
  renderAccounts();
  var params = new URLSearchParams(location.search);
  if (params.get('embed') === '1') document.body.classList.add('embedded');
  go(params.get('screen') || 'welcome', { silent: true });
})();
