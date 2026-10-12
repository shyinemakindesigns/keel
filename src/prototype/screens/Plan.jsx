import { useEffect, useRef } from 'react';
import Screen from '../Screen.jsx';
import { GuideButton } from '../tour/GuideButton.jsx';
import { Confirm } from './Goals.jsx';
import { planSeries, estimate, reading, fmtDate, fmtLong, money, daysWord, TODAY, DAILY } from '../model.js';

export const DAILY_CUTS = [0, 5, 10];

// "What if I spent less each day?" A demonstration on the sample data: it reruns
// the same reading with a lower usual daily figure. Balance, bills and payday are
// unchanged, and future income is still not counted. Nothing is saved.
function DailyDemo({ S, cut, setCut }) {
  const base = reading(S, 0), adj = reading(S, 0, DAILY - cut);
  const gain = Math.round((adj.through - base.through) / 864e5);
  const max = Math.max(14, base.margin, adj.margin);
  const w = (m) => Math.max(2, (Math.max(0, m) / max) * 100) + '%';
  return (
    <section className="panel card daily" data-tour="daily" aria-labelledby="dd-h">
      <div className="daily-top"><h2 id="dd-h" className="sl-h">Spend a little less each day?</h2><span className="demo-tag">Demonstration</span></div>
      <fieldset className="daily-opts">
        <legend className="sr">Usual daily spending</legend>
        <div className="chips">
          {DAILY_CUTS.map((c) => (
            <label className="radio-chip" key={c}>
              <input type="radio" name="daily-cut" value={c} checked={cut === c} onChange={() => setCut(c)} />
              <span className="chip">{c === 0 ? `Usual, $${DAILY} a day` : `$${c} less a day`}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <dl className="daily-cmp" aria-live="polite">
        <div>
          <dt>Now, at ${DAILY} a day</dt>
          <dd><b>Steady through {fmtDate(base.through)}</b><span>{daysWord(base.margin)} past payday</span></dd>
          <span className="daily-bar" aria-hidden="true"><i style={{ width: w(base.margin) }} /></span>
        </div>
        <div className={cut ? 'is-adj' : ''}>
          <dt>{cut ? `At $${DAILY - cut} a day` : 'Pick an amount above'}</dt>
          <dd><b>Steady through {fmtDate(adj.through)}</b><span>{daysWord(adj.margin)} past payday</span></dd>
          <span className="daily-bar" aria-hidden="true"><i style={{ width: w(adj.margin) }} /></span>
        </div>
      </dl>
      <p className="daily-diff">{cut ? <>That’s <b>{gain > 0 ? `${daysWord(gain)} more room` : 'no change'}</b> before money runs short.</> : <>Choose a smaller daily amount to compare.</>}</p>
      <p className="meta daily-note">Sample data. Only the usual daily figure changes (${DAILY}, from the last 8 weeks); balance, bills and payday stay the same, and future income still isn’t counted. Nothing here is saved, and it isn’t financial advice.</p>
    </section>
  );
}

export default function Plan({ app }) {
  const { S, current, planExtra, setPlanExtra, applyPlan, planConfirm, openGuide, dailyCut, setDailyCut } = app;
  const active = current === 'plan';
  const sc = useRef(null), shown = useRef(null), prevExtra = useRef(planExtra);
  const extra = planExtra;
  const car = S.goals.find((g) => g.id === 'car');
  const s = planSeries(S, extra), N = s.cur.length;

  useEffect(() => {
    if (!active || !sc.current || !window.KeelCharts) return;
    const animate = prevExtra.current !== extra;
    prevExtra.current = extra;
    shown.current = window.KeelCharts.scenario(sc.current, { today: TODAY, dates: s.dates, cur: s.cur, wth: s.wth },
      { from: shown.current, duration: animate ? undefined : 0 });
  }, [active, extra, S]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!active) shown.current = null; }, [active]);

  const end = s.dates[N - 1];
  const curEst = car ? estimate(S, car) : null, newEst = car ? estimate(S, car, car.per + extra) : null;
  const r = reading(S, 0);
  const items = extra === 0
    ? [<>By {fmtLong(end)}, your goals would hold about <b>{money(s.cur[N - 1])}</b> on the current plan.</>, <>Move the slider to compare a different amount.</>]
    : [
      <>By {fmtLong(end)}: <b>{money(s.wth[N - 1])}</b> set aside instead of {money(s.cur[N - 1])}.</>,
      curEst && newEst && newEst.date && curEst.date ? <>Car repair fund done around <b>{fmtLong(newEst.date)}</b> instead of {fmtLong(curEst.date)}.</> : null,
      <>Between paydays you’d have about <b>{money(extra / 14, true)} a day</b> less to spend.</>,
      <>Today’s reading stays at <b>{fmtDate(r.through)}</b>.</>,
    ].filter(Boolean);

  return (
    <Screen name="plan" current={current} className="tabbed" labelledBy="pl-h">
      <div className="head head-row">
        <div>
          <h1 id="pl-h" className="page">Plan ahead</h1>
          <p className="lede" style={{ marginTop: 8 }}>Try a change before you make it.</p>
        </div>
        <GuideButton onClick={openGuide} />
      </div>
      <div className="col-a">
        <DailyDemo S={S} cut={dailyCut} setCut={setDailyCut} />
        <div className="panel card" style={{ marginTop: 18 }} data-tour="plan-slider">
          <div className="range-out"><label htmlFor="pl-extra" style={{ fontWeight: 600 }}>Set aside more each paycheck</label><output id="pl-out" htmlFor="pl-extra">{money(extra)}</output></div>
          <input className="range" id="pl-extra" type="range" min="0" max="300" step="25" value={extra} aria-describedby="pl-help" onChange={(e) => setPlanExtra(+e.target.value)} />
          <p className="meta" id="pl-help">On top of the {money(car ? car.per : 0)} already going to Car repair fund. Pay arrives every two weeks.</p>
        </div>
        <svg className="scenario" id="scenario" ref={sc} viewBox="0 0 340 210" role="img" aria-labelledby="sc-desc"><desc id="sc-desc"></desc></svg>
        <div className="legend2" aria-hidden="true"><span><i className="dash"></i>Current plan</span><span><i className="ember"></i>With the change</span></div>
        <div className="sr">
          <table id="sc-table">
            <caption>Projected savings, current plan and with {money(extra)} more each paycheck</caption>
            <tbody>
              <tr><th scope="col">Date</th><th scope="col">Current plan</th><th scope="col">With the change</th></tr>
              {s.dates.map((d, i) => (i % 2 === 0 ? <tr key={i}><th scope="row">{fmtLong(d)}</th><td>{money(s.cur[i])}</td><td>{money(s.wth[i])}</td></tr> : null))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="col-b">
        <ul className="readouts" id="pl-read" aria-live="polite">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
        <div className="foot" style={{ paddingTop: 18 }}>
          <button className="btn btn-primary btn-block" id="pl-apply" type="button" disabled={extra === 0} onClick={applyPlan}>Apply to Car repair fund</button>
          <Confirm msg={planConfirm} id="pl-confirm" />
        </div>
        <p className="note">A projection, not a promise. It assumes your pay and bills stay the same, and it doesn’t move today’s reading, because the change starts with your next paycheck.</p>
      </div>
    </Screen>
  );
}
