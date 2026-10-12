import { useEffect, useId, useRef, useState } from 'react';
import { KeelFigure } from '../../shared/Keel.jsx';
import { useSpring } from '../../shared/motion.js';
import { TabIcon, Chevron, CloseIcon, StatusIcon } from '../../shared/Icons.jsx';
import { steadyThrough, roomDays, fmtDate, money, weightPhrase, TRANSACTIONS, SAMPLE } from '../../shared/model.js';

// One documentation block: what it is, why it exists, the live specimen, its
// states, the tokens it uses and what it does for accessibility.
function Doc({ id, letter, name, purpose, tokens, a11y, states, wide, children }) {
  return (
    <article className={'comp' + (wide ? ' comp-wide' : '')} id={id} aria-labelledby={id + '-h'}>
      <div className="comp-meta">
        <h3 id={id + '-h'}>{name}</h3>
        <p>{purpose}</p>
        <dl>
          <dt>Tokens</dt><dd>{tokens.map((t) => <code key={t}>{t}</code>)}</dd>
          <dt>Accessibility</dt><dd>{a11y}</dd>
        </dl>
      </div>
      <div className="comp-stage">
        <div className="stage-live"><span className="stage-tag">Live</span>{children}</div>
        {states && (
          <div className="stage-states">
            <p className="sr">State specimens, shown statically: {states.map((s) => s[0]).join(', ')}.</p>
            <ul aria-hidden="true">{states.map(([label, el]) => <li key={label}>{el}<span>{label}</span></li>)}</ul>
          </div>
        )}
      </div>
    </article>
  );
}

const btnStates = (cls, text) => [
  ['Default', <span className={'btn ' + cls}>{text}</span>],
  ['Hover', <span className={'btn ' + cls + ' is-hover'}>{text}</span>],
  ['Pressed', <span className={'btn ' + cls + ' is-pressed'}>{text}</span>],
  ['Focus', <span className={'btn ' + cls + ' is-focus'}>{text}</span>],
  ['Disabled', <span className={'btn ' + cls + ' is-disabled'}>{text}</span>],
];

function Switch({ checked, onChange, label, disabled, id }) {
  return (
    <div className="switch-row">
      <span id={id}>{label}</span>
      <button type="button" role="switch" aria-checked={checked} aria-labelledby={id} disabled={disabled} className="switch" onClick={() => onChange(!checked)}>
        <span className="switch-track" aria-hidden="true"><span className="switch-word">{checked ? 'On' : 'Off'}</span></span>
      </button>
    </div>
  );
}

function ChipGroup() {
  const opts = ['All spending', 'Essentials', 'Flexible'];
  const [sel, setSel] = useState('All spending');
  return (
    <div>
      <div className="chips" role="group" aria-label="Show spending">
        {opts.map((o) => (
          <button key={o} type="button" className="chip" aria-pressed={sel === o} onClick={() => setSel(o)}>{o}</button>
        ))}
        <button type="button" className="chip" disabled>Savings</button>
      </div>
      <p className="small muted" aria-live="polite">Showing: {sel}. Chips filter what you see; they never set a limit.</p>
    </div>
  );
}

function AmountField() {
  const [v, setV] = useState('');
  const [err, setErr] = useState('');
  const [res, setRes] = useState('');
  const ref = useRef(null);
  const submit = (e) => {
    e.preventDefault();
    const n = parseFloat(v.replace(/[^0-9.]/g, ''));
    if (!(n > 0)) { setErr('Enter an amount greater than zero.'); setRes(''); ref.current.focus(); return; }
    setErr('');
    const m = roomDays(n);
    setRes(`With ${money(n)} spent today, you’d be ${m >= 0 ? 'steady' : 'covered'} through ${fmtDate(steadyThrough(n))}, ${Math.abs(m)} days ${m >= 0 ? 'past' : 'before'} payday.`);
  };
  return (
    <form className="field-form" onSubmit={submit} noValidate>
      <label htmlFor="amt">Thinking about a purchase?</label>
      <p id="amt-hint" className="small muted">See how it would move the example reading before you spend.</p>
      <div className="field-row">
        <div className={'field' + (err ? ' has-error' : '')}>
          <span aria-hidden="true">$</span>
          <input id="amt" ref={ref} inputMode="decimal" autoComplete="off" placeholder="0" value={v}
            onChange={(e) => { setV(e.target.value); if (err) setErr(''); }}
            aria-invalid={err ? 'true' : undefined} aria-describedby={'amt-hint' + (err ? ' amt-err' : '')} />
        </div>
        <button className="btn btn-primary" type="submit">Check</button>
      </div>
      {err && <p id="amt-err" className="field-err"><StatusIcon kind="negative" />{err}</p>}
      <p className="field-res" aria-live="polite">{res}</p>
    </form>
  );
}

