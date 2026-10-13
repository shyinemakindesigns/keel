const SCALE = [
  ['Financial date', 'Switzer 400', '80 / 48px', '1', 't-date', 'Oct 25'],
  ['Display', 'Switzer 400', '72 / 42px', '1', 't-display', 'Steadiness, made visible'],
  ['Heading 1', 'Switzer 400', '56 / 36px', '1.05', 't-h1', 'Where your money stands'],
  ['Heading 2', 'Switzer 400', '40 / 30px', '1.1', 't-h2', 'Coming up before payday'],
  ['Heading 3', 'Switzer 500', '28 / 24px', '1.2', 't-h3', 'Car repair fund'],
  ['Data', 'Switzer 500, tabular', '28 / 24px', '1.2', 't-data', '$1,284.60'],
  ['Body large', 'Switzer 400', '18 / 17px', '1.55', 't-bodyl', 'Your bills before payday are already set aside.'],
  ['Body', 'Switzer 400', '16px', '1.6', 't-body', '$16.80 is about a third of a day of your usual spending.'],
  ['Small', 'Switzer 400', '14px', '1.5', 't-small', 'Since payday on Oct 2, 7 days'],
  ['Caption', 'Switzer 400', '13px', '1.5', 't-caption', 'By this point last stretch'],
];

const AMOUNTS = ['$1,240.00', '$138.90', '$60.55', '$47.25', '$12.15'];

export default function TypeSection() {
  return (
    <section id="typography" className="sec" aria-labelledby="type-h">
      <div className="wrap">
        <header className="sec-head">
          <span className="sec-num" aria-hidden="true">03</span>
          <h2 id="type-h">Typography</h2>
          <p className="lede">One family, Switzer, in three levels: display for the reading and headlines, data for amounts and dates, body for everything else. Neutral and exact, the way a financial product should read.</p>
        </header>

        <figure className="hero-spec">
          <p className="hs-k">You’re steady through</p>
          <p className="hs-date num">Oct 25</p>
          <figcaption>Switzer Regular at its largest, with tight leading and no added tracking. Everything around the date stays quiet so it reads first.</figcaption>
        </figure>

        <div className="faces">
          <div>
            <p className="face-name face-fraunces">Switzer</p>
            <p>A neutral grotesque from the Indian Type Foundry, free through Fontshare. Display is Regular: large, calm, line height close to 1. Headings at small sizes step up to Medium so the hierarchy holds.</p>
          </div>
          <div>
            <p className="face-name face-archivo num">$137,831.00</p>
            <p>Data is Medium with tabular figures, so columns of money line up and values don’t jitter while they count. Body is Regular, 14 to 17px at 1.5 to 1.6, never smaller to fit more in.</p>
          </div>
        </div>

        <h3 className="h-part">Scale</h3>
        <div className="tscale" role="table" aria-label="Type scale">
          <div className="ts-row ts-head" role="row">
            <span role="columnheader">Role</span><span role="columnheader">Typeface</span><span role="columnheader">Size, desktop / mobile</span><span role="columnheader">Line height</span><span role="columnheader">Sample</span>
          </div>
          {SCALE.map(([role, face, size, lh, cls, sample]) => (
            <div className="ts-row" role="row" key={role}>
              <span role="cell" className="ts-role">{role}</span>
              <span role="cell" className="ts-meta">{face}</span>
              <span role="cell" className="ts-meta num">{size}</span>
              <span role="cell" className="ts-meta num"><span className="ts-lbl">Line height </span>{lh}</span>
              <span role="cell" className={'ts-sample ' + cls}>{sample}</span>
            </div>
          ))}
        </div>

        <div className="type-studies">
          <figure>
            <figcaption>Weight</figcaption>
            <ul className="weights">
              {[300, 400, 500, 600, 700].map((w) => <li key={w} style={{ fontWeight: w }}><span className="num">Oct 25</span><small>{w}</small></li>)}
            </ul>
          </figure>
          <figure>
            <figcaption>Three levels</figcaption>
            <ul className="softs">
              <li style={{ fontWeight: 400 }}>Steady<small>Display: Regular, 42 to 80px</small></li>
              <li style={{ fontWeight: 500 }} className="num">$1,284.60<small>Data: Medium, tabular</small></li>
              <li style={{ fontWeight: 400, fontSize: 17, lineHeight: 1.5 }}>Rent is covered.<small>Body: Regular, 14 to 17px</small></li>
            </ul>
          </figure>
          <figure>
            <figcaption>Financial numerals</figcaption>
            <div className="numerals">
              <div><small>Proportional</small>{AMOUNTS.map((a) => <span key={a} style={{ fontVariantNumeric: 'proportional-nums' }}>{a}</span>)}</div>
              <div><small>Tabular (Keel)</small>{AMOUNTS.map((a) => <span key={a} className="num">{a}</span>)}</div>
            </div>
            <p className="small muted">Tabular figures share one width, so columns of money line up and values don’t jitter while they count.</p>
          </figure>
          <figure>
            <figcaption>Line height</figcaption>
            <div className="leading">
              <p style={{ lineHeight: 1.6 }}><small>1.6, body</small>Keel looks at your bills, your paydays and your usual spending, then tells you one thing first.</p>
              <p style={{ lineHeight: 1.25 }} className="too-tight"><small>1.25, too tight for body</small>Keel looks at your bills, your paydays and your usual spending, then tells you one thing first.</p>
            </div>
          </figure>
        </div>

        <h3 className="h-part">Rules</h3>
        <ul className="rules">
          <li><b>Sentence case everywhere.</b> No uppercase labels; capitals are for names and the start of a sentence.</li>
          <li><b>Readable measure.</b> Paragraphs stop at about 66 characters.</li>
          <li><b>Balanced headings.</b> Headings use balanced wrapping, so a short last line doesn’t dangle.</li>
          <li><b>Almost no tracking.</b> Display tightens by 1%; data and body are never tracked.</li>
          <li><b>Text resizes.</b> Sizes respond to the viewport within limits and every line wraps, so the page holds at 200% zoom.</li>
        </ul>
      </div>
    </section>
  );
}
