import { useEffect, useRef, useState } from 'react';
import { ratio, token, NEEDS, NEED_LABEL } from '../../shared/contrast.js';
import { StatusIcon, Chevron } from '../../shared/Icons.jsx';
import { KeelFigure } from '../../shared/Keel.jsx';

const PRIMITIVES = [
  { group: 'Foundation', items: [
    ['Fog White', '--fog', '#F4F5FA', 'The canvas, about 60% of every light screen. Cool grey-white, so white cards read as raised.'],
    ['Paper', '--paper', '#FFFFFF', 'Surfaces: cards, panels, rows, forms. About 30%.'],
    ['Deep Navy', '--deep', '#112358', 'Primary text, the keel, and primary buttons in light.'],
    ['Slate', '--slate', '#4A5573', 'Secondary text. Passes on every light surface (6.0:1 at the lowest).'],
    ['Signal Lime', '--signal', '#F1FF62', 'The one accent: button labels on navy, the hull, selected states. A fill, never text on light (1.1:1).'],
  ] },
  { group: 'Blues', items: [
    ['Harbor Blue', '--harbor', '#004499', 'Links, text buttons and focus rings on light.'],
    ['Ocean Blue', '--ocean', '#0192C6', 'The highlighted data series. Marks only, never text.'],
    ['Mist Blue', '--mist', '#D4EAFF', 'The water band in the reading, and info tints.'],
    ['Cloud', '--cloud', '#E9EDF5', 'Wells, quiet fills and disabled states.'],
  ] },
  { group: 'Dark foundation', items: [
    ['Abyss', '--abyss', '#0B1530', 'The dark canvas.'],
    ['Night', '--night', '#1A2E66', 'Dark wells and the dark water band. Deep Navy is the dark surface.'],
    ['Frost', '--frost', '#AEB9D6', 'Secondary text on dark.'],
    ['Ocean lifted', '--ocean-lifted', '#3DB8EA', 'The data highlight on dark.'],
  ] },
  { group: 'Derived for interaction', items: [
    ['Navy hover', '--deep-hover', '#1E3576', 'Primary button, hovered (light).'],
    ['Navy pressed', '--deep-pressed', '#0A1638', 'Primary button, pressed (light).'],
    ['Lime hover', '--signal-hover', '#F5FF8C', 'Primary button, hovered (dark).'],
    ['Lime pressed', '--signal-pressed', '#E3F24A', 'Primary button, pressed (dark).'],
  ] },
];

const SEMANTIC = [
  ['--canvas', 'Fog White', 'Abyss'],
  ['--surface', 'Paper', 'Deep Navy'],
  ['--surface-2', 'Cloud', 'Night'],
  ['--ink', 'Deep Navy', 'Fog White'],
  ['--ink-2', 'Slate', 'Frost'],
  ['--accent', 'Deep Navy', 'Signal Lime'],
  ['--accent-hover', 'Navy hover', 'Lime hover'],
  ['--accent-pressed', 'Navy pressed', 'Lime pressed'],
  ['--on-accent', 'Signal Lime', 'Deep Navy'],
  ['--accent-ink', 'Harbor Blue', 'Signal Lime'],
  ['--focus', 'Harbor Blue', 'Signal Lime'],
];

// [foreground, background, requirement, note, only]
const PAIRS = [
  ['--ink', '--canvas', 'text', 'Body text'],
  ['--ink', '--surface', 'text', 'Text on cards'],
  ['--ink', '--surface-2', 'text', 'Text in wells'],
  ['--ink-2', '--canvas', 'text', 'Secondary text'],
  ['--ink-2', '--surface', 'text', 'Secondary text on cards'],
  ['--ink-2', '--surface-2', 'text', 'Secondary text in wells'],
  ['--accent-ink', '--canvas', 'text', 'Links and text buttons'],
  ['--accent-ink', '--surface', 'text', 'Links on cards'],
  ['--signal', '--canvas', 'text', 'Light: fails (1.1:1), so lime is never text or an unedged shape on light. Dark: the action color', 'light'],
  ['--on-accent', '--accent', 'text', 'Primary button label'],
  ['--on-accent', '--accent-hover', 'text', 'Hovered'],
  ['--on-accent', '--accent-pressed', 'text', 'Pressed'],
  ['--focus', '--canvas', 'ui', 'Focus ring'],
  ['--focus', '--surface', 'ui', 'Focus ring on cards'],
  ['--control', '--canvas', 'ui', 'Input, chip and switch boundaries'],
  ['--control', '--surface', 'ui', 'Boundaries on cards'],
  ['--chart-highlight', '--canvas', 'ui', 'The selected data series'],
  ['--positive', '--canvas', 'text', 'Status: positive'],
  ['--negative', '--canvas', 'text', 'Status: negative'],
  ['--warning', '--canvas', 'text', 'Status: warning'],
  ['--info', '--canvas', 'text', 'Status: info'],
  ['--positive', '--surface', 'text', 'Status on cards'],
];

