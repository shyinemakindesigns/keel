const SPACE = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];

export default function Foundations() {
  return (
    <section id="foundations" className="sec sec-tight" aria-labelledby="found-h">
      <div className="wrap">
        <header className="sec-head sec-head-sm">
          <h2 id="found-h">Spacing, radius and elevation</h2>
          <p className="lede">A 4px grid, three radii, and hierarchy made from material rather than shadow.</p>
        </header>
        <div className="found">
          <figure className="space">
            <figcaption>Spacing</figcaption>
            <ol>
              {SPACE.map((n) => (
                <li key={n}>
                  <code>--space-{n}</code>
                  <span className="sp-bar" style={{ width: `var(--space-${n})` }} aria-hidden="true" />
                  <span className="num">{n * 4}px</span>
                </li>
              ))}
            </ol>
          </figure>
          <div className="found-right">
            <figure className="radii">
              <figcaption>Radius</figcaption>
              <ul>
                {[['sm', 6, 'Chips, small controls'], ['md', 10, 'Buttons, inputs'], ['lg', 16, 'Panels, sheets']].map(([k, px, use]) => (
                  <li key={k}><span className="rad" style={{ borderRadius: `var(--radius-${k})` }} aria-hidden="true" /><code>--radius-{k}</code><span className="num">{px}px</span><small>{use}</small></li>
                ))}
              </ul>
            </figure>
            <figure className="elev">
              <figcaption>Elevation</figcaption>
              <ul>
                <li><span className="ev ev-flat" aria-hidden="true" /><b>Flat</b><small>A change of surface. Most of Keel.</small></li>
                <li><span className="ev ev-hair" aria-hidden="true" /><b>Hairline</b><small>Surface plus a 1px edge, for panels on panels.</small></li>
                <li><span className="ev ev-lift" aria-hidden="true" /><b>Soft lift</b><small>Only for things above the page: sheets, devices, overlays.</small></li>
              </ul>
              <p className="small muted">Shadows imply something can be picked up. In a calm money app very little should feel loose, so hierarchy comes from surface, edge, space and type first.</p>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
