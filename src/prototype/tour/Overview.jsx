import Screen from '../Screen.jsx';
import { SteadyMark, WeightIcon, CairnIcon, CoursesIcon, ArrowRight, ArrowLeft, TourIcon } from '../icons.jsx';
import { usePrefsTheme } from './useTheme.js';

export const AREAS = [
  { screen: 'home', name: 'Steady', q: 'Am I okay?', Icon: SteadyMark,
    d: 'See how long your available money is projected to cover everyday spending and upcoming bills.',
    f: 'The steady-through date and the keel indicator.' },
  { screen: 'spending', name: 'Spending', q: 'Where did it go?', Icon: WeightIcon,
    d: 'Understand spending patterns and see everyday purchases in the context of your usual spending.',
    f: 'Transaction history and spending weight.' },
  { screen: 'goals', name: 'Goals', q: 'What am I setting aside?', Icon: CairnIcon,
    d: 'Organize money for the things that matter without turning progress into pressure.',
    f: 'Savings goals and progress.' },
  { screen: 'plan', name: 'Plan', q: 'What if I changed something?', Icon: CoursesIcon,
    d: 'Explore how different spending decisions could affect your financial outlook.',
    f: 'Interactive financial scenarios.' },
];

// The map before the journey: four tabs, four questions, each previewed with a
// capture of the real screen (light or dark to match the theme).
export default function Overview({ app }) {
  const { current, startTour, exploreArea, exploreOwn, go } = app;
  const theme = usePrefsTheme();
  return (
    <Screen name="overview" current={current} className="overview" labelledBy="ov-h">
      <button className="btn-text ov-back" type="button" onClick={() => go('intro')}><ArrowLeft />Back</button>
      <p className="step">App overview</p>
      <h1 id="ov-h">Four places, four questions.</h1>
      <p className="lede ov-lede">Keel is organized around the questions people actually ask about money. Each lives in its own tab, always in the same place.</p>
      <ol className="ov-list">
        {AREAS.map(({ screen, name, q, d, f, Icon }, i) => (
          <li key={screen} className="ov-item">
            <div className="ov-text">
              <p className="ov-name"><span className="ov-icon"><Icon /></span><span className="ov-num" aria-hidden="true">{i + 1}</span>{name}</p>
              <h2 className="ov-q">{q}</h2>
              <p className="ov-d">{d}</p>
              <p className="ov-f"><span>Main feature</span>{f}</p>
              <button className="btn-text ov-go" type="button" onClick={(e) => exploreArea(screen, e.currentTarget)}>Explore {name}<ArrowRight /></button>
            </div>
            <figure className="ov-shot">
              <img src={`/assets/img/overview/${screen}-${theme === 'dark' ? 'dark' : 'light'}.jpg?v=6`} width="240" height="420" loading="lazy" decoding="async"
                alt={`The ${name} screen of the prototype, with sample data.`} />
            </figure>
          </li>
        ))}
      </ol>
      <div className="foot ov-foot">
        <button className="btn btn-primary btn-block" type="button" onClick={() => startTour(0)}><TourIcon />Start the guided tour</button>
        <button className="btn btn-quiet btn-block" type="button" onClick={exploreOwn}>Skip to the app</button>
        <p className="meta" style={{ textAlign: 'center' }}>8 short steps, about two minutes. You can leave at any point.</p>
      </div>
    </Screen>
  );
}
