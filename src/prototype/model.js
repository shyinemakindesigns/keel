// Keel prototype model. Sample data only; every figure on screen is computed from
// this state, so a change anywhere shows up everywhere it should.
// Ported from assets/js/app.js without changing a single rule.

export const TODAY = new Date(2026, 9, 8);   // Thu Oct 8 2026, fixed so the dates always make sense
export const DAILY = 48;                     // usual day-to-day spending (sample's last 8 weeks)
export const LAST_PAYDAY = new Date(2026, 9, 2);
export const STORE = 'keel-demo-v2';
export const CATS = ['Groceries', 'Eating out', 'Getting around', 'Health', 'Everything else', 'Travel'];
export const CAT_COLOR = { Groceries: 'var(--data-1)', 'Eating out': 'var(--data-2)', 'Getting around': 'var(--data-3)', Health: 'var(--data-4)', 'Everything else': 'var(--data-5)', Travel: 'var(--data-5)' };
// By this point in the previous stretch (its first 7 days). Sample data.
export const LAST = { Groceries: 98.2, 'Eating out': 52.1, 'Getting around': 41.0, Health: 0, 'Everything else': 33.5, Travel: 0 };

export function defaults() {
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
      { id: 'rent', name: 'Rent', day: '2026-11-01', amt: 1450, on: true },
    ],
    tx: [
      { id: 't1', date: '2026-10-08', name: 'Corner Market', cat: 'Groceries', amt: 23.4 },
      { id: 't2', date: '2026-10-08', name: 'Metro fare', cat: 'Getting around', amt: 3.25 },
      { id: 't3', date: '2026-10-07', name: 'Hana Sushi', cat: 'Eating out', amt: 16.8 },
      { id: 't4', date: '2026-10-07', name: 'Fairway Pharmacy', cat: 'Health', amt: 12.15 },
      { id: 't5', date: '2026-10-06', name: 'Northside Grocer', cat: 'Groceries', amt: 61.2 },
      { id: 't6', date: '2026-10-05', name: 'Fuel stop', cat: 'Getting around', amt: 44.0 },
      { id: 't7', date: '2026-10-05', name: 'Dinner with Sam', cat: 'Eating out', amt: 38.5 },
      { id: 't8', date: '2026-10-04', name: 'Second Story Books', cat: 'Everything else', amt: 19.99 },
      { id: 't9', date: '2026-10-03', name: 'Harbor Coffee', cat: 'Eating out', amt: 5.25 },
      { id: 't10', date: '2026-10-03', name: 'Ace Hardware', cat: 'Everything else', amt: 27.6 },
      { id: 't11', date: '2026-10-02', name: 'Northside Grocer', cat: 'Groceries', amt: 54.3 },
    ],
    goals: [{ id: 'car', name: 'Car repair fund', note: 'For the brakes, before winter', saved: 380, target: 1000, per: 50 }],
  };
}
export function load() {
  try { const s = JSON.parse(localStorage.getItem(STORE)); if (s && s.bills && s.tx && s.goals) return s; } catch (e) { /* fall through */ }
  return defaults();
}
export function save(S) { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* private mode */ } }

// ---------------------------------------------------------------- helpers
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => (n < 10 ? '0' : '') + n;
export const iso = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
export const parse = (s) => { const p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
export const fmtDate = (d) => MON[d.getMonth()] + ' ' + d.getDate();
export const fmtLong = (d) => MON[d.getMonth()] + ' ' + d.getDate() + (d.getFullYear() !== 2026 ? ', ' + d.getFullYear() : '');
export const dayLabel = (d) => DOW[d.getDay()] + ', ' + fmtDate(d);
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const diffDays = (a, b) => Math.round((a - b) / 86400000);
export const same = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export function money(n, cents) {
  const s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
  return (n < 0 ? '-$' : '$') + s;
}
export function daysWord(n) {
  if (n === 1) return '1 day';
  if (n === 7) return 'a week';
  if (n === 14) return 'two weeks';
  return n + ' days';
}
export function ordinal(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
export const payday = (S) => parse(S.payday);

// ---------------------------------------------------------------- the reading
// "Steady through" = the last day your money covers your bills and your usual
// spending if nothing else came in. Future income is ignored on purpose.
// `daily` defaults to the usual $48; the Plan demonstration passes a lower figure.
export function reading(S, extraSpend = 0, daily = DAILY) {
  let bal = S.checking - extraSpend;
  const bills = S.bills.filter((b) => b.on);
  let through = null, shortOn = null;
  for (let i = 0; i < 90; i++) {
    const day = addDays(TODAY, i);
    const due = bills.filter((b) => same(parse(b.day), day));
    const dueAmt = due.reduce((s, b) => s + b.amt, 0);
    const next = bal - daily - dueAmt;
    if (next < 0) { through = addDays(day, -1); shortOn = due.length ? due[0] : null; break; }
    bal = next;
  }
  if (!through) through = addDays(TODAY, 89);
  const pd = payday(S), toPay = diffDays(pd, TODAY);
  const billsBefore = bills.filter((b) => parse(b.day) < pd);
  const billsBeforeAmt = billsBefore.reduce((s, b) => s + b.amt, 0);
  return {
    through, margin: diffDays(through, pd), shortBill: shortOn,
    billsBefore, billsBeforeAmt,
    landing: S.checking - extraSpend - billsBeforeAmt - daily * toPay,
  };
}

export function pace(S) {
  const spent = S.tx.reduce((s, t) => s + t.amt, 0);
  const days = diffDays(TODAY, LAST_PAYDAY) + 1, usual = DAILY * days, ratio = spent / usual;
  return { spent, days, usual, ratio, progress: Math.max(0, Math.min(1, ratio - 0.5)) };
}

export function totals(list) {
  const t = {}; CATS.forEach((c) => { t[c] = 0; }); list.forEach((x) => { t[x.cat] += x.amt; }); return t;
}

// Each phrase completes "... of your usual spending". $16.80 at $48 a day is 0.35.
export function weightPhrase(amt) {
  const d = amt / DAILY;
  return d < 0.2 ? 'a small slice of a day' : d < 0.42 ? 'about a third of a day' : d < 0.75 ? 'about half a day'
    : d < 1.5 ? 'about a day' : d < 2.5 ? 'about two days' : 'about ' + Math.round(d) + ' days';
}

export function estimate(S, g, perOverride) {
  const per = perOverride === undefined ? g.per : perOverride;
  if (g.saved >= g.target) return { done: true };
  if (!per) return { none: true };
  const n = Math.ceil((g.target - g.saved) / per);
  return { date: addDays(payday(S), 14 * (n - 1)), paychecks: n };
}
export function goalEstimateText(S, g) {
  const e = estimate(S, g);
  if (e.done) return 'Funded. Nice and steady.';
  if (e.none) return 'No regular amount yet.';
  return money(g.per) + ' each paycheck · done around ' + fmtLong(e.date);
}

export function planSeries(S, extra) {
  const saved0 = S.goals.reduce((s, g) => s + g.saved, 0);
  const per = S.goals.reduce((s, g) => s + g.per, 0);
  const pts = [], cur = [], wth = [];
  for (let k = 0; k < 13; k++) pts.push(addDays(payday(S), 14 * k));
  cur.push(saved0); wth.push(saved0);
  pts.forEach((d, k) => { cur.push(saved0 + per * (k + 1)); wth.push(saved0 + (per + extra) * (k + 1)); });
  return { dates: [TODAY].concat(pts), cur, wth, per };
}
