import { useEffect, useRef, useState } from 'react';
import { isReduced } from './prefs.js';

// The keel's spring: stiffness 70, damping 15, mass 1. Damping ratio 0.9, so the
// largest overshoot is about 0.2%: weighted, decelerating, no visible bounce.
// With reduced motion the value jumps to its target; the state still changes.
export const SPRING = { stiffness: 70, damping: 15 };

export function springSamples(from, to, ms = 1200, step = 1 / 240) {
  const out = [];
  let x = from, v = 0;
  for (let t = 0; t <= ms / 1000 + 1e-9; t += step) {
    out.push([t, x]);
    v += (-SPRING.stiffness * (x - to) - SPRING.damping * v) * step;
    x += v * step;
  }
  return out;
}

export function useSpring(target) {
  const [value, setValue] = useState(target);
  const state = useRef({ x: target, v: 0, raf: 0 });
  useEffect(() => {
    const s = state.current;
    cancelAnimationFrame(s.raf);
    if (isReduced()) { s.x = target; s.v = 0; setValue(target); return undefined; }
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.032, Math.max(0, (now - last) / 1000));
      last = now;
      s.v += (-SPRING.stiffness * (s.x - target) - SPRING.damping * s.v) * dt;
      s.x += s.v * dt;
      if (Math.abs(s.x - target) < 0.005 && Math.abs(s.v) < 0.005) { s.x = target; s.v = 0; setValue(target); return; }
      setValue(s.x);
      s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(s.raf);
  }, [target]);
  return value;
}