function Verdict({ r, need }) {
  if (r === null) return <span className="verdict na">Not used</span>;
  const pass = r >= NEEDS[need];
  return (
    <span className={'verdict ' + (pass ? 'pass' : 'fail')}>
      <span className="num">{r.toFixed(2)}:1</span>
      <span className="v-word"><StatusIcon kind={pass ? 'positive' : 'negative'} />{pass ? 'Pass' : 'Fail'}</span>
    </span>
  );
}

function ContrastTable() {
  const light = useRef(null), dark = useRef(null);
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const measure = (el, fg, bg) => ratio(token(el, fg), token(el, bg));
    setRows(PAIRS.map(([fg, bg, need, note, only]) => ({
      fg, bg, need, note,
      light: only === 'dark' ? null : measure(light.current, fg, bg),
      dark: only === 'light' ? null : measure(dark.current, fg, bg),
      lightColors: [token(light.current, fg), token(light.current, bg)],
      darkColors: [token(dark.current, fg), token(dark.current, bg)],
    })));
  }, []);
  const passes = rows.reduce((n, r) => n + (r.light !== null && r.light >= NEEDS[r.need]) + (r.dark !== null && r.dark >= NEEDS[r.need]), 0);
  const total = rows.reduce((n, r) => n + (r.light !== null) + (r.dark !== null), 0);
  return (
    <>
      <div className="probe" data-theme="light" ref={light} aria-hidden="true" />
      <div className="probe" data-theme="dark" ref={dark} aria-hidden="true" />
      <p className="small muted">Calculated in your browser from the rendered token values, using the WCAG relative-luminance formula; translucent colors are composited over their background first. {rows.length > 0 && <>{passes} of {total} pairings pass. The failures are documented on purpose: each one is a rule about where a color may not go.</>}</p>
      <div className="ctable" role="table" aria-label="Contrast of token pairings in both themes">
        <div className="ct-row ct-head" role="row">
          <span role="columnheader">Foreground on background</span>
          <span role="columnheader">Requirement</span>
          <span role="columnheader">Light theme</span>
          <span role="columnheader">Dark theme</span>
        </div>
        {rows.map((r, i) => (
          <div className="ct-row" role="row" key={i}>
            <span role="cell" className="ct-pair">
              <span className="ct-chips" aria-hidden="true">
                <i style={{ background: r.lightColors[1] }}><b style={{ background: r.lightColors[0] }} /></i>
                <i style={{ background: r.darkColors[1] }}><b style={{ background: r.darkColors[0] }} /></i>
              </span>
              <span><code>{r.fg}</code> on <code>{r.bg}</code><small>{r.note}</small></span>
            </span>
            <span role="cell" className="ct-need"><span className="ct-lbl">Requirement: </span>{NEED_LABEL[r.need]}</span>
            <span role="cell"><span className="ct-lbl">Light: </span><Verdict r={r.light} need={r.need} /></span>
            <span role="cell"><span className="ct-lbl">Dark: </span><Verdict r={r.dark} need={r.need} /></span>
          </div>
        ))}
      </div>
    </>
  );
}

function MiniApp({ id }) {
  return (
    <div className="mini">
      <p className="mini-k">You’re steady through</p>
      <p className="mini-date num">Oct 25</p>
      <p className="mini-sub"><b>9 days past</b> your next payday.</p>
      <KeelFigure days={9} scale={false} descId={'mini-' + id} label="Keel at 9 days of room." className="mini-keel" />
      <div className="mini-row"><span><b>Hana Sushi</b><small>Eating out · Oct 7</small></span><span className="num">$16.80</span><Chevron /></div>
      <p className="mini-status"><StatusIcon kind="positive" />Rent is covered</p>
      <span className="btn btn-primary mini-btn">Check a purchase</span>
    </div>
  );
}

