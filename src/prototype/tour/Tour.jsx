import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { STEPS, TOTAL } from './steps.jsx';
import { ArrowLeft, ArrowRight, CloseIcon, GuideIcon, KeelIcon, TourIcon, Chevron } from '../icons.jsx';
import { reduced, cssMs } from '../util.js';
import { useRegion } from '../region.js';

const SCREEN_NAME = { home: 'Steady', spending: 'Spending', goals: 'Goals', plan: 'Plan' };

// Nonmodal guidance anchored to a real element. The ring marks the element by
// thickness and by lifting it out of a light dim, never by color alone; the page
// stays usable underneath. Phones: the panel docks above the tab bar and the
// element is scrolled into the clear space above it. Wide: a popover beside it.
export default function Tour({ ctx }) {
  useRegion();   // step text uses the region's words
  const { tour, current, go, setStep, exitTour, skipTour, launch, review, backToOverview, startTour } = ctx;
  const isFinish = tour.mode === 'finish';
  const step = isFinish ? null : STEPS[tour.step];
  const layer = useRef(null), ring = useRef(null), panel = useRef(null), title = useRef(null);
  const [missing, setMissing] = useState(false);
  const [mode, setMode] = useState('dock');
  const [mini, setMini] = useState(false);   // phones: collapse the panel to one bar to see a tall element
  useEffect(() => { setMini(false); }, [tour.step, tour.mode]);

  // Focus the step's heading when the step changes (announces "Step n of 8: title").
  useEffect(() => {
    const t = setTimeout(() => { if (title.current) title.current.focus({ preventScroll: true }); }, 30);
    return () => clearTimeout(t);
  }, [tour.mode, tour.step]);

  // Animate ring and panel between steps only; while scrolling they track exactly.
  useEffect(() => {
    const l = layer.current; if (!l) return undefined;
    l.classList.add('tp-moving');
    const t = setTimeout(() => l.classList.remove('tp-moving'), cssMs('--dur-move') + 60);
    return () => clearTimeout(t);
  }, [tour.step, tour.mode]);

  // Bring the target into the clear area once its screen has settled in.
  useEffect(() => {
    if (!step) return undefined;
    const t = setTimeout(() => {
      const el = document.querySelector(step.target), app = document.getElementById('app');
      if (!el || !app) return;
      const scroller = el.closest('.screen'); if (!scroller) return;
      const a = app.getBoundingClientRect(), r = el.getBoundingClientRect();
      const wide = a.width >= 900;
      const p = panel.current ? panel.current.getBoundingClientRect() : null;
      const topLimit = a.top + 30;   // room for the step tag above the outline
      const bottomLimit = !wide && p ? p.top - 16 : a.bottom - 24;
      // wide: with no room beside the element, lift it to the top so the popover fits below
      const pw = 400, sideRoom = a.right - r.right >= pw + 36 || r.left - a.left - 232 >= pw + 36;
      const needsLift = wide && !sideRoom && p && r.bottom + 20 + p.height > a.bottom - 16 && r.top > topLimit + 8;
      if (r.top >= topLimit && r.bottom <= bottomLimit && !needsLift) return;
      const delta = r.top - topLimit - (wide && !needsLift ? 48 : 0);
      scroller.scrollBy({ top: delta, behavior: reduced() ? 'auto' : 'smooth' });
    }, reduced() ? 40 : cssMs('--dur-move') + 80);
    return () => clearTimeout(t);
  }, [tour.step, tour.mode, current]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track the target every frame (cheap: one rect read) and place ring and panel.
  useLayoutEffect(() => {
    let raf = 0, last = '';
    const place = () => {
      raf = requestAnimationFrame(place);
      const app = document.getElementById('app'), l = layer.current, rg = ring.current, pn = panel.current;
      if (!app || !l || !pn) return;
      const a = app.getBoundingClientRect();
      const wide = a.width >= 900;
      const el = step ? document.querySelector(step.target) : null;
      const visible = el && el.getClientRects().length > 0 && el.getBoundingClientRect().width > 0;
      const tab = document.getElementById('tabbar');
      const tabH = !wide && tab && getComputedStyle(tab).display !== 'none' ? tab.offsetHeight : 0;
      const ph = wide ? pn.scrollHeight + 2 : pn.offsetHeight, pw = wide ? Math.min(400, a.width - 32) : a.width - 24;
      let px, py, rx = 0, ry = 0, rw = 0, rh = 0, maxH = '';
      if (visible) {
        const r = el.getBoundingClientRect(), pad = 6;
        rx = Math.max(2, r.left - a.left - pad); ry = Math.max(2, r.top - a.top - pad);
        rw = Math.min(a.width - 4 - rx, r.width + pad * 2); rh = Math.min(a.height - 4 - ry, r.height + pad * 2);
      }
      if (!wide || !visible) {
        px = 12; py = a.height - tabH - 12 - ph;
        if (wide) { px = a.width - pw - 24; py = a.height - ph - 24; }
      } else {
        const gap = 20, m = 16;
        const fitsY = (y) => Math.min(Math.max(y, m), a.height - ph - m);
        if (rx + rw + gap + pw <= a.width - m) { px = rx + rw + gap; py = fitsY(ry); }
        else if (rx - gap - pw >= m + 232) { px = rx - gap - pw; py = fitsY(ry); }
        else if (ry + rh + gap + ph <= a.height - m) { py = ry + rh + gap; px = Math.min(Math.max(rx, m), a.width - pw - m); }
        else if (ry - gap - ph >= m) { py = ry - gap - ph; px = Math.min(Math.max(rx, m), a.width - pw - m); }
        else if (a.height - m - (ry + rh + gap) >= 220) {
          // not enough room for the whole panel below: take the room there is and scroll inside
          py = ry + rh + gap; px = Math.min(Math.max(rx, m), a.width - pw - m); maxH = (a.height - m - py) + 'px';
        }
        else { px = a.width - pw - 24; py = a.height - ph - 24; }
      }
      const key = [visible, rx, ry, rw, rh, px, py, pw, wide, maxH].map((v) => (typeof v === 'number' ? Math.round(v) : v)).join(',');
      if (key === last) return;
      last = key;
      if (rg) {
        rg.style.opacity = visible ? '1' : '0';
        rg.style.transform = `translate(${rx}px, ${ry}px)`;
        rg.style.width = rw + 'px'; rg.style.height = rh + 'px';
        rg.classList.toggle('tag-in', ry < 16);
      }
      // docked: give screens room to scroll anything clear of the panel
      app.classList.add('touring');
      app.style.setProperty('--tour-pad', (ph + 24) + 'px');
      pn.style.transform = `translate(${px}px, ${py}px)`;
      pn.style.width = pw + 'px';
      pn.style.maxHeight = maxH;
      setMode(wide && visible ? 'pop' : 'dock');
      setMissing(!!step && !visible);
    };
    raf = requestAnimationFrame(place);
    return () => {
      cancelAnimationFrame(raf);
      const app = document.getElementById('app');
      if (app) { app.classList.remove('touring'); app.style.removeProperty('--tour-pad'); }
    };
  }, [step]);

  // Escape leaves the tour (a sheet, when open, takes Escape first).
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') { if (isFinish) launch(); else exitTour(); } };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [isFinish, exitTour, launch]);

  if (isFinish) return <Finish ctx={ctx} />;

  const n = tour.step + 1;
  const isGuide = tour.mode === 'guide';
  const away = missing && step.screen && current !== step.screen;
  return (
    <div className={'tour-layer' + (isGuide ? ' is-guide' : '')} id="tour-layer" ref={layer}>
      <div className="tour-ring" ref={ring} aria-hidden="true"><span className="tour-ring-tag">{isGuide ? 'This screen' : `Step ${n}`}</span></div>
      <section className={'tour-panel tp-' + mode + (mini && mode === 'dock' ? ' is-mini' : '')} ref={panel} role="dialog" aria-modal="false" aria-labelledby="tp-title" aria-describedby="tp-body">
        <div className="tp-top">
          {isGuide
            ? <p className="tp-progress"><GuideIcon size={18} />Screen guide · {SCREEN_NAME[step.screen] || ''}</p>
            : <p className="tp-progress" aria-hidden="true"><span className="num">Step {n} of {TOTAL}</span><span className="tp-ticks">{Array.from({ length: TOTAL }, (_, i) => <i key={i} className={i < n ? 'on' : ''} />)}</span></p>}
          <span className="tp-top-end">
            {mode === 'dock' && <button type="button" className="tp-x tp-min" aria-expanded={!mini} aria-controls="tp-more" aria-label={mini ? 'Show the step details' : 'Collapse the step details'} onClick={() => setMini(!mini)}><Chevron /></button>}
            <button type="button" className="tp-x" aria-label={isGuide ? 'Close the screen guide' : 'Exit tour'} onClick={exitTour}><CloseIcon /></button>
          </span>
        </div>
        <h2 id="tp-title" ref={title} tabIndex={-1}>{!isGuide && <span className="sr">Step {n} of {TOTAL}: </span>}{step.title}</h2>
        <div id="tp-more" className="tp-more" hidden={mini && mode === 'dock'}>
          <p id="tp-body" className="tp-body">{step.body}<span className="sr"> Highlighted: {step.where}.</span></p>
          {away
            ? <p className="tp-status">This step is on {SCREEN_NAME[step.screen]}. <button type="button" className="btn-text" onClick={() => go(step.screen, { silent: true })}>Go back to {SCREEN_NAME[step.screen]}</button></p>
            : step.extra && step.extra(ctx)}
        </div>
        <div className="tp-foot">
          {isGuide ? (
            <>
              <button type="button" className="btn-text" onClick={() => startTour(0)}><TourIcon />Take the full tour</button>
              <button type="button" className="btn btn-primary tp-next" onClick={exitTour}>Got it</button>
            </>
          ) : (
            <>
              <button type="button" className="btn-text tp-back" onClick={() => setStep(tour.step - 1)} disabled={tour.step === 0}><ArrowLeft />Back</button>
              <button type="button" className="btn-text tp-skip" onClick={skipTour}>Skip tour</button>
              <button type="button" className="btn btn-primary tp-next" onClick={() => setStep(tour.step + 1)}>{tour.step === STEPS.length - 1 ? 'Finish' : 'Next'}<ArrowRight /></button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// The last step: a short, modal moment that hands the visitor the app.
function Finish({ ctx }) {
  const { launch, review, backToOverview } = ctx;
  const box = useRef(null), first = useRef(null);
  useLayoutEffect(() => {
    const els = ['#main', '#tabbar'].map((s) => document.querySelector(s)).filter(Boolean);
    els.forEach((el) => { el.inert = true; });
    const t = setTimeout(() => first.current && first.current.focus(), 40);
    return () => { clearTimeout(t); els.forEach((el) => { el.inert = false; }); };
  }, []);
  const trap = (e) => {
    if (e.key !== 'Tab') return;
    const f = [...box.current.querySelectorAll('button')];
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  };
  return (
    <div className="tour-layer tour-finish" id="tour-layer">
      <div className="tf-scrim" aria-hidden="true" />
      <section className="tf-box" ref={box} role="dialog" aria-modal="true" aria-labelledby="tf-h" aria-describedby="tf-d" onKeyDown={trap}>
        <p className="tp-progress" aria-hidden="true"><span className="num">Step {TOTAL} of {TOTAL}</span><span className="tp-ticks">{Array.from({ length: TOTAL }, (_, i) => <i key={i} className="on" />)}</span></p>
        <span className="tf-mark" aria-hidden="true"><KeelIcon /></span>
        <h2 id="tf-h"><span className="sr">Step {TOTAL} of {TOTAL}: </span>You’re ready to explore.</h2>
        <p id="tf-d">You’ve seen how Keel brings spending, goals, and planning into a steadier view of your money.</p>
        <div className="tf-actions">
          <button ref={first} type="button" className="btn btn-primary btn-block" onClick={launch}>Launch app</button>
          <button type="button" className="btn btn-quiet btn-block" onClick={review}>Review the tour</button>
          <button type="button" className="btn-text" onClick={backToOverview}>Back to overview</button>
        </div>
      </section>
    </div>
  );
}
