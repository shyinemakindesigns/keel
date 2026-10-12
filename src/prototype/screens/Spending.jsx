import { useEffect, useRef } from 'react';
import Screen from '../Screen.jsx';
import { GuideButton } from '../tour/GuideButton.jsx';
import { CATS, CAT_COLOR, LAST, DAILY, LAST_PAYDAY, TODAY, totals, money, addDays, iso, dayLabel, parse } from '../model.js';

export default function Spending({ app }) {
  const { S, current, activeCat, setActiveCat, openTx, openGuide, catsReset } = app;
  const active = current === 'spending';
  const catsRef = useRef(null), weekRef = useRef(null);

  // Spending Insight bars (keel-charts.js builds them once, then animates values)
  useEffect(() => {
    const box = catsRef.current;
    if (!active || !box || !window.KeelCharts) return;
    if (box._reset !== catsReset) { box._rows = null; box._reset = catsReset; }   // sample data reset: rebuild
    const tot = totals(S.tx);
    window.KeelCharts.bars(box, CATS.map((c) => {
      const v = tot[c], last = LAST[c], d = v - last;
      return {
        key: c, label: c, color: CAT_COLOR[c], value: v, last,
        note: (v === 0 && last === 0) ? 'None yet this stretch' : Math.abs(d) < 5 ? 'About the same as last stretch'
          : money(Math.abs(d)) + (d > 0 ? ' more' : ' less') + ' than by this point last stretch',
      };
    }), { selected: activeCat });
  }, [active, S, activeCat, catsReset]);

  // Weekly summary
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(LAST_PAYDAY, i);
    days.push({ date: d, amt: S.tx.filter((t) => t.date === iso(d)).reduce((s, t) => s + t.amt, 0) });
  }
  useEffect(() => {
    if (!active || !weekRef.current || !window.KeelCharts) return;
    window.KeelCharts.week(weekRef.current, { days, usual: DAILY, today: TODAY });
  }, [active, S]); // eslint-disable-line react-hooks/exhaustive-deps

  const list = S.tx.filter((t) => !activeCat || t.cat === activeCat).sort((a, b) => (a.date < b.date ? 1 : -1));
  const groups = [];
  list.forEach((t) => { const g = groups[groups.length - 1]; if (g && g.date === t.date) g.items.push(t); else groups.push({ date: t.date, items: [t] }); });

  return (
    <Screen name="spending" current={current} className="tabbed" labelledBy="sp-h">
      <div className="head head-row">
        <div>
          <h1 id="sp-h" className="page">This stretch</h1>
          <p className="meta" style={{ marginTop: 4 }}>Since payday on Oct 2, 7 days</p>
        </div>
        <GuideButton onClick={openGuide} />
      </div>
      <div className="col-a">
        <div className="section-label"><h2 className="sl-h">By category</h2><span>tap to filter</span></div>
        <div className="rows cats" id="cats" ref={catsRef} data-tour="cats" role="group" aria-label="Spending by category. Select one to filter transactions."
          onClick={(e) => { const b = e.target.closest('[data-cat]'); if (b) { const c = b.getAttribute('data-cat'); setActiveCat(activeCat === c ? null : c); } }}></div>
        <p className="legend-key"><i></i> By this point last stretch</p>
        <div className="section-label"><h2 className="sl-h">Day by day</h2><span id="wk-sub">{money(days.reduce((s, x) => s + x.amt, 0))} total</span></div>
        <svg className="week" id="week" ref={weekRef} viewBox="0 0 340 150" role="img" aria-labelledby="wk-desc"><desc id="wk-desc"></desc></svg>
      </div>
      <div className="col-b">
        <div className="section-label" id="tx-head"><h2 className="sl-h">Transactions</h2><span id="tx-sub">{activeCat || 'all categories'}</span></div>
        <div id="tx-list" data-tour="tx-list">
          {list.length === 0 ? (
            <div className="empty-state">
              <keel-lottie name="empty" trigger="inview" poster="end" label="A small ember resting on an empty platform."></keel-lottie>
              <h3>Nothing in {activeCat} yet</h3>
              <p>When there is, it’ll land here. Nothing’s wrong; this stretch just didn’t need it.</p>
            </div>
          ) : groups.map((g) => (
            <div key={g.date}>
              <p className="day-head">{dayLabel(parse(g.date))}</p>
              <div className="rows">
                {g.items.map((t) => (
                  <button className="row" key={t.id} data-tx={t.id} type="button" onClick={(e) => openTx(t.id, e.currentTarget)}>
                    <span className="cat-dot" style={{ background: CAT_COLOR[t.cat] }}></span>
                    <span className="grow"><span className="title" style={{ display: 'block' }}>{t.name}</span><span className="meta">{t.cat}</span></span>
                    <span className="amt">{money(t.amt, true)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}
