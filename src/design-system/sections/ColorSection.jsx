import { useEffect, useRef, useState } from 'react';
import { ratio, token, NEEDS, NEED_LABEL } from '../../shared/contrast.js';
import { StatusIcon, Chevron } from '../../shared/Icons.jsx';
import { KeelFigure } from '../../shared/Keel.jsx';

const PRIMITIVES = [
  { group: 'Foundation', items: [
    ['Oxidized Ember', '--oxidized-ember', '#B94F36', 'The brand. Fills primary actions, the hull and selected states. Never small text on Porcelain Clay (4.48:1).'],
    ['Porcelain Clay', '--porcelain-clay', '#F6F3ED', 'The canvas, about 60% of every light screen.'],
    ['Mineral Stone', '--mineral-stone', '#E6E2D9', 'Surfaces: panels, rows, forms, navigation. About 30%.'],
    ['Volcanic Ink', '--volcanic-ink', '#252A28', 'Primary text and the keel itself.'],
    ['Weathered Slate', '--weathered-slate', '#656B66', 'Secondary text on the canvas only.'],
  ] },
  { group: 'Dark foundation', items: [
    ['Basalt', '--basalt', '#202725', 'The dark canvas.'],
    ['Chalk', '--chalk', '#F4F0E7', 'Primary text on Basalt.'],
  ] },
  { group: 'Derived', items: [
    ['Mineral deep', '--mineral-deep', '#DCD7CC', 'The water band and inset wells.'],
    ['Slate deep', '--slate-deep', '#555B56', 'Secondary text inside stone surfaces, where Weathered Slate falls short.'],
    ['Ember text', '--ember-text', '#9E412B', 'Links, text buttons and focus rings on light backgrounds.'],
    ['Ember hover', '--ember-hover', '#A4452F', 'Primary button, hovered.'],
    ['Ember pressed', '--ember-pressed', '#8F3C29', 'Primary button, pressed.'],
    ['Basalt raised', '--basalt-raised', '#2A322F', 'Dark surfaces.'],
    ['Basalt deep', '--basalt-deep', '#353E3A', 'Dark wells and the dark water band.'],
    ['Chalk muted', '--chalk-muted', '#B3B6AE', 'Secondary text on dark.'],
    ['Ember lifted', '--ember-lifted', '#E07F60', 'Ember on dark: the brand hex is only 3.07:1 on Basalt.'],
    ['Ember lifted hover', '--ember-lifted-hover', '#E68D70', 'Dark primary button, hovered.'],
    ['Ember lifted pressed', '--ember-lifted-pressed', '#D9714F', 'Dark primary button, pressed.'],
  ] },
];

const SEMANTIC = [
  ['--canvas', 'Porcelain Clay', 'Basalt'],
  ['--surface', 'Mineral Stone', 'Basalt raised'],
  ['--surface-2', 'Mineral deep', 'Basalt deep'],
  ['--ink', 'Volcanic Ink', 'Chalk'],
  ['--ink-2', 'Weathered Slate', 'Chalk muted'],
  ['--accent', 'Oxidized Ember', 'Ember lifted'],
  ['--accent-hover', 'Ember hover', 'Ember lifted hover'],
  ['--accent-pressed', 'Ember pressed', 'Ember lifted pressed'],
  ['--on-accent', 'White', 'Basalt'],
  ['--accent-ink', 'Ember text', 'Ember lifted'],
  ['--focus', 'Ember text', 'Ember lifted'],
];

// [foreground, background, requirement, note]
const PAIRS = [
  ['--ink', '--canvas', 'text', 'Body text'],
  ['--ink', '--surface', 'text', 'Text on panels'],
  ['--ink-2', '--canvas', 'text', 'Secondary text'],
  ['--ink-2', '--surface', 'text', 'Light: fails, so inside stone surfaces --ink-2 is remapped to Slate deep (next row)'],
  ['--slate-deep', '--surface', 'text', 'Secondary text on stone (light theme only)', 'light'],
  ['--accent-ink', '--canvas', 'text', 'Links and text buttons'],
  ['--accent-ink', '--surface', 'text', 'Links on panels'],
  ['--accent-ink', '--surface-2', 'text', 'Dark: fails, so links never sit on dark wells'],
  ['--accent', '--canvas', 'large', 'Brand ember as large type or graphics only'],
  ['--on-accent', '--accent', 'text', 'Primary button label'],
  ['--on-accent', '--accent-hover', 'text', 'Hovered'],
  ['--on-accent', '--accent-pressed', 'text', 'Pressed'],
  ['--focus', '--canvas', 'ui', 'Focus ring'],
  ['--control', '--canvas', 'ui', 'Input, chip and switch boundaries'],
  ['--control', '--surface', 'ui', 'Boundaries on panels'],
  ['--positive', '--canvas', 'text', 'Status: positive'],
  ['--negative', '--canvas', 'text', 'Status: negative'],
  ['--warning', '--canvas', 'text', 'Status: warning'],
  ['--info', '--canvas', 'text', 'Status: info'],
  ['--positive', '--surface', 'text', 'Status on panels'],
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
          <p className="lede">Mineral &amp; Ember: weathered, mineral neutrals and one oxidized accent. The neutrals carry the screen; ember appears only where there is something to do.</p>
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
        <p className="measure">The same interface, built once on semantic tokens. Dark is designed, not inverted: surfaces step up in lightness, ember lifts so it holds on Basalt, and the button label turns to Basalt because white on lifted ember would fail.</p>
        <div className="themes">
          <figure data-theme="light" className="theme-spec"><figcaption>Light</figcaption><MiniApp id="light" /></figure>
          <figure data-theme="dark" className="theme-spec"><figcaption>Dark</figcaption><MiniApp id="dark" /></figure>
        </div>

        <h3 className="h-part">Contrast, calculated</h3>
        <ContrastTable />

        <div className="two-col status-block">
          <div>
            <h3 className="h-part">Status</h3>
            <p>Four roles, never the brand ember, and always a shape and a word as well as a color. On dark surfaces the same roles step up in lightness to keep their contrast.</p>
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
            <p>Five neutral steps carry every chart. Ember marks the one thing being looked at, and every value has a direct label, so no chart depends on telling colors apart.</p>
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
        <div className="dist" role="img" aria-label="Color proportion: 60% canvas, 30% surface, at most 10% ember.">
          <span style={{ width: '60%' }} className="d-canvas"><b>Canvas</b> 60%</span>
          <span style={{ width: '30%' }} className="d-surface"><b>Surface</b> 30%</span>
          <span style={{ width: '10%' }} className="d-ember"><b>Ember</b> 10%</span>
        </div>
        <p className="dist-note">Ember is reserved for moments of action, selection, and meaningful emphasis. Ten percent is a ceiling, not a quota.</p>
      </div>
    </section>
  );
}
