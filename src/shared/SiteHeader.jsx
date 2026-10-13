import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { KeelMark, ThemeIcon, MotionIcon, ArrowOut } from './Icons.jsx';
import { usePrefs, setTheme, setReducedMotion, isReduced } from './prefs.js';

// Site header shared by Keel's React pages.
// Phones: row 1 is the wordmark and icon-only controls; row 2 is one sideways-scrolling
// row holding the site links and this page's sections. Wide screens: a single row.
// The active section is marked with aria-current="location" and a 2px accent underline
// that moves between links (420ms, ease-settle; instant with reduced motion).

export const SITE = { caseStudy: '/', designSystem: '/design-system/', prototype: '/prototype/' };

function useActiveSection(ids, headerRef) {
  const [active, setActive] = useState(ids[0]);
  const lock = useRef(0);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      if (performance.now() < lock.current) return;
      const offset = (headerRef.current ? headerRef.current.offsetHeight : 64) + 32;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let id = ids[0];
      if (atBottom) id = ids[ids.length - 1];
      else {
        for (const s of ids) {
          const el = document.getElementById(s);
          if (el && el.getBoundingClientRect().top - offset <= 0) id = s;
        }
      }
      setActive(id);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    const release = () => { lock.current = 0; onScroll(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('scrollend', release);
    measure();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('scrollend', release);
      cancelAnimationFrame(raf);
    };
  }, [ids, headerRef]);
  const jumpTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = isReduced();
    const offset = headerRef.current ? headerRef.current.offsetHeight : 64;
    const top = el.getBoundingClientRect().top + window.scrollY - offset + 1;
    setActive(id);
    lock.current = performance.now() + (reduced ? 50 : 1200); // no flicker through sections on the way
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#' + id);
    const h = el.querySelector('h2');
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }, [headerRef]);
  return [active, jumpTo];
}

export function SiteHeader({ page, sections = [], label = 'Sections' }) {
  const { isDark, reduced } = usePrefs();
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const rowRef = useRef(null);
  const ids = useRef(sections.map((s) => s.match || [s.id])).current;
  const flat = useRef(sections.flatMap((s) => s.match || [s.id])).current;
  const [activeRaw, jumpTo] = useActiveSection(flat, headerRef);
  const active = (sections.find((s, i) => ids[i].includes(activeRaw)) || sections[0] || {}).id;
  const [bar, setBar] = useState({ x: 0, w: 0, ready: false });

  // header height drives scroll-padding so anchors land below it
  useLayoutEffect(() => {
    const h = headerRef.current;
    if (!h) return undefined;
    const set = () => document.documentElement.style.setProperty('--header-h', h.offsetHeight + 'px');
    set();
    const ro = new ResizeObserver(set);
    ro.observe(h);
    return () => ro.disconnect();
  }, []);

  // underline follows the active link and stays aligned on resize
  useLayoutEffect(() => {
    const place = () => {
      const link = navRef.current && navRef.current.querySelector('[aria-current="location"]');
      if (!link) return;
      setBar({ x: link.offsetLeft, w: link.offsetWidth, ready: true });
      const row = rowRef.current;
      // phones: scroll the row only as far as needed to show the active link, so the
      // site links at its start stay in view whenever they can
      if (row && row.scrollWidth > row.clientWidth && getComputedStyle(row).display !== 'contents') {
        const left = link.offsetLeft + navRef.current.offsetLeft;
        const right = left + link.offsetWidth;
        let target = null;
        if (sections.length && active === sections[0].id) target = 0; // top of the page: show the site links first
        else if (right > row.scrollLeft + row.clientWidth - 12) target = right - row.clientWidth + 24;
        else if (left < row.scrollLeft + 12) target = Math.max(0, left - 24);
        if (target !== null) row.scrollTo({ left: target, behavior: isReduced() ? 'auto' : 'smooth' });
      }
    };
    place();
    const ro = new ResizeObserver(place);
    if (navRef.current) ro.observe(navRef.current);
    document.fonts && document.fonts.ready.then(place);
    return () => ro.disconnect();
  }, [active]);

  return (
    <header className="site-header" ref={headerRef}>
      <div className="sh-in">
        <a className="sh-brand" href={page === 'design-system' ? '#overview' : SITE.caseStudy} onClick={page === 'design-system' ? (e) => { e.preventDefault(); jumpTo('overview'); } : undefined}>
          <KeelMark />
          <span className="sh-word">Keel</span>
                  </a>

        <div className="sh-row" ref={rowRef}>
          <nav className="sh-site" aria-label="Site">
            <a href={SITE.caseStudy} aria-current={page === 'case-study' ? 'page' : undefined}>Case study</a>
            <a href={SITE.designSystem} aria-current={page === 'design-system' ? 'page' : undefined}>Design system</a>
            <a href={SITE.prototype} className="sh-proto">
              <span className="sh-proto-long">Open prototype</span><span className="sh-proto-short">Prototype</span><ArrowOut />
            </a>
          </nav>
          {sections.length > 0 && (
            <nav className="sh-sections" aria-label={label} ref={navRef}>
              <ul>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={'#' + s.id} aria-current={active === s.id ? 'location' : undefined} onClick={(e) => { e.preventDefault(); jumpTo(s.id); }}>{s.label}</a>
                  </li>
                ))}
              </ul>
              <span className="sh-bar" aria-hidden="true" style={{ transform: `translateX(${bar.x}px)`, width: bar.w, opacity: bar.ready ? 1 : 0 }} />
            </nav>
          )}
        </div>

        <div className="sh-util">
          <button type="button" className="sh-icon" aria-pressed={isDark} onClick={() => setTheme(isDark ? 'light' : 'dark')} title={isDark ? 'Dark theme on' : 'Dark theme off'}>
            <ThemeIcon /><span className="sh-util-label">Dark theme</span>
          </button>
          <button type="button" className="sh-icon" aria-pressed={reduced} onClick={() => setReducedMotion(!reduced)} title={reduced ? 'Motion reduced' : 'Reduce motion'}>
            <MotionIcon reduced={reduced} /><span className="sh-util-label">Reduce motion</span>
          </button>
        </div>
      </div>
    </header>
  );
}
