import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Screen from '../Screen.jsx';
import { GuideButton } from '../tour/GuideButton.jsx';
import { goalEstimateText, money } from '../model.js';
import { reduced, tween } from '../util.js';

// A confirmation that settles in, says what happened in words, then leaves (4s).
export function Confirm({ msg, id }) {
  const lot = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!msg) return undefined;
    setOn(true);
    if (lot.current && lot.current.replay) lot.current.replay();
    const t = setTimeout(() => setOn(false), 4000);
    return () => clearTimeout(t);
  }, [msg && msg.key]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={'confirm' + (on ? ' on' : '')} id={id} aria-live="polite">
      <keel-lottie ref={lot} name="complete" poster="end" label=""></keel-lottie><span>{msg ? msg.text : ''}</span>
    </div>
  );
}

function GoalCard({ S, g, fresh, confirm, onAdd, active }) {
  const lot = useRef(null), card = useRef(null);
  const shown = useRef(0);
  const [savedText, setSavedText] = useState(money(0));
  const [entered, setEntered] = useState(!fresh);
  const p = Math.min(1, g.saved / g.target);

  useLayoutEffect(() => {
    if (!fresh) return undefined;
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, [fresh]);

  useEffect(() => {
    if (!active) return undefined;
    const from = shown.current;
    shown.current = g.saved;
    const stop = tween(from, g.saved, reduced() ? 0 : 900, (x) => setSavedText(money(Math.round(x))));
    const el = lot.current;
    if (el && el.scrubTo) {
      // Goal Progress (Lottie 05, progress-mapped): frames 0-200 are linear in progress
      el.scrubTo(p, { from: 0, to: 200, duration: reduced() ? 0 : 900 }).then(() => { if (p >= 1) el.playSegment(200, 259); });
    }
    return stop;
  }, [g.saved, g.target, active]); // eslint-disable-line react-hooks/exhaustive-deps

  const label = 'Progress: ' + money(g.saved) + ' of ' + money(g.target) + ' saved, ' + Math.round(p * 100) + ' percent.';
  return (
    <article ref={card} className={'panel card goal' + (fresh ? ' goal-new' : '') + (fresh && entered ? ' in' : '')} aria-labelledby={'gh-' + g.id} data-tour={'goal-' + g.id}>
      <h2 id={'gh-' + g.id}>{g.name}</h2><p className="meta">{g.note}</p>
      <keel-lottie ref={lot} className="progress" name="goal" poster="start" label="Goal progress" aria-label={label}></keel-lottie>
      <div className="nums"><div><b className="g-saved">{savedText}</b><div className="meta">saved</div></div><div style={{ textAlign: 'right' }}><b>{money(g.target)}</b><div className="meta">goal</div></div></div>
      <p className="est">{goalEstimateText(S, g)}</p>
      <div className="actions"><button className="btn btn-quiet" type="button" data-goal-add={g.id} onClick={(e) => onAdd(g.id, e.currentTarget)}>Add money</button></div>
      <Confirm msg={confirm && confirm.id === g.id ? confirm : null} />
    </article>
  );
}

export default function Goals({ app }) {
  const { S, current, freshGoal, goalConfirm, openAdd, openNewGoal, openGuide } = app;
  return (
    <Screen name="goals" current={current} className="tabbed" labelledBy="g-h">
      <div className="head head-row">
        <div><h1 id="g-h" className="page">Goals</h1><p className="meta" style={{ marginTop: 4 }}>Money you’re setting aside on purpose</p></div>
        <div className="head-actions">
          <GuideButton onClick={openGuide} />
          <button className="btn btn-quiet btn-sm" id="goal-new" type="button" onClick={(e) => openNewGoal(e.currentTarget)}>New goal</button>
        </div>
      </div>
      <div className="goal-list" id="goal-list" style={{ marginTop: 20 }}>
        {S.goals.map((g) => (
          <GoalCard key={g.id} S={S} g={g} fresh={freshGoal === g.id} confirm={goalConfirm} onAdd={openAdd} active={current === 'goals'} />
        ))}
      </div>
      <p className="note">Moving money into a goal takes it out of checking, so Keel shows what it does to your reading before you confirm.</p>
    </Screen>
  );
}
