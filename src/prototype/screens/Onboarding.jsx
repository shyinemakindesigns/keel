import { useEffect, useRef, useState } from 'react';
import Screen from '../Screen.jsx';
import { Mark } from '../icons.jsx';
import { money, payday, same, dayLabel, iso, ordinal, parse } from '../model.js';
import { reduced } from '../util.js';

// Onboarding Transition (Lottie 13): one object, one segment per step.
const ONB = { accounts: 60, bills: 120, payday: 180, taking: 240 };

export function OnbArt({ current }) {
  const el = useRef(null), at = useRef(null);
  const inFlow = current in ONB;
  const wide = typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches;
  useEffect(() => {
    const l = el.current;
    if (!l || !l.ready) return;
    if (!inFlow) { at.current = null; return; }
    const to = ONB[current];
    if (at.current === null) {
      const from = to - 60;
      if (reduced()) l.goTo(to); else l.ready.then(() => l.goTo(from).then(() => l.playSegment(from, to)));
    } else if (at.current !== to) {
      l.playSegment(at.current, to);   // backwards when at > to
    }
    at.current = to;
  }, [current, inFlow]);
  return (
    <div className={'onb-art' + (inFlow && (current !== 'taking' || wide) ? ' on' : '')} id="onb-art" aria-hidden="true">
      <keel-lottie ref={el} id="onb-lottie" name="onboarding" poster="start" label=""></keel-lottie>
    </div>
  );
}

export function Welcome({ app }) {
  const { current, go } = app;
  const lot = useRef(null);
  useEffect(() => {
    const w = lot.current;
    if (current !== 'welcome' || !w || !w.replay) return;
    if (reduced()) w.stop(); else w.replay();
  }, [current]);
  return (
    <Screen name="welcome" current={current} className="welcome" labelledBy="w-h">
      <div className="brandline wordmark"><Mark size={30} />Keel</div>
      <div className="welcome-art"><div><keel-lottie ref={lot} id="welcome-lottie" name="keel-settle" poster="end" label="Illustration: a small sailboat rocks on the water and settles level. Its keel is visible below the waterline." style={{ aspectRatio: '3/2' }}></keel-lottie></div></div>
      <h1 id="w-h">Know you’re okay before you know the details.</h1>
      <p className="tagline">Money moves. You stay steady.</p>
      <p className="lede">Keel looks at your bills, your paydays and your usual spending, then tells you one thing first: how long you’re covered.</p>
      <div className="foot">
        <button className="btn btn-primary btn-block" type="button" onClick={() => go('accounts')}>Begin</button>
        <p className="meta" style={{ textAlign: 'center' }}>Prototype. Sample data only, nothing connects to a bank.</p>
      </div>
    </Screen>
  );
}

export function Accounts({ app }) {
  const { S, current, go } = app;
  const car = S.goals.find((g) => g.id === 'car');
  return (
    <Screen name="accounts" current={current} className="onb" labelledBy="a-h">
      <p className="step">Step 1 of 3</p>
      <h1 id="a-h">Start with what you have.</h1>
      <p className="lede" style={{ marginTop: 12 }}>In the real product this is where you’d connect a bank. Here the prototype uses two sample accounts.</p>
      <div className="section-label">Sample accounts</div>
      <div className="rows">
        <div className="row"><div className="grow"><div className="title">Everyday checking</div><div className="meta">Counts toward your reading</div></div><div className="amt" id="acct-checking">{money(S.checking, true)}</div></div>
        <div className="row"><div className="grow"><div className="title">Car repair fund</div><div className="meta">Savings goal, kept separate</div></div><div className="amt" id="acct-goal">{money(car ? car.saved : 0, true)}</div></div>
      </div>
      <div className="foot">
        <button className="btn btn-primary btn-block" type="button" onClick={() => go('bills')}>Use sample accounts</button>
        <button className="btn-text" type="button" onClick={() => go('welcome')}>Back</button>
      </div>
    </Screen>
  );
}

