// Motion helpers shared by the prototype. keel-lottie.js publishes window.keelMotion,
// which reads the OS setting and the data-motion attribute the case study can set.
export function reduced() {
  if (window.keelMotion && window.keelMotion.reduced) return window.keelMotion.reduced();
  return document.documentElement.getAttribute('data-motion') === 'reduced' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
export function cssMs(name) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return reduced() ? 0 : (parseFloat(v) || 0);
}
export function tween(from, to, dur, fn, ease) {
  if (reduced() || dur === 0) { fn(to); return () => {}; }
  const t0 = performance.now();
  const e = ease || ((t) => 1 - Math.pow(1 - t, 3));
  let raf = 0;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    fn(from + (to - from) * e(k));
    if (k < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
let announceTimer = 0;
export function announce(msg) {
  const a = document.getElementById('announce');
  if (!a) return;
  a.textContent = '';
  clearTimeout(announceTimer);
  announceTimer = setTimeout(() => { a.textContent = msg; }, 30);
}
