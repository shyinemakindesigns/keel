// Region: Keel is designed for people in the United States and Canada. The two share the
// dollar sign and most of the vocabulary; where they differ (cheque spellings, the currency
// code), the prototype follows the region. Default: Canada for a Canadian browser locale
// (en-CA, fr-CA), otherwise the United States. ?region=ca or ?region=us in the URL, or the
// switch in the Guide, overrides it and is remembered in this browser.
import { useEffect, useState } from 'react';

const KEY = 'keel-region';
export const REGIONS = {
  us: { id: 'us', name: 'United States', currency: 'USD', lang: 'en-US',
        paycheck: 'paycheck', paychecks: 'paychecks', checking: 'checking', Checking: 'Checking' },
  ca: { id: 'ca', name: 'Canada', currency: 'CAD', lang: 'en-CA',
        paycheck: 'paycheque', paychecks: 'paycheques', checking: 'chequing', Checking: 'Chequing' },
};

function detect() {
  try {
    const q = new URLSearchParams(location.search).get('region');
    if (q && REGIONS[q]) { localStorage.setItem(KEY, q); return q; }
    const saved = localStorage.getItem(KEY);
    if (saved && REGIONS[saved]) return saved;
  } catch (e) { /* storage blocked: fall through to the locale */ }
  const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || '']).join(',');
  return /-CA\b/i.test(langs) ? 'ca' : 'us';
}

let current = detect();
const subscribers = new Set();
const applyLang = () => { document.documentElement.lang = REGIONS[current].lang; };
applyLang();

export function setRegion(id) {
  if (!REGIONS[id] || id === current) return;
  current = id;
  try { localStorage.setItem(KEY, id); } catch (e) { /* lasts for this visit */ }
  applyLang();
  subscribers.forEach((fn) => fn(id));
}

/** The current region's words. Components that use it re-render when the region changes. */
export function useRegion() {
  const [id, setId] = useState(current);
  useEffect(() => { subscribers.add(setId); return () => subscribers.delete(setId); }, []);
  return REGIONS[id];
}

/** For plain functions (the model's sentences): the current region's word. */
export const term = (key) => REGIONS[current][key];
