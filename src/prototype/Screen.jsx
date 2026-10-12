import { useLayoutEffect, useRef, useState } from 'react';

// A screen in the stack. Inactive screens are display:none (the original .screen
// rule); on activation it is shown, then settles in (opacity and 12px rise over
// --dur-move with ease-settle), exactly as the vanilla version did.
export default function Screen({ name, current, className = '', labelledBy, live, children }) {
  const active = current === name;
  const [phase, setPhase] = useState(active ? 'in' : 'off');
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!active) { setPhase('off'); return undefined; }
    setPhase('shown');
    if (ref.current) ref.current.scrollTop = 0;
    const r1 = requestAnimationFrame(() => { void (ref.current && ref.current.offsetWidth); setPhase('in'); });
    return () => cancelAnimationFrame(r1);
  }, [active]);
  const cls = ['screen', className, phase !== 'off' ? 'shown' : '', phase === 'in' ? 'in' : ''].filter(Boolean).join(' ');
  return (
    <section ref={ref} className={cls} data-screen={name} aria-labelledby={labelledBy} aria-live={live}>
      {children}
    </section>
  );
}
