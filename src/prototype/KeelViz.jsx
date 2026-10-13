import { useEffect, useRef, useState } from 'react';
import { reduced } from './util.js';

// Equilibrium Indicator: the waterline is payday; the keel hangs below it and its
// depth is how many days past payday the money covers. Web implementation of the
// Rive spec (docs/motion-system/rive-spec.md), same geometry and spring as before.
const KV = { x: 120, top: 38, zero: 40, perDay: 7, maxDays: 14 };
export const depthFor = (margin) => Math.max(0.4, Math.min(KV.maxDays, margin));
const yFor = (days) => KV.zero + days * KV.perDay;
const finPath = (days) => 'M' + (KV.x - 5) + ' ' + KV.top + 'h10l-2 ' + (yFor(days) - KV.top) + 'h-6z';
const TICKS = [[0, 'Payday'], [3, '+3 days'], [7, '+1 week'], [14, '+2 weeks']];

/**
 * depth: the reading's depth. preview: { depth, label } shows a different depth with
 * a dashed "Now" outline at the reading's depth (purchase check, tour demonstration).
 * startFrom: depth to spring from on first show (after the first reading).
 */
export default function KeelViz({ depth, preview, startFrom, desc }) {
  const target = preview ? preview.depth : depth;
  const [x, setX] = useState(startFrom != null ? startFrom : target);
  const s = useRef({ x: startFrom != null ? startFrom : target, v: 0, raf: 0 });

  useEffect(() => {
    const st = s.current;
    cancelAnimationFrame(st.raf);
    if (reduced()) { st.x = target; st.v = 0; setX(target); return undefined; }
    // A damped spring: the keel finds its new depth and settles in about 900ms.
    // Damping ratio 0.9, so any overshoot is about 0.2%: no visible bounce.
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.032, Math.max(0, (now - last) / 1000)); last = now;
      st.v += (-70 * (st.x - target) - 15 * st.v) * dt; st.x += st.v * dt;
      if (Math.abs(st.x - target) > 0.01 || Math.abs(st.v) > 0.01) { setX(st.x); st.raf = requestAnimationFrame(step); }
      else { st.x = target; st.v = 0; setX(target); }
    };
    st.raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(st.raf);
  }, [target]);

  const gy = yFor(depth), ny = preview ? yFor(preview.depth) : 0;
  return (
    <svg className="keelviz" id="keelviz" data-tour="keel" viewBox="0 0 340 156" role="img" aria-labelledby="kv-desc">
      <desc id="kv-desc">{desc}</desc>
      <rect className="f-water" x="0" y="34" width="340" height="122" />
      <g className="f-ink2s" fontFamily="Switzer, sans-serif" fontSize="12.5">
        <path className="s-ink2s" d={'M226 ' + KV.zero + 'V' + yFor(14)} strokeWidth="1" />
        {TICKS.map(([d, t]) => (
          <g key={d}>
            <path className="s-ink2s" d={'M220 ' + yFor(d) + 'h6'} strokeWidth="1" />
            <text x="234" y={yFor(d) + 4} className={d === 0 ? 'f-ink' : undefined} fontWeight={d === 0 ? 600 : undefined}>{t}</text>
          </g>
        ))}
      </g>
      <path className="s-ink" d="M0 34h340" strokeWidth="1.5" />
      <g opacity={preview ? 1 : 0}>
        <path className="s-ink2s" fill="none" strokeWidth="1.25" strokeDasharray="3 3"
          d={finPath(depth) + ' M' + (KV.x - 13) + ' ' + (gy + 1) + 'a13 5.5 0 1 0 26 0a13 5.5 0 1 0 -26 0'} />
        {preview && Math.abs(ny - gy) >= 14 && <text className="f-ink2s" x="84" y={gy + 5} textAnchor="end" fontFamily="Switzer, sans-serif" fontSize="12.5">Now</text>}
        {preview && <text className="f-ink" x="84" y={ny + 5} textAnchor="end" fontFamily="Switzer, sans-serif" fontSize="12.5" fontWeight="600">{preview.label}</text>}
      </g>
      <g>
        <path className="f-ink" d={finPath(x)} />
        <ellipse className="f-ink" cx="120" cy={yFor(x) + 1} rx="13" ry="5.5" />
        <path className="f-hull" d="M70 16h100c-2.4 12-10.5 24-23 24h-54c-12.5 0-20.6-12-23-24z" />
      </g>
    </svg>
  );
}
