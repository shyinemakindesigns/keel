// Keel's icon set for the app and its guide. Nautical and material, drawn on a
// 24 unit grid with a 1.6 stroke, round caps and joins; ember only where an icon
// marks the one thing that matters. Decorative: the control around an icon names it.

const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true, focusable: 'false' };
const st = { stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

/** The four tabs, unchanged from the original app. */
export function TabIcon({ name }) {
  if (name === 'home') return <svg {...base}><g {...st} strokeWidth="1.75"><path d="M3 12h18" /><path d="M6 9.5h12c-.5 2.2-1.8 3.3-3.6 3.3H9.6C7.8 12.8 6.5 11.7 6 9.5z" /><path d="M12 13v6" /><path d="M10.5 19.5h3" /></g></svg>;
  if (name === 'spending') return <svg {...base}><g {...st} strokeWidth="1.75"><path d="M4 6.5h16M4 12h16M4 17.5h10" /></g></svg>;
  if (name === 'goals') return <svg {...base}><g {...st} strokeWidth="1.75"><path d="M3 18h18" /><path d="M8 18V5" /><path d="M8 5.5l8 2.5-8 2.5" /></g></svg>;
  return <svg {...base}><g {...st} strokeWidth="1.75"><path d="M3 19h18" /><path d="M4 16l5-4 4 2 7-7" /><path d="M4 16l5-2 4 1 7-3" strokeDasharray="2 2.5" /></g></svg>;
}

/** Lighthouse: the Guide. A light that helps you find your way, not an alarm. */
export const GuideIcon = ({ size = 20 }) => (
  <svg {...base} width={size} height={size}>
    <g {...st}><path d="M9.5 21l1-11h3l1 11" /><path d="M9 10h6" /><path d="M10.4 10V7.6L12 6l1.6 1.6V10" /><path d="M7 21h10" /></g>
    <path d="M15.6 7.4L20 5.8M15.6 8.6L20 10.2M8.4 7.4L4 5.8M8.4 8.6L4 10.2" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

/** Guided tour: a route of buoys to a flag. */
export const TourIcon = () => (
  <svg {...base}>
    <g {...st}><path d="M4 19c3 0 3-4 6-4s3 4 6 4" strokeDasharray="0.1 3.2" /><path d="M17 15V5l3 1.6L17 8.2" /></g>
    <circle cx="4" cy="19" r="1.6" fill="currentColor" /><circle cx="10" cy="15" r="1.6" fill="currentColor" />
  </svg>
);

/** Explore on my own: a compass rose, ember needle pointing north. */
export const CompassIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="8.4" {...st} />
    <path d="M12 5.6l1.8 6.4H10.2z" fill="var(--accent)" /><path d="M12 18.4l-1.8-6.4h3.6z" fill="currentColor" />
  </svg>
);

/** App overview: a sounding chart, four depths marked. */
export const ChartIcon = () => (
  <svg {...base}>
    <g {...st}><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M3.5 9h17" /></g>
    <g fill="currentColor"><circle cx="7.5" cy="12.5" r="1" /><circle cx="12" cy="15.5" r="1" /><circle cx="16.5" cy="13" r="1" /><circle cx="9.5" cy="17" r="1" /></g>
  </svg>
);

/** The keel itself, for "what the keel means". */
export const KeelIcon = () => (
  <svg {...base}>
    <path d="M2.5 9.5h19" {...st} />
    <path d="M5 7h14c-.5 2.6-2 3.9-4 3.9H9c-2 0-3.5-1.3-4-3.9z" fill="var(--accent)" />
    <path d="M11.2 11h1.6l-.3 6.4h-1z" fill="currentColor" /><ellipse cx="12" cy="18.2" rx="2.6" ry="1.2" fill="currentColor" />
  </svg>
);

/** Sample data: a ledger card with a tag. */
export const LedgerIcon = () => (
  <svg {...base}>
    <g {...st}><path d="M6 3.5h9l3 3V20.5H6z" /><path d="M15 3.5v3h3" /><path d="M9 11h6M9 14.5h6M9 18h3.5" /></g>
  </svg>
);

/** Replay the first-run setup: a hull returning along a curve. */
export const ReplayIcon = () => (
  <svg {...base}>
    <g {...st}><path d="M5.2 10a7.4 7.4 0 1 1-.2 4.6" /><path d="M4.6 5.4v4.8h4.8" /></g>
    <path d="M9.5 12.4h5c-.2 1-.8 1.5-1.6 1.5h-1.8c-.8 0-1.4-.5-1.6-1.5z" fill="var(--accent)" />
  </svg>
);

/** Reset sample data: the waterline wiped level. */
export const ResetIcon = () => (
  <svg {...base}>
    <g {...st}><path d="M3 15h18" /><path d="M6.5 11.5c1.2-1.4 2.4-1.4 3.6 0s2.4 1.4 3.6 0 2.4-1.4 3.6 0" /><path d="M8 19h8" /></g>
  </svg>
);

/** Weight: stones of different sizes resting on one line (Spending in the overview). */
export const WeightIcon = () => (
  <svg {...base}>
    <path d="M2.5 19h19" {...st} />
    <rect x="4" y="11" width="7" height="8" rx="1.2" fill="currentColor" />
    <rect x="12.2" y="14.4" width="4.6" height="4.6" rx="1" {...st} />
    <rect x="17.8" y="16.4" width="2.6" height="2.6" rx=".6" fill="var(--accent)" />
  </svg>
);

/** Cairn: stones set aside, stacked on purpose (Goals in the overview). */
export const CairnIcon = () => (
  <svg {...base}>
    <path d="M3 20h18" {...st} />
    <rect x="6" y="15.4" width="12" height="4.6" rx="2.2" {...st} />
    <rect x="8" y="10.6" width="8" height="4" rx="2" {...st} />
    <rect x="9.8" y="6.6" width="4.4" height="3.4" rx="1.7" fill="var(--accent)" />
  </svg>
);

/** Two courses from one point: the plan and the change (Plan in the overview). */
export const CoursesIcon = () => (
  <svg {...base}>
    <g {...st}><path d="M3 18h18" /><path d="M4 16c4-1 7-3 9.5-6.5S18 5 20.5 4.5" /><path d="M4 16c4-.4 8-1.3 16.5-4" strokeDasharray="1.5 2.6" /></g>
    <circle cx="4" cy="16" r="1.6" fill="var(--accent)" />
  </svg>
);

/** The waterline-and-hull mark, for the Steady row in the overview. */
export const SteadyMark = () => (
  <svg {...base}>
    <path d="M2.5 12h19" {...st} />
    <path d="M6 9.4h12c-.5 2.3-1.8 3.4-3.6 3.4H9.6C7.8 12.8 6.5 11.7 6 9.4z" fill="var(--accent)" />
    <path d="M11.3 12.8h1.4l-.3 5h-.8z" fill="currentColor" /><ellipse cx="12" cy="18.4" rx="2.2" ry="1" fill="currentColor" />
  </svg>
);

export const CloseIcon = () => (
  <svg {...base} width="20" height="20" viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15" {...st} /></svg>
);
export const ArrowRight = () => (
  <svg {...base} width="18" height="18" viewBox="0 0 18 18"><path d="M3.5 9h11M10 4.5L14.5 9 10 13.5" {...st} /></svg>
);
export const ArrowLeft = () => (
  <svg {...base} width="18" height="18" viewBox="0 0 18 18"><path d="M14.5 9h-11M8 4.5L3.5 9 8 13.5" {...st} /></svg>
);
export const CheckIcon = () => (
  <svg {...base} width="18" height="18" viewBox="0 0 18 18"><path d="M4 9.4l3.2 3.2L14 5.6" {...st} strokeWidth="1.8" /></svg>
);
export const Chevron = () => (
  <svg {...base} width="16" height="16" viewBox="0 0 16 16"><path d="M6 3.5L10.5 8 6 12.5" {...st} /></svg>
);

/** The brand mark (same construction as the reading). */
export const Mark = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <path className="s-ink" d="M4 15h24" strokeWidth="1.6" strokeLinecap="round" />
    <path className="f-hull" d="M6 12.5h20c-.6 3.4-2.6 5-5.2 5H11.2c-2.6 0-4.6-1.6-5.2-5z" />
    <path className="f-ink" d="M15 17.5h2l-.4 7h-1.2z" />
    <ellipse className="f-ink" cx="16" cy="25.2" rx="3" ry="1.5" />
  </svg>
);
