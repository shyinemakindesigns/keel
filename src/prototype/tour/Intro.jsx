import { useEffect, useState } from 'react';
import Screen from '../Screen.jsx';
import { Mark, TourIcon, CompassIcon } from '../icons.jsx';
import { reduced } from '../util.js';

// First visit: what Keel is, in one screen, and two ways in.
export default function Intro({ app }) {
  const { current, startOverview, exploreOwn } = app;
  // The keel settles once: waterline draws, hull lowers onto it, keel sinks below
  // (the same sequence as the first reading). Instant with reduced motion.
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (current !== 'intro') { setRun(false); return undefined; }
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setRun(true)));
    return () => cancelAnimationFrame(r);
  }, [current]);
  return (
    <Screen name="intro" current={current} className="intro" labelledBy="intro-h">
      <div className="brandline wordmark"><Mark size={30} />Keel</div>
      <div className={'intro-art' + (run ? ' run' : '')} aria-hidden="true">
        <svg viewBox="0 0 340 150">
          <rect className="f-water" x="0" y="70" width="340" height="80" />
          <path className="wl s-ink" d="M0 70h340" strokeWidth="1.5" fill="none" />
          <g className="hull-g"><path className="f-hull" d="M120 52h100c-2.4 12-10.5 24-23 24h-54c-12.5 0-20.6-12-23-24z" /></g>
          <g className="fin"><path className="f-ink" d="M165 74h10l-2 52h-6z" /><ellipse className="f-ink" cx="170" cy="127" rx="13" ry="5.5" /></g>
          <g className="ticks" fontFamily="Archivo, sans-serif" fontSize="12.5"><path className="s-ink2s" d="M262 72V128M256 72h6M256 128h6" strokeWidth="1" fill="none" /><text className="f-ink" x="270" y="86" fontWeight="600">Payday</text><text className="f-ink2s" x="270" y="132">Room</text></g>
        </svg>
      </div>
      <div className="intro-copy">
        <h1 id="intro-h">Meet Keel.</h1>
        <p className="intro-statement">A calmer way to understand where you stand with money.</p>
        <p className="lede">Keel helps you see how long your money can carry you, understand everyday spending, and explore what comes next, without restrictive budgets or alarming alerts.</p>
      </div>
      <div className="foot intro-foot">
        <button className="btn btn-primary btn-block" type="button" onClick={startOverview}><TourIcon />Take a guided tour</button>
        <button className="btn btn-quiet btn-block" type="button" onClick={exploreOwn}><CompassIcon />Explore on my own</button>
        <p className="meta intro-meta">Interactive concept demo · Sample financial data</p>
      </div>
    </Screen>
  );
}
