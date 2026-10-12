// Keel's sample model: the same illustrative data the prototype uses.
// It's an example, not a person's finances. Today is Thu, Oct 8 2026; payday is Oct 16.
// The reading walks forward from today, subtracting usual daily spending and any bill
// due that day, and ignores future income. The last day that stays above zero is
// "steady through".

export const SAMPLE = {
  balance: 1240,
  daily: 48,
  today: new Date(2026, 9, 8),
  payday: new Date(2026, 9, 16),
  // [day of October (32 = Nov 1), amount]
  bills: [[10, 17], [12, 65], [14, 70], [15, 142], [21, 40], [32, 1450]],
};

const DAY = 864e5;
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function steadyThrough(spendToday = 0) {
  let bal = SAMPLE.balance - spendToday;
  if (bal < 0) return new Date(2026, 9, 7);
  for (let i = 0; i < 90; i++) {
    const day = 8 + i;
    const due = SAMPLE.bills.filter((b) => b[0] === day).reduce((t, b) => t + b[1], 0);
    const next = bal - SAMPLE.daily - due;
    if (next < 0) return new Date(2026, 9, day - 1);
    bal = next;
  }
  return new Date(2026, 9, 97);
}

export function roomDays(spendToday = 0) {
  return Math.round((steadyThrough(spendToday) - SAMPLE.payday) / DAY);
}

export function fmtDate(d) { return MON[d.getMonth()] + ' ' + d.getDate(); }

export function money(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
}

// Each phrase completes "... of your usual spending".
export function weightPhrase(amount) {
  const d = amount / SAMPLE.daily;
  return d < 0.2 ? 'a small slice of a day' : d < 0.42 ? 'about a third of a day' : d < 0.75 ? 'about half a day'
    : d < 1.5 ? 'about a day' : d < 2.5 ? 'about two days' : 'about ' + Math.round(d) + ' days';
}

export const TRANSACTIONS = [
  { id: 't1', name: 'Corner Market', category: 'Groceries', date: 'Thu, Oct 8', amount: 23.4 },
  { id: 't3', name: 'Hana Sushi', category: 'Eating out', date: 'Wed, Oct 7', amount: 16.8 },
];
