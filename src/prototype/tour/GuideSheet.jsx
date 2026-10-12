import { useEffect, useRef, useState } from 'react';
import { TourIcon, ChartIcon, GuideIcon, KeelIcon, LedgerIcon, ReplayIcon, ResetIcon, ArrowLeft, Chevron } from '../icons.jsx';
import { reading, fmtDate, money, daysWord, DAILY, payday, parse } from '../model.js';

const SCREEN_NAME = { home: 'Steady', spending: 'Spending', goals: 'Goals', plan: 'Plan' };

// Help that stays out of the way: one sheet, a short menu, two plain explanations.
export default function GuideSheet({ S, current, actions }) {
  const [view, setView] = useState('menu');
  const back = useRef(null), firstItem = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => { (view === 'menu' ? firstItem.current : back.current)?.focus(); }, 30);
    return () => clearTimeout(t);
  }, [view]);
  const r = reading(S, 0);
  const onScreen = SCREEN_NAME[current];

  if (view === 'keel') {
    return (
      <div className="guide-info">
        <button ref={back} type="button" className="btn-text" onClick={() => setView('menu')}><ArrowLeft />Guide</button>
        <h2 id="sheet-h">What the keel means</h2>
        <svg className="guide-keel" viewBox="0 0 340 110" aria-hidden="true">
          <rect className="f-water" x="0" y="34" width="340" height="76" />
          <path className="s-ink" d="M0 34h340" strokeWidth="1.5" />
          <path className="f-ink" d="M115 38h10l-2 56h-6z" /><ellipse className="f-ink" cx="120" cy="95" rx="13" ry="5.5" />
          <path className="f-hull" d="M70 16h100c-2.4 12-10.5 24-23 24h-54c-12.5 0-20.6-12-23-24z" />
          <g fontFamily="Archivo, sans-serif" fontSize="12.5"><text x="196" y="30" className="f-ink" fontWeight="600">Waterline: payday</text><text x="148" y="94" className="f-ink2s">Depth: days of room past it</text></g>
        </svg>
        <p>The waterline is always your next payday. The keel hangs below it, and its depth is how many days past payday your money would still cover your usual spending and bills.</p>
        <p>A deep keel means room to spare. A short one means you’re close to payday with little left over, and the words beside it say what to do. It never turns red and never shakes.</p>
        <p className="meta">In the sample data the keel reaches {daysWord(Math.max(0, r.margin))} past payday on {fmtDate(payday(S))}.</p>
      </div>
    );
  }
  if (view === 'data') {
    const bills = S.bills.filter((b) => b.on);
    return (
      <div className="guide-info">
        <button ref={back} type="button" className="btn-text" onClick={() => setView('menu')}><ArrowLeft />Guide</button>
        <h2 id="sheet-h">About the sample data</h2>
        <p>Keel is a fictional concept. Nothing here connects to a bank, and nothing you do leaves this browser.</p>
        <dl className="guide-dl">
          <div><dt>Today</dt><dd>Thursday, Oct 8, 2026 (fixed, so the dates always make sense)</dd></div>
          <div><dt>Checking</dt><dd>{money(S.checking, true)}</dd></div>
          <div><dt>Usual spending</dt><dd>${DAILY} a day, from the sample’s last 8 weeks</dd></div>
          <div><dt>Next payday</dt><dd>{fmtDate(payday(S))}, {S.cadence.toLowerCase()}</dd></div>
          <div><dt>Bills counted</dt><dd>{bills.map((b) => `${b.name} ${money(b.amt)} (${fmtDate(parse(b.day))})`).join(', ')}</dd></div>
        </dl>
        <p><b>How the reading works:</b> starting today, Keel subtracts usual daily spending and any bill that falls due, one day at a time. The last day that stays above zero is “steady through”. Future income is left out on purpose, so the date never depends on money you don’t have yet.</p>
        <p className="meta">Changes you make (moving money to a goal, recategorizing, applying a plan) are saved in this browser. Reset them from the Guide at any time.</p>
      </div>
    );
  }
  const items = [
    { k: 'tour', Icon: TourIcon, t: 'Take the guided tour', d: '8 short steps through the real app.', run: actions.restartTour },
    onScreen && { k: 'screen', Icon: GuideIcon, t: `Guide for ${onScreen}`, d: 'What this screen is for, pointed out in place.', run: actions.screenGuide },
    { k: 'overview', Icon: ChartIcon, t: 'App overview', d: 'The four tabs and the question each answers.', run: actions.overview },
    { k: 'keel', Icon: KeelIcon, t: 'What the keel means', d: 'The waterline, the depth, and why it never alarms.', run: () => setView('keel') },
    { k: 'data', Icon: LedgerIcon, t: 'About the sample data', d: 'What’s assumed, and how the date is worked out.', run: () => setView('data') },
    { k: 'setup', Icon: ReplayIcon, t: 'Replay first-run setup', d: 'Accounts, bills and payday, as a new user sees them.', run: actions.replaySetup },
    { k: 'reset', Icon: ResetIcon, t: 'Reset sample data', d: 'Put every number back to the start.', run: actions.reset },
  ].filter(Boolean);
  return (
    <>
      <h2 id="sheet-h" className="guide-h"><GuideIcon size={22} />Guide</h2>
      <p className="meta" style={{ marginBottom: 8 }}>Interactive concept demo · sample financial data</p>
      <ul className="guide-list">
        {items.map(({ k, Icon, t, d, run }, i) => (
          <li key={k}>
            <button ref={i === 0 ? firstItem : undefined} type="button" className="guide-item" onClick={run}>
              <span className="gi-icon"><Icon /></span>
              <span className="gi-text"><b>{t}</b><span>{d}</span></span>
              <Chevron />
            </button>
          </li>
        ))}
      </ul>
      <div className="foot" style={{ paddingTop: 12 }}><button type="button" className="btn-text" onClick={actions.close}>Close</button></div>
    </>
  );
}