export function Bills({ app }) {
  const { S, current, go, update } = app;
  return (
    <Screen name="bills" current={current} className="onb" labelledBy="b-h">
      <p className="step">Step 2 of 3</p>
      <h1 id="b-h">These look like regular bills.</h1>
      <p className="lede" style={{ marginTop: 12 }}>Keep the ones that are. Keel sets money aside for them before it tells you anything else.</p>
      <div className="section-label">Found in the last 3 months</div>
      <div className="rows" id="bill-toggles">
        {S.bills.map((b) => (
          <div className="row" key={b.id}>
            <div className="grow"><div className="title" id={'bl-' + b.id}>{b.name}</div><div className="meta">{money(b.amt)} around the {ordinal(parse(b.day).getDate())}</div></div>
            <button className="switch" type="button" role="switch" aria-checked={b.on} aria-labelledby={'bl-' + b.id} data-bill={b.id}
              onClick={() => update((n) => { const x = n.bills.find((y) => y.id === b.id); x.on = !x.on; })}></button>
          </div>
        ))}
      </div>
      <div className="foot">
        <button className="btn btn-primary btn-block" type="button" onClick={() => go('payday')}>Continue</button>
        <button className="btn-text" type="button" onClick={() => go('accounts')}>Back</button>
      </div>
    </Screen>
  );
}

const PAYDAYS = [new Date(2026, 9, 9), new Date(2026, 9, 15), new Date(2026, 9, 16), new Date(2026, 9, 23)];
const CADENCES = ['Weekly', 'Every two weeks', 'Twice a month', 'Monthly'];

export function Payday({ app }) {
  const { S, current, go, update } = app;
  const pd = payday(S);
  return (
    <Screen name="payday" current={current} className="onb" labelledBy="p-h">
      <p className="step">Step 3 of 3</p>
      <h1 id="p-h">When does money usually arrive?</h1>
      <p className="lede" style={{ marginTop: 12 }}>Your next payday is the shore Keel measures toward.</p>
      <fieldset>
        <legend>Next payday</legend>
        <div className="chips" id="payday-chips">
          {PAYDAYS.map((d) => (
            <button key={iso(d)} className="chip" type="button" aria-pressed={same(d, pd)} onClick={() => update((n) => { n.payday = iso(d); })}>{dayLabel(d)}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>How often</legend>
        <div className="chips" id="cadence-chips">
          {CADENCES.map((c) => (
            <button key={c} className="chip" type="button" aria-pressed={c === S.cadence} onClick={() => update((n) => { n.cadence = c; })}>{c}</button>
          ))}
        </div>
      </fieldset>
      <div className="foot">
        <button className="btn btn-primary btn-block" type="button" onClick={() => go('taking')}>Take my first reading</button>
        <button className="btn-text" type="button" onClick={() => go('bills')}>Back</button>
      </div>
    </Screen>
  );
}

export function Taking({ app }) {
  const { current, go } = app;
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (current !== 'taking') { setRun(false); return undefined; }
    // restart the CSS sequence: waterline draws, hull drops, keel sinks
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setRun(true)));
    const t = setTimeout(() => go('home', { fromTaking: true }), reduced() ? 600 : 2300);
    return () => { cancelAnimationFrame(r); clearTimeout(t); };
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Screen name="taking" current={current} className={'taking' + (run ? ' run' : '')} live="polite">
      <svg viewBox="0 0 220 120" aria-hidden="true">
        <rect className="f-water" x="10" y="62" width="200" height="58" />
        <path className="wl s-ink" d="M10 62h200" strokeWidth="2" strokeLinecap="round" fill="none" />
        <g className="hull-g"><path className="f-hull" d="M76 50h68c-2 9-8 15-16 15H92c-8 0-14-6-16-15z" /></g>
        <g className="fin"><path className="f-ink" d="M106 64h8l-1.5 30h-5z" /><ellipse className="f-ink" cx="110" cy="96" rx="11" ry="5" /></g>
      </svg>
      <h2 style={{ marginTop: 18 }}>Taking your first reading</h2>
      <p className="meta" style={{ marginTop: 6 }}>Setting aside bills, then measuring to payday</p>
    </Screen>
  );
}