function Sheet({ tx, onClose, opener }) {
  const ref = useRef(null);
  const [cat, setCat] = useState(tx ? tx.category : '');
  useEffect(() => {
    const d = ref.current;
    if (!d) return undefined;
    if (tx) { setCat(tx.category); if (!d.open) d.showModal(); }
    else if (d.open) d.close();
    return undefined;
  }, [tx]);
  useEffect(() => {
    const d = ref.current;
    const closed = () => { onClose(); if (opener.current) opener.current.focus(); };
    d.addEventListener('close', closed);
    return () => d.removeEventListener('close', closed);
  }, [onClose, opener]);
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="sheet-h" onClick={(e) => { if (e.target === ref.current) ref.current.close(); }}>
      {tx && (
        <div className="sheet-panel">
          <div className="sheet-top">
            <h4 id="sheet-h">{tx.name}</h4>
            <button type="button" className="icon-btn" onClick={() => ref.current.close()} aria-label="Close"><CloseIcon /></button>
          </div>
          <p className="small muted">{tx.date} · <span className="num">{money(tx.amount)}</span></p>
          <p><b className="num">{money(tx.amount)}</b> is {weightPhrase(tx.amount)} of your usual spending. It’s already counted in the reading.</p>
          <fieldset className="radio-chips">
            <legend>Category</legend>
            {['Groceries', 'Eating out', 'Getting around', 'Everything else'].map((c) => (
              <label key={c} className="radio-chip"><input type="radio" name="sheet-cat" value={c} checked={cat === c} onChange={() => setCat(c)} /><span>{c}</span></label>
            ))}
          </fieldset>
          <div className="sheet-actions">
            <button type="button" className="btn btn-primary" onClick={() => ref.current.close()}>Done</button>
          </div>
        </div>
      )}
    </dialog>
  );
}

function KeelDemo() {
  const OPTS = [['Less room', 3], ['Current example', 9], ['More room', 14]];
  const [days, setDays] = useState(9);
  const shown = useSpring(days);
  const name = useId();
  return (
    <div className="keel-demo">
      <KeelFigure days={shown} descId="kd-desc" label={`Keel indicator: ${days} days of room past payday (illustrative).`} />
      <fieldset className="seg">
        <legend className="sr">Example depth</legend>
        {OPTS.map(([l, d]) => (
          <label key={d}><input type="radio" name={name} checked={days === d} onChange={() => setDays(d)} /><span>{l}</span></label>
        ))}
      </fieldset>
      <p className="small" aria-live="polite"><b>{days} days</b> of room past payday. A depth example only: the control changes the picture, not a forecast.</p>
    </div>
  );
}

function CategoryBars() {
  const rows = [['Groceries', 138.9, 97.9], ['Eating out', 60.55, 52.55, true], ['Getting around', 47.25, 41.25]];
  const max = 160;
  return (
    <div className="cats">
      <ul>
        {rows.map(([n, v, last, hl]) => (
          <li key={n} className={hl ? 'hl' : ''}>
            <div className="cat-top"><span>{n}{hl && <span className="cat-sel"> (selected)</span>}</span><span className="num">{money(v)}</span></div>
            <div className="cat-track" aria-hidden="true">
              <span className="cat-fill" style={{ width: (v / max) * 100 + '%' }} />
              <span className="cat-tick" style={{ left: (last / max) * 100 + '%' }} />
            </div>
            <p className="cat-note">{money(Math.round(v - last))} more than by this point last stretch</p>
          </li>
        ))}
      </ul>
      <p className="cat-legend"><span className="tick-key" aria-hidden="true" />The tick marks what you’d spent by this point last stretch. It’s a reference, not a ceiling.</p>
    </div>
  );
}

function TabBar() {
  const tabs = [['steady', 'Steady'], ['spending', 'Spending'], ['goals', 'Goals'], ['plan', 'Plan']];
  const [cur, setCur] = useState('steady');
  return (
    <div>
      <nav className="tabbar" aria-label="Example app tabs">
        {tabs.map(([k, l]) => (
          <button key={k} type="button" aria-current={cur === k ? 'page' : undefined} onClick={() => setCur(k)}>
            <TabIcon name={k} /><span>{l}</span>
          </button>
        ))}
      </nav>
      <p className="small muted" aria-live="polite">Selected: {tabs.find((t) => t[0] === cur)[1]}</p>
    </div>
  );
}

