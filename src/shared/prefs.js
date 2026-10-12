// Theme and motion preferences, shared by every Keel page (React and not yet ported).
// Storage keys match the existing pages, so a choice made anywhere follows you.
//   keel-theme:  'light' | 'dark'      (absent: follow the operating system)
//   keel-motion: 'reduced' | 'full'    (absent: follow the operating system)
// The inline script in each page's <head> applies these before first paint.
import { useSyncExternalStore } from 'react';

const root = document.documentElement;
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set();

function read(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function write(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* private mode: the choice lasts for this page */ }
}

export function applyPrefs() {
  const t = read('keel-theme');
  root.setAttribute('data-theme', t === 'dark' || t === 'light' ? t : darkQuery.matches ? 'dark' : 'light');
  const m = read('keel-motion');
  if (m === 'reduced' || m === 'full') root.setAttribute('data-motion', m);
  else root.removeAttribute('data-motion');
}

function snapshot() {
  const theme = root.getAttribute('data-theme') || 'light';
  const m = root.getAttribute('data-motion');
  const reduced = m === 'reduced' || (m !== 'full' && motionQuery.matches);
  return theme + '|' + (reduced ? 'reduced' : 'full');
}
let current = snapshot();
function emit() {
  const next = snapshot();
  if (next === current) return;
  current = next;
  listeners.forEach((fn) => fn());
  document.dispatchEvent(new Event('keel-prefs'));
}

// Follow the operating system until the person chooses.
darkQuery.addEventListener('change', () => { if (!read('keel-theme')) { applyPrefs(); emit(); } });
motionQuery.addEventListener('change', emit);
window.addEventListener('storage', (e) => { if (e.key === 'keel-theme' || e.key === 'keel-motion') { applyPrefs(); emit(); } });

export function setTheme(theme) {
  write('keel-theme', theme);
  root.setAttribute('data-theme', theme);
  emit();
}
export function setReducedMotion(reduced) {
  const v = reduced ? 'reduced' : 'full';
  write('keel-motion', v);
  root.setAttribute('data-motion', v);
  emit();
}
export function isReduced() { return current.endsWith('reduced'); }

function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function usePrefs() {
  const s = useSyncExternalStore(subscribe, () => current);
  const [theme, motion] = s.split('|');
  return { theme, reduced: motion === 'reduced', isDark: theme === 'dark' };
}
