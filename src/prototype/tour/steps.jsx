import { reading, fmtDate, daysWord, weightPhrase, money, DAILY } from '../model.js';
import { depthFor } from '../KeelViz.jsx';
import { CheckIcon } from '../icons.jsx';
import { term } from '../region.js';

// The tour, step by step. Every step names a real element (target), the screen it
// lives on, and what the visitor can do there. The panel mirrors page actions as
// buttons so keyboard and screen reader users never have to hunt for the target.

const KEEL_OPTS = (S) => {
  const m = reading(S, 0).margin;
  return [
    { id: 'less', label: 'Less room', depth: 3, text: 'Less room: the keel shortens to 3 days past payday.' },
    { id: 'current', label: 'Current example', depth: null, text: `Current example: ${daysWord(m)} past payday, from the sample data.` },
    { id: 'more', label: 'More room', depth: 14, text: 'More room: the keel reaches two weeks past payday.' },
  ];
};

export const STEPS = [
  {
    id: 'reading', screen: 'home', target: '[data-tour="reading"]', where: 'the reading at the top of Steady',
    title: 'Start with what is steady.',
    body: 'This date shows how long your available money is projected to cover usual spending and upcoming bills, without counting future income.',
    extra: ({ S }) => <p className="tp-note">In the sample: <b>steady through {fmtDate(reading(S, 0).through)}</b>.</p>,
  },
  {
    id: 'keel', screen: 'home', target: '[data-tour="keel"]', where: 'the keel picture under the date',
    title: 'See your financial room.',
    body: 'The waterline represents payday. The keel extends below it to show how much financial room remains beyond that point.',
    extra: ({ S, demo, setDemo }) => {
      const opts = KEEL_OPTS(S);
      const sel = opts.find((o) => o.id === demo) || opts[1];
      return (
        <>
          <fieldset className="tp-seg">
            <legend>Try an example depth</legend>
            <div>
              {opts.map((o) => (
                <label key={o.id}><input type="radio" name="tp-keel" checked={sel.id === o.id} onChange={() => setDemo(o.id, o.depth)} /><span>{o.label}</span></label>
              ))}
            </div>
          </fieldset>
          <p className="tp-status" aria-live="polite">{sel.text} The dashed outline marks the sample reading. A demonstration only: nothing is recalculated.</p>
        </>
      );
    },
  },
  {
    id: 'spending', screen: 'spending', target: '[data-tour="cats"]', where: 'the category list on Spending',
    title: 'Understand spending without judgment.',
    body: 'Keel helps you understand purchases in relation to your usual spending, rather than treating every category as a limit.',
    extra: ({ activeCat, txCount }) => (
      <>
        <blockquote className="tp-quote">“$16.80 is {weightPhrase(16.8)} of your usual spending.”</blockquote>
        <p className="tp-status" aria-live="polite">{activeCat
          ? <>Showing <b>{activeCat}</b>: {txCount} sample {txCount === 1 ? 'transaction' : 'transactions'}. Select it again to show everything.</>
          : <>Select a category to filter the transactions below. The tick on each bar marks last stretch: a reference, not a ceiling.</>}</p>
      </>
    ),
  },
  {
    id: 'detail', screen: 'spending', target: '[data-tx="t3"]', where: 'the Hana Sushi transaction',
    title: 'Put each purchase in context.',
    body: 'See where money went and how a purchase relates to your everyday spending.',
    extra: ({ flags, openTx }) => (
      <>
        <button type="button" className="btn btn-quiet tp-action" onClick={(e) => openTx('t3', e.currentTarget)}>Open Hana Sushi</button>
        <p className="tp-status" aria-live="polite">{flags.sawDetail
          ? <>That’s the detail view: description, amount, date, category, and what it means in days. Categories can be changed and saved there.</>
          : <>The detail shows the amount, date and category, and puts it in days of usual spending. Close it to come back here.</>}</p>
      </>
    ),
  },
  {
    id: 'goal', screen: 'goals', target: '[data-tour="goal-car"]', where: 'the Car repair fund goal',
    title: 'Make room for what matters.',
    body: 'Set money aside for personal priorities and see your progress without unnecessary pressure.',
    extra: ({ S, flags, openAdd }) => {
      const g = S.goals.find((x) => x.id === 'car');
      return (
        <>
          {g && <p className="tp-note">Target <b>{money(g.target)}</b> · saved <b>{money(g.saved)}</b> · {money(g.per)} each {term('paycheck')}.</p>}
          <button type="button" className="btn btn-quiet tp-action" onClick={(e) => openAdd('car', e.currentTarget)}>Try adding money</button>
          <p className="tp-status" aria-live="polite">{flags.goalAdded
            ? <>Added {money(flags.goalAdded)}. The goal moved, and Steady now shows what it took from {term('checking')}. It changes the sample data; reset it any time from the Guide.</>
            : <>Pick an amount and you’ll see what it does to your reading before you confirm. New goals start from the New goal button.</>}</p>
        </>
      );
    },
  },
  {
    id: 'plan', screen: 'plan', target: '[data-tour="daily"]', where: 'the daily spending scenario on Plan',
    title: 'Explore what could change.',
    body: 'Try a different spending scenario and see how it may affect your projected financial room.',
    extra: ({ S, dailyCut }) => {
      const base = reading(S, 0), adj = reading(S, 0, DAILY - dailyCut);
      const gain = Math.round((adj.through - base.through) / 864e5);
      return (
        <p className="tp-status" aria-live="polite">{dailyCut
          ? <><b>{gain > 0 ? daysWord(gain) + ' more room' : 'No change'}</b> at ${DAILY - dailyCut} a day. Only the daily figure changes.</>
          : <>Choose $5 or $10 less a day to compare. Below, a slider tries saving more each {term('paycheck')}.</>}</p>
      );
    },
  },
  {
    id: 'nav', screen: null, target: '#tabbar', where: 'the tab bar',
    title: 'Everything has its place.',
    body: 'Move between Steady, Spending, Goals, and Plan whenever you need a different perspective.',
    extra: ({ visited }) => {
      const tabs = [['home', 'Steady'], ['spending', 'Spending'], ['goals', 'Goals'], ['plan', 'Plan']];
      const n = tabs.filter(([k]) => visited.includes(k)).length;
      return (
        <>
          <ul className="tp-visits" aria-label={`Tabs visited: ${n} of 4`}>
            {tabs.map(([k, l]) => <li key={k} className={visited.includes(k) ? 'is-done' : ''}><span className="tp-tick" aria-hidden="true">{visited.includes(k) ? <CheckIcon /> : null}</span>{l}<span className="sr">{visited.includes(k) ? ', visited' : ', not yet'}</span></li>)}
          </ul>
          <p className="tp-status" aria-live="polite">{n < 4 ? 'Select each tab. The marker moves to the one you’re on, and every screen keeps its place in the same order.' : 'All four visited. That’s the whole app.'}</p>
        </>
      );
    },
  },
];

export const TOTAL = STEPS.length + 1;   // + the finish
export const SCREEN_GUIDE = { home: 0, spending: 2, goals: 4, plan: 5 };
export { depthFor };
