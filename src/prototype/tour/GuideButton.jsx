import { GuideIcon } from '../icons.jsx';

// The way back into help: quiet, same place on every screen, never floating.
export function GuideButton({ onClick }) {
  return (
    <button type="button" className="guide-btn" onClick={(e) => onClick(e.currentTarget)}>
      <GuideIcon /><span>Guide</span>
    </button>
  );
}
