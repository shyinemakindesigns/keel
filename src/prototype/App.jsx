import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { load, save, defaults, reading, fmtDate, money } from './model.js';
import { announce, cssMs } from './util.js';
import { Sheet, TxSheet, AddSheet, NewGoalSheet } from './Sheet.jsx';
import { OnbArt, Welcome, Accounts, Bills, Payday, Taking } from './screens/Onboarding.jsx';
import Home from './screens/Home.jsx';
import Spending from './screens/Spending.jsx';
import Goals from './screens/Goals.jsx';
import Plan from './screens/Plan.jsx';
import Intro from './tour/Intro.jsx';
import Overview from './tour/Overview.jsx';
import Tour from './tour/Tour.jsx';
import GuideSheet from './tour/GuideSheet.jsx';
import { STEPS, SCREEN_GUIDE } from './tour/steps.jsx';
import { getVisitor, setVisitor } from './tour/visitor.js';
import { TabIcon, Mark, GuideIcon } from './icons.jsx';

const TABS = ['home', 'spending', 'goals', 'plan'];
const TAB_LABEL = { home: 'Steady', spending: 'Spending', goals: 'Goals', plan: 'Plan' };
const params = new URLSearchParams(location.search);
const EMBED = params.get('embed') === '1';

export default function App() {
  // ---------------------------------------------------------------- data
  const [S, setS] = useState(load);
  const update = useCallback((fn) => setS((prev) => { const n = structuredClone(prev); fn(n); return n; }), []);
  useEffect(() => { save(S); }, [S]);

  // ---------------------------------------------------------------- screen state
  const [current, setCurrent] = useState(null);
  const focusNext = useRef(false);
  const [focusTick, setFocusTick] = useState(0);
  const [keelStart, setKeelStart] = useState(null);
  const [keelKey, setKeelKey] = useState(0);
  const [whatif, setWhatif] = useState({ value: '', checked: null });
  const [activeCat, setActiveCat] = useState(null);
  const [catsReset, setCatsReset] = useState(0);
  const [planExtra, setPlanExtra] = useState(0);
  const [planConfirm, setPlanConfirm] = useState(null);
  const [goalConfirm, setGoalConfirm] = useState(null);
  const [freshGoal, setFreshGoal] = useState(null);
  const [dailyCut, setDailyCut] = useState(0);
  const [sheet, setSheet] = useState(null);       // { kind, data }
  const [sheetOpen, setSheetOpen] = useState(false);
  const opener = useRef(null);
  const [booting, setBooting] = useState(false);

  // ---------------------------------------------------------------- tour state
  const [tour, setTour] = useState(null);         // { mode: 'tour' | 'guide' | 'finish', step }
  const [demo, setDemoState] = useState({ id: 'current', depth: null });
  const [flags, setFlags] = useState({});
  const [visited, setVisited] = useState([]);

  const go = useCallback((name, opts = {}) => {
    if (name === 'activity') name = 'spending';
    if (opts.fromTaking) { setKeelStart(0.6); setKeelKey((k) => k + 1); }
    focusNext.current = !opts.silent;
    setCurrent(name);
    if (!opts.silent) setFocusTick((t) => t + 1);   // focus even when the screen doesn't change
  }, []);

  // Move focus to the new screen's heading (not for silent, programmatic moves) and
  // tell the case study which screen is showing.
  useLayoutEffect(() => {
    if (!current || !focusNext.current) return;
    {
      // next frame: a closing sheet or the tour's finish may still hold the page inert
      requestAnimationFrame(() => {
        const h = document.querySelector(`[data-screen="${current}"] h1, [data-screen="${current}"] h2`);
        if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      });
    }
  }, [current, focusTick]);
  useEffect(() => {
    if (!current) return;
    try { parent.postMessage({ keel: 'screen', name: current }, '*'); } catch (e) { /* not framed */ }
  }, [current]);

  // tab indicator: one marker that travels between tabs (Connect)
  const tabbar = useRef(null);
  const placeIndicator = useCallback(() => {
    const bar = tabbar.current; if (!bar) return;
    const b = bar.querySelector('[aria-current="page"]'), ind = bar.querySelector('.tab-ind');
    if (!b || !ind) return;
    ind.style.setProperty('--tx', (b.offsetLeft + b.offsetWidth / 2 - 11 - 8) + 'px');
    ind.style.setProperty('--ty', (b.offsetTop + (b.offsetHeight - 28) / 2) + 'px');
  }, []);
  useLayoutEffect(() => { placeIndicator(); }, [current, placeIndicator]);
  useEffect(() => { window.addEventListener('resize', placeIndicator); return () => window.removeEventListener('resize', placeIndicator); }, [placeIndicator]);

  // ---------------------------------------------------------------- sheets
  const openSheet = (kind, data, el) => { opener.current = el || document.activeElement; setSheet({ kind, data }); setSheetOpen(true); };
  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    if (sheet && sheet.kind === 'newgoal' && sheet.data.made) {
      setFreshGoal(sheet.data.made);
      if (current !== 'goals') go('goals', { silent: true });
    }
  }, [sheet, current, go]);
  const openTx = (id, el) => {
    openSheet('tx', { id }, el);
    if (tour && tour.mode !== 'finish' && STEPS[tour.step] && STEPS[tour.step].id === 'detail') setFlags((f) => ({ ...f, sawDetail: true }));
  };
  const openAdd = (id, el) => openSheet('add', { id }, el);
  const openNewGoal = (el) => openSheet('newgoal', {}, el);
  const openGuide = (el) => openSheet('guide', {}, el);

  const confirmAdd = (id, amt) => {
    const g = S.goals.find((x) => x.id === id);
    update((n) => { n.checking -= amt; n.goals.find((x) => x.id === id).saved += amt; });
    closeSheet();
    const after = reading({ ...S, checking: S.checking - amt }, 0);
    setGoalConfirm({ id, text: `Added ${money(amt)}. Steady through ${fmtDate(after.through)}.`, key: Date.now() });
    announce(`Added ${money(amt)} to ${g.name}.`);
    if (tour && STEPS[tour.step] && STEPS[tour.step].id === 'goal') setFlags((f) => ({ ...f, goalAdded: amt }));
  };
  const applyPlan = () => {
    const car = S.goals.find((g) => g.id === 'car');
    if (!planExtra || !car) return;
    const per = car.per + planExtra;
    update((n) => { n.goals.find((g) => g.id === 'car').per = per; });
    setPlanExtra(0);
    setPlanConfirm({ text: `Saved: ${money(per)} each paycheck to Car repair fund.`, key: Date.now() });
    announce('Plan saved.');
  };
  const resetDemo = useCallback(() => {
    try { localStorage.removeItem('keel-demo-v2'); } catch (e) { /* ignore */ }
    setS(defaults()); setActiveCat(null); setCatsReset((n) => n + 1); setPlanExtra(0); setDailyCut(0);
    setWhatif({ value: '', checked: null }); setGoalConfirm(null); setPlanConfirm(null);
    announce('Sample data reset.');
  }, []);

  // ---------------------------------------------------------------- tour actions
  const setDemo = (id, depth) => setDemoState({ id, depth });
  const leaveStep = () => setDemoState({ id: 'current', depth: null });
  const persist = (v) => { if (!EMBED) setVisitor(v); };

  const setStep = useCallback((n) => {
    leaveStep();
    if (n < 0) return;
    if (n >= STEPS.length) { setTour({ mode: 'finish', step: STEPS.length }); persist({ state: 'touring', step: STEPS.length }); return; }
    const st = STEPS[n];
    if (st.id === 'detail') setActiveCat((c) => (c && c !== 'Eating out' ? null : c));
    if (st.id === 'nav') setVisited((v) => (current && TABS.includes(current) && !v.includes(current) ? [...v, current] : v));
    if (st.screen && st.screen !== current) go(st.screen, { silent: true });
    setTour({ mode: 'tour', step: n });
    persist({ state: 'touring', step: n });
  }, [current, go]); // eslint-disable-line react-hooks/exhaustive-deps

  const startTour = useCallback((n = 0) => {
    setFlags({}); setVisited([]); setDemoState({ id: 'current', depth: null });
    const st = STEPS[n];
    if (st.screen) go(st.screen, { silent: true });
    setTour({ mode: 'tour', step: n });
    persist({ state: 'touring', step: n });
  }, [go]); // eslint-disable-line react-hooks/exhaustive-deps

  const endTour = (state) => { leaveStep(); setTour(null); persist({ state }); };
  const exitTour = useCallback(() => {
    const was = tour && tour.mode;
    endTour(getVisitor().state === 'completed' ? 'completed' : 'exploring');
    if (was === 'tour') announce('Tour closed. Restart it any time from Guide.');
  }, [tour]); // eslint-disable-line react-hooks/exhaustive-deps
  const skipTour = () => { endTour('exploring'); go('home'); announce('Tour skipped. Restart it any time from Guide.'); };
  const launch = () => { endTour('completed'); go('home'); };
  const review = () => startTour(0);
  const backToOverview = () => { endTour('completed'); go('overview'); };
  const startOverview = () => go('overview');
  const exploreOwn = () => { persist({ state: 'exploring' }); setTour(null); go('home'); };
  const exploreArea = (screen) => {
    persist({ state: 'exploring' });
    go(screen, { silent: true });
    leaveStep();
    setTour({ mode: 'guide', step: SCREEN_GUIDE[screen] });
  };
  const guideActions = {
    close: closeSheet,
    restartTour: () => { closeSheet(); setTimeout(() => startTour(0), cssMs('--dur-move')); },
    screenGuide: () => { closeSheet(); setTimeout(() => { if (SCREEN_GUIDE[current] !== undefined) { leaveStep(); setTour({ mode: 'guide', step: SCREEN_GUIDE[current] }); } }, cssMs('--dur-move')); },
    overview: () => { closeSheet(); setTour(null); go('overview'); },
    replaySetup: () => { closeSheet(); setTour(null); go('welcome'); },
    reset: () => { resetDemo(); closeSheet(); },
  };

  // track tabs visited during the navigation step
  useEffect(() => {
    if (tour && tour.mode === 'tour' && STEPS[tour.step] && STEPS[tour.step].id === 'nav' && TABS.includes(current)) {
      setVisited((v) => (v.includes(current) ? v : [...v, current]));
    }
  }, [current, tour]);

  // ---------------------------------------------------------------- start
  useEffect(() => {
    if (EMBED) document.body.classList.add('embedded');
    const v = getVisitor();
    const screen = params.get('screen');
    if (screen) go(screen, { silent: true });
    else if (EMBED) go('welcome', { silent: true });
    else if (v.state === 'new') go('intro', { silent: true });
    else if (v.state === 'touring') {
      if (v.step >= STEPS.length) { go('home', { silent: true }); setTour({ mode: 'finish', step: STEPS.length }); }
      else { const st = STEPS[v.step || 0]; go(st.screen || 'home', { silent: true }); setTour({ mode: 'tour', step: v.step || 0 }); }
    } else go('home', { silent: true });
    // Show the loading animation only if fonts take longer than 300ms; never a fake delay.
    let done = false;
    const t = setTimeout(() => { if (!done) setBooting(true); }, 300);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { done = true; setBooting(false); });
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Let the case study page drive the prototype (same messages as before).
  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data || {};
      if (d.keel === 'go' && d.name) go(d.name, { silent: true });
      if (d.keel === 'theme') {
        if (d.value === 'dark' || d.value === 'light') document.documentElement.setAttribute('data-theme', d.value);
        else document.documentElement.removeAttribute('data-theme');
        document.dispatchEvent(new Event('keel-theme'));
      }
      if (d.keel === 'motion') {
        if (d.value === 'reduced') document.documentElement.setAttribute('data-motion', 'reduced');
        else document.documentElement.removeAttribute('data-motion');
      }
      if (d.keel === 'reset') resetDemo();
      if (d.keel === 'whatif') { go('home', { silent: true }); setWhatif({ value: String(d.amount), checked: +d.amount }); }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [go, resetDemo]);

  // ---------------------------------------------------------------- render
  const txCount = activeCat ? S.tx.filter((t) => t.cat === activeCat).length : S.tx.length;
  const app = {
    S, update, current, go, keelStart, whatif, setWhatif, demoDepth: tour && tour.mode !== 'finish' && STEPS[tour.step] && STEPS[tour.step].id === 'keel' ? demo.depth : null,
    activeCat, setActiveCat, catsReset, openTx, openAdd, openNewGoal, openGuide, freshGoal, goalConfirm,
    planExtra, setPlanExtra, applyPlan, planConfirm, dailyCut, setDailyCut, resetDemo,
    startOverview, exploreOwn, exploreArea, startTour,
  };
  const ctx = {
    S, current, go, tour, setStep, exitTour, skipTour, launch, review, backToOverview, startTour,
    demo: demo.id, setDemo, activeCat, txCount, flags, openTx, openAdd, dailyCut, visited,
  };
  const tabbed = TABS.includes(current);
  const sheetData = sheet && sheet.data;

  return (
    <div className="app" id="app">
      <OnbArt current={current} />
      <main id="main" className="screens-main">
        <Intro app={app} />
        <Overview app={app} />
        <Welcome app={app} />
        <Accounts app={app} />
        <Bills app={app} />
        <Payday app={app} />
        <Taking app={app} />
        <Home key={keelKey} app={app} />
        <Spending app={app} />
        <Goals app={app} />
        <Plan app={app} />
      </main>

      <nav className={'tabbar' + (tabbed ? ' on' : '')} id="tabbar" aria-label="Main" ref={tabbar}>
        <div className="rail-brand wordmark"><Mark size={26} />Keel</div>
        <span className="tab-ind" aria-hidden="true"></span>
        {TABS.map((t) => (
          <button key={t} type="button" data-tab={t} aria-current={current === t ? 'page' : undefined} onClick={() => go(t)}>
            <TabIcon name={t} />{TAB_LABEL[t]}
          </button>
        ))}
        <p className="rail-foot">Prototype with sample data. <button className="btn-text" type="button" onClick={(e) => openGuide(e.currentTarget)} style={{ fontSize: 13 }}><GuideIcon size={16} />Guide</button> <button className="btn-text" type="button" onClick={resetDemo} style={{ fontSize: 13 }}>Reset</button></p>
      </nav>

      {tour && <Tour ctx={ctx} />}

      <Sheet open={sheetOpen} onClose={closeSheet} opener={opener}>
        {sheet && sheet.kind === 'tx' && (() => { const t = S.tx.find((x) => x.id === sheetData.id); return t ? <TxSheet key={sheetData.id} t={t} onClose={closeSheet} onSave={(c) => { update((n) => { n.tx.find((x) => x.id === t.id).cat = c; }); announce(`${t.name} moved to ${c}.`); }} /> : null; })()}
        {sheet && sheet.kind === 'add' && (() => { const g = S.goals.find((x) => x.id === sheetData.id); return g ? <AddSheet S={S} g={g} onClose={closeSheet} onConfirm={(amt) => confirmAdd(g.id, amt)} /> : null; })()}
        {sheet && sheet.kind === 'newgoal' && <NewGoalSheet S={S} onClose={closeSheet} onCreate={(g) => { update((n) => { n.goals.push(g); }); setSheet((s) => ({ ...s, data: { made: g.id } })); announce(`${g.name} goal created.`); }} />}
        {sheet && sheet.kind === 'guide' && <GuideSheet S={S} current={current} actions={guideActions} />}
      </Sheet>

      <div className={'boot' + (booting ? ' on' : '')} id="boot" aria-hidden="true"><keel-lottie name="loading" loop="" label=""></keel-lottie><p className="meta">Loading Keel</p></div>
      <p className="sr" id="announce" aria-live="polite"></p>
    </div>
  );
}
