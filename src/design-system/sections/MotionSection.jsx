import { useState } from 'react';
import { springSamples, SPRING } from '../../shared/motion.js';
import { usePrefs } from '../../shared/prefs.js';

const LANGUAGE = [
  ['Settle', 'Movement comes to rest the way a weight finds its level: it decelerates and stops.', 'The keel finding a new depth', '--ease-settle, 900ms'],
  ['Reveal', 'Information arrives in reading order, in small groups, without urgency.', 'Sections, rows, sheets', '--ease-enter, 420ms, 60ms stagger'],
  ['Connect', 'What changes keeps its identity. Bars grow, indicators travel, nothing redraws from zero.', 'Tab indicator, chart values', '--ease-standard, 520ms'],
  ['Respond', 'Every input gets immediate, specific feedback, then gets out of the way.', 'Buttons, chips, switches', '140 to 200ms'],
  ['Reassure', 'Done feels done; waiting shows signs of life; bad news is said in words.', 'Confirmations, loading', '280ms, words before motion'],
];

const EASES = [
  ['Settle', '--ease-settle', [0.2, 0.7, 0.2, 1], 'Default. Arrivals and the keel.'],
  ['Enter', '--ease-enter', [0.22, 1, 0.36, 1], 'Sheets and reveals.'],
  ['Exit', '--ease-exit', [0.4, 0, 1, 1], 'Leaving: quick and quiet.'],
  ['Standard', '--ease-standard', [0.4, 0, 0.2, 1], 'Changes in place.'],
];

const DURATIONS = [
  ['press', 140], ['hover', 200], ['card', 280], ['move', 420], ['chart', 520], ['settle', 900], ['illustration', 1400], ['hero', 4000],
];

// A CSS cubic-bezier is a Bezier curve in (time, progress) space from (0,0) to (1,1),
// so the plot is exact: the same four numbers, drawn.
function EasePlot({ name, tok, p }) {
  const S = 120, P = 14;
  const X = (t) => P + t * S, Y = (v) => P + (1 - v) * S;
  const d = `M${X(0)} ${Y(0)} C${X(p[0])} ${Y(p[1])} ${X(p[2])} ${Y(p[3])} ${X(1)} ${Y(1)}`;
  return (
    <svg viewBox={`0 0 ${S + P * 2} ${S + P * 2}`} role="img" aria-label={`${name} easing curve, cubic-bezier(${p.join(', ')})`}>
      <rect x={P} y={P} width={S} height={S} fill="none" stroke="var(--rule)" />
      <path d={`M${X(0)} ${Y(0)}L${X(1)} ${Y(1)}`} stroke="var(--rule)" strokeDasharray="2 4" />
      <path d={`M${X(0)} ${Y(0)}L${X(p[0])} ${Y(p[1])}M${X(1)} ${Y(1)}L${X(p[2])} ${Y(p[3])}`} stroke="var(--ink-2)" strokeWidth="1" />
      <circle cx={X(p[0])} cy={Y(p[1])} r="3" fill="var(--canvas)" stroke="var(--ink-2)" />
      <circle cx={X(p[2])} cy={Y(p[3])} r="3" fill="var(--canvas)" stroke="var(--ink-2)" />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={X(0)} cy={Y(0)} r="3.5" fill="var(--ink)" />
      <circle cx={X(1)} cy={Y(1)} r="3.5" fill="var(--ink)" />
    </svg>
  );
}

function SpringPlot() {
  const pts = springSamples(0, 1, 1200);
  const W = 300, H = 120, P = 12;
  const d = pts.map(([t, x], i) => `${i ? 'L' : 'M'}${(P + (t / 1.2) * W).toFixed(1)} ${(P + (1 - x) * H * 0.85 + H * 0.1).toFixed(1)}`).join('');
  const peak = Math.max(...pts.map(([, x]) => x));
  const settled = pts.find(([, x], i) => i > 0 && pts.slice(i).every(([, y]) => Math.abs(1 - y) < 0.01));
  return (
    <figure className="spring">
      <svg viewBox={`0 0 ${W + P * 2} ${H + P * 2}`} role="img" aria-label={`The keel spring rising from 0 to 1 over 1.2 seconds. Highest point ${(peak * 100).toFixed(1)}% of the target, within 1% of rest by ${Math.round(settled[0] * 1000)} milliseconds.`}>
        <path d={`M${P} ${P + H * 0.1}H${P + W}`} stroke="var(--rule)" strokeDasharray="2 4" />
        <path d={`M${P} ${P + H * 0.95}H${P + W}`} stroke="var(--rule)" />
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <figcaption>
        <b>The keel’s spring</b> Stiffness {SPRING.stiffness}, damping {SPRING.damping}, mass 1: a damping ratio of 0.9.
        Simulated here: within 1% of rest by <span className="num">{Math.round(settled[0] * 1000)}ms</span>, highest point <span className="num">{(peak * 100).toFixed(2)}%</span> of the target. No visible bounce.
      </figcaption>
    </figure>
  );
}