export default function ComponentsSection() {
  const [on, setOn] = useState(false);
  const [tx, setTx] = useState(null);
  const opener = useRef(null);
  const open = (t, e) => { opener.current = e.currentTarget; setTx(t); };
  const through = fmtDate(steadyThrough(0));
  const room = roomDays(0);

  return (
    <section id="components" className="sec" aria-labelledby="comp-h">
      <div className="wrap">
        <header className="sec-head">
          <span className="sec-num" aria-hidden="true">05</span>
          <h2 id="comp-h">Components</h2>
          <p className="lede">Working parts of one product, not a sticker sheet. Each specimen below is live: try it with a mouse, a keyboard, or both themes. Amounts come from Keel’s illustrative sample data.</p>
        </header>

        <h3 className="h-part">Signature</h3>
        <Doc id="c-reading" letter="J" name="Steady-through reading" wide
          purpose="The answer first. A projected coverage date, not a balance: how long the money in the example covers usual spending and bills, ignoring future income."
          tokens={['Fraunces 400, opsz 144', '--ink', '--ink-2']}
          a11y="The date is plain text in one paragraph, read as a sentence. No color carries meaning.">
          <div className="reading">
            <p className="r-k">You’re steady through</p>
            <p className="r-date num">{through}</p>
            <p className="r-sub"><b>{room} days past</b> your next payday on Oct 16. Your bills before then are already set aside.</p>
            <p className="r-note small muted">Projected coverage date for the sample data. It walks forward from today and leaves future income out on purpose.</p>
          </div>
        </Doc>

        <Doc id="c-keel" letter="K" name="Keel indicator" wide
          purpose="The reading as a picture. The waterline is always payday; the keel’s depth is the room past it, from a stub at zero to two weeks."
          tokens={['--m-line', '--accent', '--m-water', 'spring k 70, c 15']}
          a11y="An SVG with role img and a description that updates with the depth; the sentence below repeats it as text. With reduced motion it jumps to the new depth.">
          <KeelDemo />
        </Doc>

        <h3 className="h-part">Actions</h3>
        <Doc id="c-primary" letter="A" name="Primary button"
          purpose="One per view, for the action that moves things forward."
          tokens={['--accent', '--accent-hover', '--accent-pressed', '--on-accent', '--radius-md']}
          a11y="44px tall. White on ember is 4.96:1; in dark, Basalt on lifted ember. The disabled state uses the disabled attribute, not just a color."
          states={btnStates('btn-primary', 'Save plan')}>
          <div className="row-gap"><button type="button" className="btn btn-primary">Save plan</button><button type="button" className="btn btn-primary" disabled>Save plan</button></div>
        </Doc>
        <Doc id="c-secondary" letter="B" name="Secondary button"
          purpose="Supporting actions that sit beside a primary one."
          tokens={['--canvas', '--control', '--ink', '--tint']}
          a11y="Same 44px target and focus ring as the primary. Its boundary meets 3:1 against the surface it sits on."
          states={btnStates('btn-secondary', 'Add money')}>
          <div className="row-gap"><button type="button" className="btn btn-secondary">Add money</button><button type="button" className="btn btn-secondary" disabled>Add money</button></div>
        </Doc>
        <Doc id="c-text" letter="C" name="Text button"
          purpose="Quiet, secondary moves: see more, cancel, clear."
          tokens={['--accent-ink', '--ink']}
          a11y="The label is ink with an ember-text underline, so it never relies on small ember text. 44px tall even though it looks light."
          states={[
            ['Default', <span className="btn-text">See all transactions</span>],
            ['Hover', <span className="btn-text is-hover">See all transactions</span>],
            ['Focus', <span className="btn-text is-focus">See all transactions</span>],
            ['Disabled', <span className="btn-text is-disabled">See all transactions</span>],
          ]}>
          <button type="button" className="btn-text">See all transactions</button>
        </Doc>

        <h3 className="h-part">Inputs and selection</h3>
        <Doc id="c-switch" letter="D" name="Switch"
          purpose="Turns one thing on or off, effective immediately, like pausing a bill."
          tokens={['--accent', '--control', '--canvas', '--on-accent']}
          a11y="A button with role switch and aria-checked. Space or Enter toggles it. The word On or Off sits inside the track, so state isn’t color alone."
          states={[
            ['Off', <span className="switch"><span className="switch-track"><span className="switch-word">Off</span></span></span>],
            ['On', <span className="switch is-on"><span className="switch-track"><span className="switch-word">On</span></span></span>],
            ['Focus', <span className="switch is-focus"><span className="switch-track"><span className="switch-word">Off</span></span></span>],
            ['Disabled', <span className="switch is-disabled"><span className="switch-track"><span className="switch-word">Off</span></span></span>],
          ]}>
          <Switch id="sw1" label="Pause the gym membership" checked={on} onChange={setOn} />
          <p className="small muted" aria-live="polite">{on ? 'Gym paused: the example reading would move to Oct 26.' : 'Gym is on: the example reading is Oct 25.'}</p>
          <Switch id="sw2" label="Round-ups (not available)" checked={false} onChange={() => {}} disabled />
        </Doc>
        <Doc id="c-chips" letter="E" name="Chips"
          purpose="Filter a view. One selected at a time. They narrow what you see; they are never limits."
          tokens={['--surface', '--control', '--accent', '--on-accent', '--radius-sm']}
          a11y="Buttons with aria-pressed, in a labelled group. Selected adds a check mark and bolder weight as well as the fill."
          states={[
            ['Unselected', <span className="chip">Essentials</span>],
            ['Selected', <span className="chip is-selected">Essentials</span>],
            ['Hover', <span className="chip is-hover">Essentials</span>],
            ['Focus', <span className="chip is-focus">Essentials</span>],
            ['Disabled', <span className="chip is-disabled">Savings</span>],
          ]}>
          <ChipGroup />
        </Doc>
        <Doc id="c-input" letter="F" name="Input"
          purpose="Numbers and short text. The purchase check is the most used input in Keel."
          tokens={['--canvas', '--control', '--focus', '--negative']}
          a11y="A visible label, a hint linked with aria-describedby, and on error aria-invalid plus a message with an icon, linked the same way. Focus returns to the field."
          states={[
            ['Empty', <span className="field"><span>$</span><span className="ph">0</span></span>],
            ['Filled', <span className="field"><span>$</span><span>40</span></span>],
            ['Focused', <span className="field is-focus"><span>$</span><span>40</span></span>],
            ['Error', <span className="field-spec"><span className="field has-error"><span>$</span><span>0</span></span><span className="field-err"><StatusIcon kind="negative" />Enter an amount greater than zero.</span></span>],
            ['Disabled', <span className="field is-disabled"><span>$</span><span className="ph">0</span></span>],
          ]}>
          <AmountField />
        </Doc>

        <h3 className="h-part">Lists, navigation and layers</h3>
        <Doc id="c-row" letter="G" name="List row"
          purpose="A transaction. The whole row is one button that opens its details."
          tokens={['--surface', '--rule', '--ink', '--ink-2']}
          a11y="One button per row, named by its contents. The chevron says it opens something; the amount uses tabular figures."
          states={null}>
          <ul className="rows">
            {TRANSACTIONS.map((t) => (
              <li key={t.id}>
                <button type="button" className="row" onClick={(e) => open(t, e)}>
                  <span className="row-main"><b>{t.name}</b><small>{t.category} · {t.date}</small></span>
                  <span className="num row-amt">{money(t.amount)}</span>
                  <Chevron />
                </button>
              </li>
            ))}
          </ul>
        </Doc>
        <Doc id="c-tabs" letter="H" name="Bottom tab navigation"
          purpose="The app’s four questions. Steady: am I okay? Spending: where did it go? Goals: what am I setting aside? Plan: what if I changed something?"
          tokens={['--canvas', '--accent', '--ink', '--ink-2']}
          a11y="Each tab is a 44px-plus button with an icon and a visible label. The selected tab gets aria-current, an ember bar and a bolder label."
          states={null}>
          <TabBar />
        </Doc>
        <Doc id="c-sheet" letter="I" name="Sheet"
          purpose="Details and quick edits without leaving the screen."
          tokens={['--canvas', '--scrim', '--lift', '--ease-enter', '--duration-move']}
          a11y="A modal dialog: focus moves in and stays in, the page behind is inert, Escape or Close dismisses it, and focus returns to what opened it."
          states={null}>
          <button type="button" className="btn btn-secondary" onClick={(e) => open(TRANSACTIONS[1], e)}>Open sheet</button>
          <p className="small muted">Also opens from either list row.</p>
        </Doc>
        <Doc id="c-cat" letter="L" name="Category bar"
          purpose="Where spending went, as weight. Neutral bars, ember only for the category you’re looking at, and a tick for last stretch."
          tokens={['--chart-1', '--chart-highlight', '--surface-2', '--ink']}
          a11y="Every bar has its name and amount as text, and the note under it says how it compares, so the tick is never the only carrier of meaning."
          states={null}>
          <CategoryBars />
        </Doc>
      </div>
      <Sheet tx={tx} onClose={() => setTx(null)} opener={opener} />
    </section>
  );
}
