import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CATS, money, dayLabel, parse, weightPhrase, reading, fmtDate, fmtLong, daysWord, same, addDays, payday, TODAY } from './model.js';
import { cssMs } from './util.js';

// The sheet: a modal dialog that rises from the bottom (a centered dialog on wide
// screens). While open, the screens, the tab bar and the tour are inert, so focus
// stays inside; Escape, the scrim or a close control dismisses it and focus goes
// back to whatever opened it.
export function Sheet({ open, onClose, children, opener }) {
  const [mounted, setMounted] = useState(open);
  const [on, setOn] = useState(false);
  const ref = useRef(null);

  useLayoutEffect(() => {
    if (open) {
      setMounted(true);
      const r = requestAnimationFrame(() => { void (ref.current && ref.current.offsetWidth); setOn(true); });
      return () => cancelAnimationFrame(r);
    }
    setOn(false);
    const t = setTimeout(() => setMounted(false), cssMs('--dur-move'));
    return () => clearTimeout(t);
  }, [open]);

  useLayoutEffect(() => {
    const els = ['#main', '#tabbar', '#onb-art', '#tour-layer'].map((s) => document.querySelector(s)).filter(Boolean);
    els.forEach((el) => { el.inert = !!open; });
    if (open) {
      const t = setTimeout(() => {
        const f = ref.current && ref.current.querySelector('input[type=radio]:checked, input:not([type=radio]), button');
        if (f) f.focus();
      }, 60);
      return () => clearTimeout(t);
    }
    if (opener && opener.current && opener.current.isConnected) opener.current.focus();
    return undefined;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return undefined;
    const k = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', k, true);
    return () => document.removeEventListener('keydown', k, true);
  }, [open, onClose]);

  return (
    <>
      <div className={'scrim' + (on ? ' on' : '')} id="scrim" onClick={onClose}></div>
      <div className={'sheet' + (on ? ' on' : '')} id="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-h" hidden={!mounted} ref={ref}>
        <div className="grab"></div>
        <div id="sheet-body">{mounted ? children : null}</div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- transaction detail
export function TxSheet({ t, onSave, onClose }) {
  const [cat, setCat] = useState(t.cat);
  const [done, setDone] = useState(null);
  const doneBtn = useRef(null), check = useRef(null);
  useEffect(() => {
    if (!done) return;
    if (check.current && check.current.replay) check.current.replay();
    if (doneBtn.current) doneBtn.current.focus();
  }, [done]);
  if (done) {
    return (
      <>
        <keel-lottie ref={check} className="done-art" name="check" poster="end" label=""></keel-lottie>
        <h2 id="sheet-h" style={{ textAlign: 'center', marginTop: 6 }}>Moved to {done}</h2>
        <p className="lede" style={{ textAlign: 'center' }}>Your reading doesn’t change: the money was already counted.</p>
        <div className="foot"><button ref={doneBtn} className="btn btn-quiet btn-block" type="button" onClick={onClose}>Done</button></div>
      </>
    );
  }
  return (
    <>
      <h2 id="sheet-h">{t.name}</h2>
      <p className="meta" style={{ marginBottom: 14 }}>{dayLabel(parse(t.date))} · {money(t.amt, true)} · {t.cat}</p>
      <p className="lede" data-tour="tx-weight"><b style={{ color: 'var(--ink)' }}>{money(t.amt, true)}</b> is {weightPhrase(t.amt)} of your usual spending. It’s already counted in your reading.</p>
      <form onSubmit={(e) => { e.preventDefault(); if (cat === t.cat) { onClose(); return; } onSave(cat); setDone(cat); }}>
        <fieldset><legend>Category</legend><div className="chips">
          {CATS.map((c) => (
            <label className="radio-chip" key={c}><input type="radio" name="cat" value={c} checked={cat === c} onChange={() => setCat(c)} /><span className="chip">{c}</span></label>
          ))}
        </div></fieldset>
        <div className="foot"><button className="btn btn-primary btn-block" type="submit">Save category</button><button className="btn-text" type="button" onClick={onClose}>Cancel</button></div>
      </form>
    </>
  );
}

// ---------------------------------------------------------------- add to a goal
export function AddSheet({ S, g, onConfirm, onClose }) {
  const [amt, setAmt] = useState(Math.min(50, Math.max(25, g.target - g.saved)));
  const now = reading(S, 0), after = reading(S, amt);
  return (
    <>
      <h2 id="sheet-h">Add to {g.name}</h2>
      <div className="chips" style={{ margin: '14px 0 16px' }} role="group" aria-label="Amount">
        {[25, 50, 100].map((a) => <button key={a} className="chip" type="button" aria-pressed={a === amt} data-add={a} onClick={() => setAmt(a)}>{money(a)}</button>)}
      </div>
      <p className="lede" aria-live="polite">{same(now.through, after.through)
        ? <>Your reading stays at <b style={{ color: 'var(--ink)' }}>{fmtDate(now.through)}</b>.</>
        : <>Your reading would move from {fmtDate(now.through)} to <b style={{ color: 'var(--ink)' }}>{fmtDate(after.through)}</b>, {after.margin >= 0 ? 'still ' + daysWord(after.margin) + ' past payday.' : daysWord(-after.margin) + ' before payday.'}</>}</p>
      <div className="foot"><button className="btn btn-primary btn-block" type="button" data-confirm-add onClick={() => onConfirm(amt)}>Move {money(amt)} to this goal</button><button className="btn-text" type="button" onClick={onClose}>Not now</button></div>
    </>
  );
}

// ---------------------------------------------------------------- new goal
export function NewGoalSheet({ S, onCreate, onClose }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState(1000);
  const [per, setPer] = useState(50);
  const [err, setErr] = useState('');
  const [made, setMade] = useState(null);
  const nameRef = useRef(null), madeArt = useRef(null), seeBtn = useRef(null);
  useEffect(() => {
    if (!made) return;
    if (madeArt.current && madeArt.current.replay) madeArt.current.replay();
    if (seeBtn.current) seeBtn.current.focus();
  }, [made]);
  if (made) {
    return (
      <>
        <keel-lottie ref={madeArt} className="made-art" name="goal-created" poster="end" label="Blocks assemble into a small structure with an ember cap."></keel-lottie>
        <h2 id="sheet-h" style={{ textAlign: 'center' }}>{made.name} is set</h2>
        <p className="lede" style={{ textAlign: 'center' }}>The first {money(made.per)} goes in on {fmtDate(payday(S))}.</p>
        <div className="foot"><button ref={seeBtn} className="btn btn-quiet btn-block" type="button" onClick={onClose}>See it in Goals</button></div>
      </>
    );
  }
  const n = Math.ceil(target / per);
  return (
    <>
      <h2 id="sheet-h">New goal</h2>
      <form noValidate onSubmit={(e) => {
        e.preventDefault();
        const nm = name.trim();
        if (!nm) { setErr('Give it a name so you’ll recognize it.'); nameRef.current.focus(); return; }
        const g = { id: 'g' + Date.now(), name: nm, note: 'Set ' + fmtDate(TODAY), saved: 0, target, per };
        onCreate(g); setMade(g);
      }}>
        <label className="lbl" htmlFor="ng-name">What’s it for?</label>
        <div className="field text"><input id="ng-name" ref={nameRef} name="name" autoComplete="off" placeholder="Winter coat" aria-describedby="ng-err" aria-invalid={err ? 'true' : undefined}
          value={name} onChange={(e) => { setName(e.target.value); if (err) setErr(''); }} /></div>
        <p className="meta" id="ng-err" role="alert" style={{ color: 'var(--negative)', marginTop: 6 }}>{err}</p>
        <fieldset><legend>Target</legend><div className="chips">
          {[500, 1000, 2500].map((v) => <label className="radio-chip" key={v}><input type="radio" name="target" value={v} checked={v === target} onChange={() => setTarget(v)} /><span className="chip">{money(v)}</span></label>)}
        </div></fieldset>
        <fieldset><legend>Each paycheck</legend><div className="chips">
          {[25, 50, 100].map((v) => <label className="radio-chip" key={v}><input type="radio" name="per" value={v} checked={v === per} onChange={() => setPer(v)} /><span className="chip">{money(v)}</span></label>)}
        </div></fieldset>
        <p className="lede" id="ng-est" style={{ marginTop: 16, fontSize: 15 }} aria-live="polite">At {money(per)} a paycheck, you’d get there around <b style={{ color: 'var(--ink)' }}>{fmtLong(addDays(payday(S), 14 * (n - 1)))}</b>. It starts with your next paycheck, so today’s reading doesn’t move.</p>
        <div className="foot"><button className="btn btn-primary btn-block" type="submit">Set this goal</button><button className="btn-text" type="button" onClick={onClose}>Cancel</button></div>
      </form>
    </>
  );
}
