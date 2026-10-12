import { SiteHeader, SITE } from '../shared/SiteHeader.jsx';
import Overview from './sections/Overview.jsx';
import ColorSection from './sections/ColorSection.jsx';
import TypeSection from './sections/TypeSection.jsx';
import Foundations from './sections/Foundations.jsx';
import MotionSection from './sections/MotionSection.jsx';
import ComponentsSection from './sections/ComponentsSection.jsx';
import AccessibilitySection from './sections/AccessibilitySection.jsx';

// Spacing, radius and elevation sit inside the Typography stretch of the navigation.
const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'color', label: 'Color' },
  { id: 'typography', label: 'Typography', match: ['typography', 'foundations'] },
  { id: 'motion', label: 'Motion' },
  { id: 'components', label: 'Components' },
  { id: 'accessibility', label: 'Accessibility' },
];

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <SiteHeader page="design-system" sections={SECTIONS} label="Design system sections" />
      <main id="main" tabIndex={-1}>
        <Overview />
        <ColorSection />
        <TypeSection />
        <Foundations />
        <MotionSection />
        <ComponentsSection />
        <AccessibilitySection />
      </main>
      <footer className="ds-footer">
        <div className="wrap ds-footer-in">
          <p>Keel is a fictional, self-directed product concept by Shyine Makin. Dates and amounts on this page are illustrative.</p>
          <nav aria-label="Footer">
            <a href={SITE.caseStudy}>Case study</a>
            <a href={SITE.prototype}>Prototype</a>
            <a href="/system.html">Animation library</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