function SnapSettle() {
  const [run, setRun] = useState(0);
  const [at, setAt] = useState(true);
  const { reduced } = usePrefs();
  const replay = () => {
    setAt(false);
    setRun((r) => r + 1);
    requestAnimationFrame(() => requestAnimationFrame(() => setAt(true)));
  };
  return (
    <div className="snap">
      <div className="snap-grid">
        <figure>
          <figcaption><b>Snap</b> Arrives at once. Reads as a jolt, as if the news were urgent.</figcaption>
          <div className="track"><span key={'a' + run} className={'puck snap-puck' + (at ? ' at' : '')} /></div>
        </figure>
        <figure>
          <figcaption><b>Settle</b> Decelerates into place over 900ms. Reads as steady.</figcaption>
          <div className="track"><span key={'b' + run} className={'puck settle-puck' + (at ? ' at' : '')} /></div>
        </figure>
      </div>
      <div className="snap-ctl">
        <button type="button" className="btn btn-secondary" onClick={replay}>Replay motion</button>
        <span className="small muted" aria-live="polite">{reduced ? 'Motion is reduced, so both arrive instantly: the end state is the same.' : run > 0 && at ? 'Replayed: both indicators have arrived.' : ''}</span>
      </div>
    </div>
  );
}

export default function MotionSection() {
  return (
    <section id="motion" className="sec" aria-labelledby="motion-h">
      <div className="wrap">
        <header className="sec-head">
          <span className="sec-num" aria-hidden="true">04</span>
          <h2 id="motion-h">Motion</h2>
          <p className="lede">Every movement answers one question: what does this help someone understand? Keel moves more slowly than a typical fintech app, on purpose.</p>
        </header>

        <h3 className="h-part">Keel motion language</h3>
        <dl className="mlang">
          {LANGUAGE.map(([n, d, w, t]) => (
            <div key={n}><dt>{n}</dt><dd><p>{d}</p><p className="ml-meta"><span>{w}</span><code>{t}</code></p></dd></div>
          ))}
        </dl>

        <h3 className="h-part">Easing</h3>
        <ul className="eases">
          {EASES.map(([n, tok, p, use]) => (
            <li key={tok}>
              <EasePlot name={n} tok={tok} p={p} />
              <b>{n}</b>
              <code>cubic-bezier({p.join(', ')})</code>
              <span className="small muted">{use}</span>
            </li>
          ))}
        </ul>

        <h3 className="h-part">Duration</h3>
        <ol className="durs">
          {DURATIONS.map(([k, ms]) => (
            <li key={k}>
              <code>--duration-{k}</code>
              <span className="dur-bar" style={{ width: `${(ms / 4000) * 100}%` }} aria-hidden="true" />
              <span className="num">{ms}ms</span>
            </li>
          ))}
        </ol>
        <p className="small muted">Bars are to scale against the 4000ms hero. Sequential reveals stagger by <code>--duration-stagger</code>, 60ms, and never across more than a handful of items.</p>

        <div className="two-col motion-demos">
          <div>
            <h3 className="h-part">Snap or settle</h3>
            <SnapSettle />
          </div>
          <div>
            <h3 className="h-part">The one spring</h3>
            <SpringPlot />
          </div>
        </div>

        <div className="reduced-note">
          <h3 className="h-part">Reduced motion</h3>
          <p>Motion can be removed without removing information or changing the resulting state. With the operating system setting or the switch in the header, every duration token becomes 0: the navigation underline still moves to the right link, the keel still reaches its new depth, the sheet still opens. Only the travel disappears, and smooth scrolling turns off.</p>
          <p><a href="/system.html#library">See the full animation library</a>: 16 documented animations, each with a static fallback.</p>
        </div>
      </div>
    </section>
  );
}
