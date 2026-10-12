// Visitor state, kept in this browser only. No account, no real data.
//   new        first visit: show the welcome
//   touring    the guided tour is in progress (step is remembered)
//   completed  finished the tour: open the app directly from now on
//   exploring  chose to explore on their own: open the app directly from now on
// "Returning visitor" is any state other than new.
const KEY = 'keel-visitor';

export function getVisitor() {
  try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.state) return v; } catch (e) { /* ignore */ }
  return { state: 'new', step: 0 };
}
export function setVisitor(v) {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode: lasts for this visit */ }
}
