import { useEffect, useState } from 'react';

// The resolved theme: the data-theme attribute (saved choice, ?theme=, or the case study's
// switch); dark when it is missing, matching the page default.
function resolve() {
  const t = document.documentElement.getAttribute('data-theme');
  if (t === 'dark' || t === 'light') return t;
  return 'dark';
}
export function usePrefsTheme() {
  const [theme, setTheme] = useState(resolve);
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(resolve()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setTheme(resolve());
    mq.addEventListener('change', on);
    return () => { mo.disconnect(); mq.removeEventListener('change', on); };
  }, []);
  return theme;
}
