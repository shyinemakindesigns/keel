// The keel: Keel's core visualization, and its illustration family.
// Waterline = payday. The keel's depth = days of room past payday (0 to 14).

const KV = { x: 120, top: 38, zero: 40, perDay: 7 };
const yFor = (d) => KV.zero + Math.max(0.4, Math.min(14, d)) * KV.perDay;
const fin = (d) => `M${KV.x - 5} ${KV.top}h10l-2 ${yFor(d) - KV.top}h-6z`;
const HULL = 'M70 16h100c-2.4 12-10.5 24-23 24h-54c-12.5 0-20.6-12-23-24z';

/**
 * days: current (possibly animating) depth. ghost: earlier depth drawn as an outline.
 * scale: show the day scale. Text labels are SVG text so they scale with the figure;
 * the figure is always paired with a written equivalent (role="img" + description).
 */
export function KeelFigure({ days, ghost = null, scale = true, label, descId, className = '' }) {
  return (
    <svg className={'keel-figure ' + className} viewBox="0 0 340 156" role="img" aria-labelledby={descId}>
      <desc id={descId}>{label}</desc>
      <rect x="0" y="34" width="340" height="122" fill="var(--m-water)" />
      {scale && (
        <g fontFamily="var(--sans)" fontSize="12.5" fill="var(--ink-2)">
          <path d={`M226 ${KV.zero}V${yFor(14)}`} stroke="var(--ink-2)" strokeWidth="1" />
          {[[0, 'Payday'], [3, '+3 days'], [7, '+1 week'], [14, '+2 weeks']].map(([d, t]) => (
            <g key={d}>
              <path d={`M220 ${yFor(d === 0 ? 0.0001 : d)}h6`} stroke="var(--ink-2)" strokeWidth="1" />
              <text x="234" y={(d === 0 ? KV.zero : yFor(d)) + (d === 0 ? 9 : 4)} fill={d === 0 ? 'var(--ink)' : undefined} fontWeight={d === 0 ? 600 : 400}>{t}</text>
            </g>
          ))}
        </g>
      )}
      <path d="M0 34h340" stroke="var(--m-line)" strokeWidth="1.5" />
      {ghost !== null && (
        <g fill="none" stroke="var(--ink-2)" strokeWidth="1.25" strokeDasharray="3 3">
          <path d={fin(ghost)} />
          <ellipse cx={KV.x} cy={yFor(ghost) + 1} rx="13" ry="5.5" />
        </g>
      )}
      <path d={fin(days)} fill="var(--m-line)" />
      <ellipse cx={KV.x} cy={yFor(days) + 1} rx="13" ry="5.5" fill="var(--m-line)" />
      <path d={HULL} fill="var(--m-hull)" stroke="var(--m-hull-edge)" strokeWidth="2" paintOrder="stroke" />
    </svg>
  );
}

// ---------------------------------------------------------------- illustrations
// Oblique blocks: a front face plus top and side faces offset by (dx, dy).
function Block({ x, y, w, h, d = [12, -8], m }) {
  const [dx, dy] = d;
  return (
    <g>
      <path d={`M${x} ${y}h${w}v${h}h${-w}z`} fill={`var(--m-${m}-front)`} />
      <path d={`M${x} ${y}l${dx} ${dy}h${w}l${-dx} ${-dy}z`} fill={`var(--m-${m}-top)`} />
      <path d={`M${x + w} ${y}l${dx} ${dy}v${h}l${-dx} ${-dy}z`} fill={`var(--m-${m}-side)`} />
    </g>
  );
}
const Ground = ({ y, x1 = 20, x2 = 380 }) => <path d={`M${x1} ${y}H${x2}`} stroke="var(--m-line)" strokeWidth="1.5" />;

/** Balance: a beam holding unequal weights level. Principle: show the keel before the waves. */
export function IlloBalance({ title, id }) {
  return (
    <svg viewBox="0 0 400 200" role="img" aria-labelledby={id} className="illo">
      <title id={id}>{title}</title>
      <Ground y={186} />
      <Block x={150} y={150} w={100} h={36} d={[16, -10]} m="cloud" />
      <path d="M182 150a18 18 0 0 1 36 0z" fill="var(--m-navy-front)" />
      <Block x={70} y={124} w={262} h={10} d={[12, -8]} m="cloud" />
      <Block x={92} y={84} w={44} h={40} d={[12, -8]} m="navy" />
      <Block x={258} y={100} w={58} h={24} d={[12, -8]} m="paper" />
      <Block x={266} y={84} w={40} h={16} d={[10, -6]} m="paper" />
      <Block x={192} y={108} w={16} h={16} d={[6, -4]} m="signal" />
    </svg>
  );
}

/** Weight: a small lime block resting against larger blue-grey forms. Principle: weight, not walls. */
export function IlloWeight({ title, id }) {
  return (
    <svg viewBox="0 0 400 200" role="img" aria-labelledby={id} className="illo">
      <title id={id}>{title}</title>
      <Ground y={176} />
      <Block x={70} y={96} w={110} h={80} d={[18, -12]} m="cloud" />
      <Block x={180} y={128} w={78} h={48} d={[18, -12]} m="cloud" />
      <Block x={258} y={150} w={26} h={26} d={[10, -7]} m="signal" />
      <Block x={300} y={152} w={44} h={24} d={[14, -9]} m="navy" />
    </svg>
  );
}

/** Continuity: equal steps on one line, each a little further on. Principle: settle, don't startle. */
export function IlloContinuity({ title, id }) {
  const steps = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 400 200" role="img" aria-labelledby={id} className="illo">
      <title id={id}>{title}</title>
      <Ground y={160} />
      <path d="M36 112H380" stroke="var(--ink-2)" strokeWidth="1" strokeDasharray="2 5" />
      {steps.map((i) => (
        <Block key={i} x={40 + i * 66} y={112} w={44} h={48} d={[12, -8]} m={i === 4 ? 'signal' : 'cloud'} />
      ))}
    </svg>
  );
}
