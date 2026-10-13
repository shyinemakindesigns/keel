import { useEffect, useRef, useState } from 'react';
import { ratio, token } from '../../shared/contrast.js';
import { usePrefs } from '../../shared/prefs.js';
import { StatusIcon } from '../../shared/Icons.jsx';

const KEYS = [
  ['Tab, Shift+Tab', 'Move between controls in reading order'],
  ['Enter', 'Follow a link, press a button, submit the purchase check'],
  ['Space', 'Press a button, toggle a switch or chip'],
  ['Arrow keys', 'Move between options in a group (example depth, sheet categories)'],
  ['Escape', 'Close the sheet and return focus to what opened it'],
];

// Measures this page as rendered: the smallest interactive target (inline links
// inside sentences are exempt under WCAG 2.5.8) and the three threshold examples.
function useLiveChecks(deps) {
  const [r, setR] = useState(null);
  useEffect(() => {
    const t = setTimeout(() => {
      const els = [...document.querySelectorAll('main button, main a, main input, main [role=switch], header button, header a')]
        .filter((el) => {
          const box = el.getBoundingClientRect();
          if (!box.width || !box.height) return false;
          if (el.closest('.sr, [aria-hidden="true"], dialog:not([open])')) return false;
          if (el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.closest('p, li, dd, figcaption')) return false;
          if (el.type === 'radio' || el.type === 'checkbox') return false;
          return true;
        });
      let small = null;
      for (const el of els) {
        const b = el.getBoundingClientRect();
        const s = Math.min(b.width, b.height);
        if (!small || s < small.s) small = { s, w: Math.round(b.width), h: Math.round(b.height), name: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 32) };
      }
      setR({ count: els.length, small });
    }, 400);
    return () => clearTimeout(t);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return r;
}

export default function AccessibilitySection() {
  const { theme, reduced } = usePrefs();
  const ex = useRef(null);
  const [ratios, setRatios] = useState({});
  useEffect(() => {
    const el = ex.current;
    if (!el) return;
    setRatios({
      text: ratio(token(el, '--ink'), token(el, '--canvas')),
      large: ratio(token(el, '--ink-2'), token(el, '--canvas')),
      ui: ratio(token(el, '--control'), token(el, '--canvas')),
      focus: ratio(token(el, '--focus'), token(el, '--canvas')),
    });
  }, [theme]);
  const live = useLiveChecks([theme]);
  const f = (n) => (n ? n.toFixed(2) + ':1' : '');

  return (
    <section id="accessibility" className="sec" aria-labelledby="a11y-h">
      <div className="wrap">
        <header className="sec-head">
          <span className="sec-num" aria-hidden="true">06</span>
          <h2 id="a11y-h">Accessibility</h2>
          <p className="lede">Keel targets WCAG 2.2 AA. This page has been checked with automated probes and by keyboard; it has not had a formal audit or a test with screen reader users, and doesn’t claim conformance.</p>
        </header>

        <div className="a11y-grid" ref={ex}>
          <article>
            <h3>Contrast</h3>
            <p>Three thresholds, measured live in the {theme} theme:</p>
            <ul className="thresholds">
              <li><span className="th-sample th-text">Body text</span><span><b>Normal text: 4.5:1</b> Ink on canvas: <span className="num">{f(ratios.text)}</span></span></li>
              <li><span className="th-sample th-large">Oct 25</span><span><b>Large text: 3:1</b> Slate as large type: <span className="num">{f(ratios.large)}</span></span></li>
              <li><span className="th-sample th-ui" aria-hidden="true" /><span><b>UI boundaries and indicators: 3:1</b> Control edge: <span className="num">{f(ratios.ui)}</span>; focus ring: <span className="num">{f(ratios.focus)}</span></span></li>
            </ul>
            <p className="small muted">The full calculated table is in the <a href="#color">Color</a> section.</p>
          </article>

          <article>
            <h3>Touch targets</h3>
            <p>Keel’s minimum is 44 × 44px for buttons, navigation, switches, tabs, icon buttons and chips, above the 24px the standard requires.</p>
            <div className="target-demo" aria-hidden="true"><span className="target-box"><span className="target-icon">×</span></span><span className="small">A 20px icon, a 44px target</span></div>
            {live && (
              <p className="live-check"><StatusIcon kind={live.small && live.small.s >= 44 ? 'positive' : 'warning'} />
                Measured on this page: {live.count} controls; the smallest is <span className="num">{live.small.w} × {live.small.h}px</span> (“{live.small.name}”).</p>
            )}
          </article>

          <article>
            <h3>Focus</h3>
            <p>A 2px solid ring in <code>--focus</code>, 3px out from the control, in both themes. Press Tab to see it. Scrolling containers leave room so it is never clipped.</p>
            <span className="btn btn-secondary is-focus" aria-hidden="true">Focused button</span>
          </article>

          <article>
            <h3>Reduced motion</h3>
            <p>Motion can be removed without removing information or changing the resulting state.</p>
            <p className="live-check"><StatusIcon kind="info" />Right now motion is <b>{reduced ? 'reduced' : 'on'}</b>{reduced ? ': transitions are instant.' : '. Use the header switch to reduce it.'}</p>
          </article>

          <article>
            <h3>Never color alone</h3>
            <ul className="plain">
              <li>Status has a shape and a word: <span className="inline-st st-positive"><StatusIcon kind="positive" />Covered</span> <span className="inline-st st-warning"><StatusIcon kind="warning" />Not yet covered</span></li>
              <li>Selected chips add a check mark; the selected tab adds a bar and weight.</li>
              <li>Switches say On or Off inside the track.</li>
              <li>Chart values are labelled directly.</li>
            </ul>
          </article>

          <article>
            <h3>Structure and screen readers</h3>
            <ul className="plain">
              <li>Landmarks: header, two labelled navigations, main, footer.</li>
              <li>One h1, then h2 per section and h3 within, in order.</li>
              <li>Every input has a label; hints and errors are linked with aria-describedby.</li>
              <li>The keel is an image with a written equivalent that changes with it.</li>
              <li>Live regions are polite and only speak after an action.</li>
              <li>Native elements first: buttons, inputs, dialog. ARIA only where HTML has nothing (switch, current location).</li>
            </ul>
          </article>

          <article className="a11y-wide">
            <h3>Keyboard</h3>
            <table className="keys">
              <caption className="sr">Keyboard controls on this page</caption>
              <thead><tr><th scope="col">Key</th><th scope="col">What it does</th></tr></thead>
              <tbody>{KEYS.map(([k, d]) => <tr key={k}><th scope="row"><kbd>{k}</kbd></th><td>{d}</td></tr>)}</tbody>
            </table>
          </article>

          <article className="a11y-wide">
            <h3>Resizing</h3>
            <p>Layouts are mobile-first and fluid from 320px. Text sizes are set in px with responsive clamps, containers grow with their content, and nothing has a fixed height that could clip text, so the page holds at 200% zoom.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
