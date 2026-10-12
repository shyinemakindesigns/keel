import { KeelFigure, IlloBalance, IlloWeight, IlloContinuity } from '../../shared/Keel.jsx';

const PRINCIPLES = [
  {
    n: '01', name: 'Show the keel before the waves',
    text: 'Lead with what is steady. The reading tells you where you stand before any single purchase asks for attention.',
    implication: 'Large, calm type. One dominant date. Little that competes with it.',
    Illo: IlloBalance, alt: 'A beam holding a basalt block, porcelain blocks and one small ember block, perfectly level.',
  },
  {
    n: '02', name: 'Weight, not walls',
    text: 'Spending is read in context, not framed as a violation. A purchase shifts weight; it does not break a limit.',
    implication: 'Measured bars, neutral comparisons, and cost in days rather than red overages.',
    Illo: IlloWeight, alt: 'A small ember block resting against two larger mineral blocks.',
  },
  {
    n: '03', name: 'Settle, don’t startle',
    text: 'Movement helps you follow what changed, then comes to rest. Nothing moves to grab attention.',
    implication: 'Decelerating transitions and stable layouts. No shaking, flashing, confetti or badge counts.',
    Illo: IlloContinuity, alt: 'Five equal blocks along one line, the last one ember.',
  },
];

export default function Overview() {
  return (
    <section id="overview" className="sec sec-overview" aria-labelledby="overview-h">
      <div className="wrap">
        <div className="ov-grid">
          <div className="ov-text">
            <p className="ov-lockup"><span>Keel</span><span>Design system</span></p>
            <h1 id="overview-h">Steadiness, made visible.</h1>
            <p className="lede">Keel explores a calmer way to understand personal finances. Its interface replaces punitive budgeting signals with a forward-looking view of how long available money can cover everyday spending.</p>
            <p className="ov-note">A fictional, self-directed concept. Dates and amounts here are illustrative examples, not a real person’s finances.</p>
          </div>
          <figure className="ov-figure">
            <div className="ov-reading">
              <p className="ov-k">You’re steady through</p>
              <p className="ov-date num">Oct 25</p>
            </div>
            <KeelFigure days={9} descId="ov-keel-desc" label="Keel indicator. The waterline is payday; the keel reaches 9 days below it: covered 9 days past payday." />
            <figcaption>The waterline is payday. The keel’s depth is the room past it: here, 9 days.</figcaption>
          </figure>
        </div>

        <h2 className="h-sub" id="principles-h">Three principles</h2>
        <ol className="principles" aria-labelledby="principles-h">
          {PRINCIPLES.map(({ n, name, text, implication, Illo, alt }) => (
            <li key={n}>
              <span className="p-num" aria-hidden="true">{n}</span>
              <div className="p-body">
                <h3><span className="sr">Principle {n}: </span>{name}</h3>
                <p>{text}</p>
                <p className="p-impl"><span>In the interface</span>{implication}</p>
              </div>
              <div className="p-illo"><Illo id={'illo-' + n} title={alt} /></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