export default function ColorSection() {
  return (
    <section id="color" className="sec" aria-labelledby="color-h">
      <div className="wrap">
        <header className="sec-head">
          <span className="sec-num" aria-hidden="true">02</span>
          <h2 id="color-h">Color</h2>
          <p className="lede">Harbor &amp; Signal: cool grey-white surfaces, deep navy type and one lime signal. The neutrals carry the screen; lime appears only where there is something to do. Source palette: MP174 by Alex Cristache, extended with accessible greys, status colors and a dark theme.</p>
        </header>

        <h3 className="h-part">Primitive palette</h3>
        {PRIMITIVES.map((g) => (
          <div className="prim-group" key={g.group}>
            <h4>{g.group}</h4>
            <ul className="prims">
              {g.items.map(([name, tok, hex, use]) => (
                <li key={tok}>
                  <span className="prim-sw" style={{ background: `var(${tok})` }} />
                  <span className="prim-name">{name}</span>
                  <code className="prim-hex">{hex}</code>
                  <span className="prim-use">{use}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="two-col">
          <div>
            <h3 className="h-part">Semantic layer</h3>
            <p>Components never use a primitive directly. They ask for a role, and the theme answers.</p>
          </div>
          <table className="sem">
            <caption className="sr">Semantic tokens and the primitive each maps to in each theme</caption>
            <thead><tr><th scope="col">Token</th><th scope="col">Light</th><th scope="col">Dark</th></tr></thead>
            <tbody>
              {SEMANTIC.map(([t, l, d]) => (
                <tr key={t}>
                  <th scope="row"><code>{t}</code></th>
                  <td><span data-theme="light" className="sem-sw" style={{ background: `var(${t})` }} aria-hidden="true" />{l}</td>
                  <td><span data-theme="dark" className="sem-sw" style={{ background: `var(${t})` }} aria-hidden="true" />{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="h-part">Light and dark</h3>
        <p className="measure">The same interface, built once on semantic tokens. Dark is designed, not inverted: three layered navies, and lime becomes the action color with navy labels. In light, the primary button is navy with a lime label, because lime on a light surface is 1.1:1.</p>
        <div className="themes">
          <figure data-theme="light" className="theme-spec"><figcaption>Light</figcaption><MiniApp id="light" /></figure>
          <figure data-theme="dark" className="theme-spec"><figcaption>Dark</figcaption><MiniApp id="dark" /></figure>
        </div>

        <h3 className="h-part">Contrast, calculated</h3>
        <ContrastTable />

        <div className="two-col status-block">
          <div>
            <h3 className="h-part">Status</h3>
            <p>Four roles, never the brand lime, and always a shape and a word as well as a color. On dark surfaces the same roles step up in lightness to keep their contrast.</p>
          </div>
          <ul className="statuses">
            <li className="st-positive"><StatusIcon kind="positive" /><span><b>Positive</b>Rent is covered.</span><code>--status-positive</code></li>
            <li className="st-warning"><StatusIcon kind="warning" /><span><b>Warning</b>Internet isn’t covered yet: it’s due before payday.</span><code>--status-warning</code></li>
            <li className="st-negative"><StatusIcon kind="negative" /><span><b>Negative</b>Your bank didn’t sync. This reading may be out of date.</span><code>--status-negative</code></li>
            <li className="st-info"><StatusIcon kind="info" /><span><b>Info</b>Payday is Thursday, Oct 16.</span><code>--status-info</code></li>
          </ul>
        </div>

        <div className="two-col">
          <div>
            <h3 className="h-part">Data</h3>
            <p>Five navy steps carry every chart. Ocean Blue marks the one thing being looked at, and every value has a direct label, so no chart depends on telling colors apart.</p>
            <ol className="ramp">
              {[1, 2, 3, 4, 5].map((n) => (<li key={n}><span style={{ background: `var(--chart-${n})` }} /><code>--data-{n}</code></li>))}
              <li><span style={{ background: 'var(--chart-highlight)' }} /><code>--data-highlight</code></li>
            </ol>
          </div>
          <figure className="spend">
            <figcaption>This stretch, by category <span className="muted">(illustrative)</span></figcaption>
            <div className="spend-bar" aria-hidden="true">
              {[['data', 1, 138.9], ['hl', 0, 60.55], ['data', 3, 47.25], ['data', 4, 47.59], ['data', 5, 12.15]].map(([k, n, v], i) => (
                <span key={i} style={{ flexGrow: v, background: k === 'hl' ? 'var(--chart-highlight)' : `var(--chart-${n})` }} />
              ))}
            </div>
            <ul className="spend-list">
              <li><i style={{ background: 'var(--chart-1)' }} />Groceries<span className="num">$138.90</span></li>
              <li className="sel"><i style={{ background: 'var(--chart-highlight)' }} /><span>Eating out <em>(selected)</em></span><span className="num">$60.55</span></li>
              <li><i style={{ background: 'var(--chart-3)' }} />Getting around<span className="num">$47.25</span></li>
              <li><i style={{ background: 'var(--chart-4)' }} />Everything else<span className="num">$47.59</span></li>
              <li><i style={{ background: 'var(--chart-5)' }} />Health<span className="num">$12.15</span></li>
            </ul>
          </figure>
        </div>

        <h3 className="h-part">Distribution</h3>
        <div className="dist" role="img" aria-label="Color proportion: 60% canvas, 30% surface, at most 10% accent.">
          <span style={{ width: '60%' }} className="d-canvas"><b>Canvas</b> 60%</span>
          <span style={{ width: '30%' }} className="d-surface"><b>Surface</b> 30%</span>
          <span style={{ width: '10%' }} className="d-accent"><b>Accent</b> 10%</span>
        </div>
        <p className="dist-note">The accent (navy fills with lime in light, lime in dark) is reserved for action, selection and meaningful emphasis. Ten percent is a ceiling, not a quota.</p>
      </div>
    </section>
  );
}
