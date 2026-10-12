// Keel's icon set: drawn on a 20 or 24 unit grid, 1.6 stroke, round joins.
// Decorative unless given a title; the control around an icon carries its name.

export function KeelMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" className="keel-mark">
      <path d="M4 15h24" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 12.5h20c-.6 3.4-2.6 5-5.2 5H11.2c-2.6 0-4.6-1.6-5.2-5z" fill="var(--accent)" />
      <path d="M15 17.5h2l-.4 7h-1.2z" fill="var(--ink)" />
      <ellipse cx="16" cy="25.2" rx="3" ry="1.3" fill="var(--ink)" />
    </svg>
  );
}

const base = { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none', 'aria-hidden': true, focusable: 'false' };
const stroke = { stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const ThemeIcon = () => (
  <svg {...base}><circle cx="10" cy="10" r="7" {...stroke} /><path d="M10 3a7 7 0 0 1 0 14z" fill="currentColor" /></svg>
);
export const MotionIcon = ({ reduced }) => (
  <svg {...base}>
    <path d="M2 12h16" {...stroke} />
    <path d="M6 9.5h8c-.4 1.8-1.4 2.6-2.8 2.6H8.8C7.4 12.1 6.4 11.3 6 9.5z" fill="currentColor" />
    {!reduced && <path d="M4 6.5c1.2-.8 2.4-.8 3.6 0M12.4 6.5c1.2-.8 2.4-.8 3.6 0" {...stroke} strokeWidth="1.3" />}
  </svg>
);
export const ArrowOut = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M4 10l6-6M5 4h5v5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const CloseIcon = () => (
  <svg {...base}><path d="M5 5l10 10M15 5L5 15" {...stroke} /></svg>
);

// status: each role has its own shape, so meaning never rests on color alone
export const StatusIcon = ({ kind }) => {
  const s = { width: 18, height: 18, viewBox: '0 0 18 18', 'aria-hidden': true, focusable: 'false', fill: 'none' };
  if (kind === 'positive') return <svg {...s}><circle cx="9" cy="9" r="7.2" stroke="currentColor" strokeWidth="1.6" /><path d="M5.8 9.2l2.2 2.2 4.2-4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (kind === 'negative') return <svg {...s}><path d="M9 1.8l7.2 7.2L9 16.2 1.8 9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 5.6v4M9 12.2v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  if (kind === 'warning') return <svg {...s}><path d="M9 2.2l7 12.6H2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 7.2v3.4M9 12.8v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
  return <svg {...s}><rect x="1.8" y="1.8" width="14.4" height="14.4" rx="3" stroke="currentColor" strokeWidth="1.6" /><path d="M9 8v4.6M9 5.3v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
};

// app tab icons
const tab = { width: 24, height: 24, viewBox: '0 0 24 24', 'aria-hidden': true, focusable: 'false', fill: 'none' };
export const TabIcon = ({ name }) => {
  if (name === 'steady') return <svg {...tab}><path d="M3 10.5h18" {...stroke} /><path d="M5.5 8h13c-.5 2.6-2 3.9-4 3.9h-5c-2 0-3.5-1.3-4-3.9z" fill="currentColor" /><path d="M11.2 12h1.6l-.3 6h-1z" fill="currentColor" /><ellipse cx="12" cy="18.6" rx="2.6" ry="1.1" fill="currentColor" /></svg>;
  if (name === 'spending') return <svg {...tab}><path d="M4 7h16M4 12h11M4 17h7" {...stroke} /></svg>;
  if (name === 'goals') return <svg {...tab}><path d="M7 20V4.5l9 3.2-9 3.3" {...stroke} /><path d="M4 20h12" {...stroke} /></svg>;
  return <svg {...tab}><path d="M3 18.5h18" {...stroke} /><path d="M4 15l4.5-3.5 3.5 2.5 6-6" {...stroke} /><path d="M15 8h3v3" {...stroke} /></svg>;
};
