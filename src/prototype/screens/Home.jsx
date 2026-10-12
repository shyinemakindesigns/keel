import { useEffect, useRef } from 'react';
import Screen from '../Screen.jsx';
import KeelViz, { depthFor } from '../KeelViz.jsx';
import { GuideButton } from '../tour/GuideButton.jsx';
import { Mark } from '../icons.jsx';
import { reading, pace, payday, fmtDate, money, daysWord, parse, MON, TODAY } from '../model.js';
import { reduced, cssMs } from '../util.js';

let paceIntroDone = false;

export default function Home({ app }) {
  const { S, current, whatif, setWhatif, keelStart, demoDepth, openGuide, resetDemo } = app;
  const r = reading(S, 0), steady = r.margin >= 0, pd = payday(S);
  const active = current === 'home';

  // purchase check
  const amount = whatif.checked;
  let result = null, preview = null;
  if (whatif.checked !== null) {
    if (!(amount > 0)) result = <>Enter an amount to see how it would move your reading.</>;
    else {
      const w = reading(S, amount), lessDays = Math.round((r.through - w.through) / 864e5);
      result = w.margin >= 0
        ? <>With {money(amount)} spent today, you’d be steady through <b>{fmtDate(w.through)}</b>, {daysWord(w.margin)} past payday. {lessDays > 0 ? `That’s ${daysWord(lessDays)} less room than now.` : 'Your reading wouldn’t change.'}</>
        : <>With {money(amount)} spent today, you’d be covered through <b>{fmtDate(w.through)}</b>, {daysWord(-w.margin)} before payday.{w.shortBill ? ` ${w.shortBill.name} (${money(w.shortBill.amt)}) on ${fmtDate(parse(w.shortBill.day))} is the first bill it would reach.` : ' Your usual spending would run past what’s left.'}</>;
      preview = { depth: depthFor(w.margin), label: 'With ' + money(amount) };
    }
  }
  if (demoDepth != null) preview = { depth: demoDepth, label: 'Example' };

  // upcoming bills
  const up = S.bills.filter((b) => b.on).sort((a, b) => parse(a.day) - parse(b.day)).slice(0, 5);
  const nextBill = up.find((b) => parse(b.day) >= TODAY);
  const allCovered = up.every((b) => parse(b.day) <= r.through || parse(b.day) >= pd);

  const tl = useRef(null), paceEl = useRef(null);
  useEffect(() => {
    if (!active || !tl.current || !window.KeelCharts) return;
    window.KeelCharts.timeline(tl.current, {
      today: TODAY, payday: pd, span: 24,
      bills: S.bills.filter((b) => b.on).sort((a, b) => parse(a.day) - parse(b.day))
        .map((b) => ({ name: b.name, date: parse(b.day), amt: b.amt, next: b === nextBill })),
    });
  }, [active, S]); // eslint-disable-line react-hooks/exhaustive-deps

  const p = pace(S), diff = Math.round(p.usual - p.spent);
  useEffect(() => {
    const el = paceEl.current;
    if (!active || !el || !el.ready) return;
    el.ready.then((a) => {
      if (!paceIntroDone && !reduced()) {
        paceIntroDone = true;
        a.playSegments([0, 36], true);
        setTimeout(() => el.scrubTo(p.progress, { from: 36, to: 136, duration: 900 }), 620);
      } else {
        paceIntroDone = true;
        el.scrubTo(p.progress, { from: 36, to: 136, duration: cssMs('--dur-chart') });
      }
    });
  }, [active, p.progress]);
  const paceLabel = 'Spending pace marker at ' + Math.round(p.ratio * 100) + ' percent of your usual pace.';

  const input = useRef(null);
  return (
    <Screen name="home" current={current} className="tabbed" labelledBy="home-h">
      <div className="topbar">
        <div className="wordmark"><Mark />Keel</div>
        <div className="topbar-end"><span className="meta">Thu, Oct 8</span><GuideButton onClick={openGuide} /></div>
      </div>
      <h1 id="home-h" className="sr">Your reading</h1>

      <div className="reading">
        <div data-tour="reading">
          <p className="kicker" id="r-kicker">{steady ? 'You’re steady through' : 'You’re covered through'}</p>
          <p className="date num" id="r-date" aria-live="polite">{fmtDate(r.through)}</p>
          <p className="sub" id="r-sub">{steady
            ? <><b>{daysWord(r.margin)} past</b> your next payday on {fmtDate(pd)}. Your bills before then are already set aside.</>
            : <>That’s <b>{daysWord(-r.margin)} before</b> payday on {fmtDate(pd)}. One change usually covers it; see Coming up below.</>}</p>
        </div>
        <KeelViz depth={depthFor(r.margin)} preview={preview} startFrom={keelStart}
          desc={'Keel depth: covered ' + daysWord(Math.abs(r.margin)) + (steady ? ' past' : ' before') + ' payday.' + (demoDepth != null ? ' Showing an example depth for the tour.' : '')} />
        <dl className="facts">
          <div><dt>Bills before payday</dt><dd id="f-bills">{money(r.billsBeforeAmt)}</dd></div>
          <div><dt>Reach payday with</dt><dd id="f-landing">{r.landing >= 0 ? 'about ' + money(Math.round(r.landing / 5) * 5) : 'short ' + money(Math.round(-r.landing / 5) * 5)}</dd></div>
        </dl>
      </div>

      <form className="panel card whatif" id="whatif" noValidate data-tour="whatif"
        onSubmit={(e) => { e.preventDefault(); setWhatif({ value: whatif.value, checked: parseFloat((whatif.value || '').replace(/[^0-9.]/g, '')) }); }}>
        <label htmlFor="wi-amt">Thinking about a purchase?</label>
        <p className="hint" id="wi-hint">See how it would move your reading before you spend.</p>
        <div className="field-row">
          <div className="field"><span>$</span><input id="wi-amt" ref={input} inputMode="decimal" autoComplete="off" placeholder="0" aria-describedby="wi-hint"
            value={whatif.value} onChange={(e) => setWhatif({ value: e.target.value, checked: whatif.checked })} /></div>
          <button className="btn btn-primary" type="submit">Check</button>
        </div>
        <p className="whatif-result" id="wi-result" aria-live="polite">{result}</p>
        {whatif.checked !== null && (
          <button className="btn-text" type="button" id="wi-clear" onClick={() => { setWhatif({ value: '', checked: null }); input.current && input.current.focus(); }}>Clear</button>
        )}
      </form>

      <section className="pace" aria-labelledby="pace-h">
        <div className="section-label"><h2 className="sl-h" id="pace-h">Spending pace</h2><span>since payday on Oct 2</span></div>
        <keel-lottie ref={paceEl} id="pace-lottie" name="line" poster="start" label={paceLabel} aria-label={paceLabel}></keel-lottie>
        <div className="scale" aria-hidden="true"><span>Lighter</span><span>Your usual</span><span>Heavier</span></div>
        <p className="read" id="pace-read" aria-live="polite">{Math.abs(diff) < 10
          ? <>You’ve spent <b>{money(p.spent)}</b> in {p.days} days, right around your usual pace.</>
          : <>You’ve spent <b>{money(p.spent)}</b> in {p.days} days. Your usual pace would be about {money(p.usual)}, so you’re running <b>{money(Math.abs(diff))}{diff > 0 ? ' lighter' : ' heavier'}</b> than usual.{diff < 0 ? ' Your reading already counts it.' : ''}</>}</p>
      </section>

      <section className="upcoming-block" aria-labelledby="up-h">
        <div className="section-label"><h2 className="sl-h" id="up-h">Coming up</h2><span id="upcoming-sub">{allCovered ? 'covered by this paycheck or the next' : ''}</span></div>
        <svg className="timeline" id="timeline" ref={tl} viewBox="0 0 340 74" role="img" aria-labelledby="tl-desc"><desc id="tl-desc"></desc></svg>
        <div className="rows" id="upcoming">
          {up.map((b) => {
            const d = parse(b.day), covered = d <= r.through;
            return (
              <div className="row" key={b.id}>
                <div className="bill-when"><b>{d.getDate()}</b><small>{MON[d.getMonth()]}</small></div>
                <div className="grow"><div className="title">{b.name}{b === nextBill && <span className="next-flag">Next</span>}</div><div className="tag">{covered ? 'Set aside' : 'After your reading, comes from your next paycheck'}</div></div>
                <div className="amt">{money(b.amt)}</div>
              </div>
            );
          })}
        </div>
      </section>
      <p className="note foot-note">Usual day-to-day spending: about $48 a day, from the sample’s last 8 weeks. <button className="btn-text" type="button" onClick={resetDemo} style={{ fontSize: '13.5px' }}>Reset sample data</button></p>
    </Screen>
  );
}
