# Keel: QA, accessibility and performance report

Scope: `prototype.html` (the app) and `index.html` (the case study), served locally, October 8, 2026. Headless Chrome via the DevTools protocol; probes from the ux-ui-audit skill (`probe-core`, `probe-focus`, `probe-heuristics`, `probe-perception`, `probe-ltr`) plus project scripts. Viewports: 320×640, 390×844 (mobile emulation), 1280×800, 1440×900; light and dark themes; reduced motion forced during probes so measurements read settled states.

Judged against: WCAG 2.2 AA, the project’s own tokens (`assets/tokens.css`) and motion rules (`docs/motion-system/README.md`).

## Summary

- **Accessibility:** 0 open AA failures after fixes. 10 defects found and fixed in this pass (below). 1 measured advisory kept with a reason.
- **Functional:** all primary flows pass the scripted run: onboarding, bill toggle, purchase check, recategorizing, adding to a goal, creating a goal, applying a plan, reset.
- **Performance:** 61fps with the CPU throttled 4×, worst frame 17ms, no long tasks during the hero and welcome animations.
- **Not done:** usability testing with people (planned, see the case study, section 12); a screen reader pass by a person (scripts can’t replace it).

## Findings fixed in this pass

| # | Severity | Where | Finding | Evidence | Fix |
| --- | --- | --- | --- | --- | --- |
| 01 | Accessibility, 1.4.10 | App, Steady, 320px wide | The purchase “Check” button overflowed the screen | `button.btn` right edge 366px in a 320px viewport | `.field { min-width: 0 }`, input `width: 100%` |
| 02 | Accessibility, 2.4.3 / modal | App, all sheets | Tab could leave an open dialog and reach the page behind it | Focus moved past the sheet into the screen behind | Background marked `inert` while a sheet is open; verified: 12 Tabs stay inside, Escape returns focus to the opener (`data-tx="t3"`) |
| 03 | Accessibility, 1.3.1 | App | No `main` landmark | `main=0 nav=1` | Screens wrapped in `<main>` |
| 04 | Accessibility, 1.3.1 / 2.4.6 | App, Steady and Spending | Section titles were styled text, not headings | Outline was only `H1: Your reading` | Real `h2`: Spending pace, Coming up, By category, Day by day, Transactions |
| 05 | Accessibility, 4.1.2 | App and case study | Decorative animations exposed as unnamed images | `role="img"` with `label=""` | Empty label now means `aria-hidden="true"`, no role |
| 06 | Accessibility, 1.3.1 | Case study, design system | Heading levels skipped | `h2 -> h4 at "Buttons"` | Cards use `h3` |
| 07 | Accessibility, 2.4.4 | Case study, research | Two different links with the same text | `"cmu.edu (pdf)" ×2`, different PDFs | Link text names the paper |
| 08 | Major | App | Text buttons ignored the `hidden` attribute after a style change | “Clear” visible with no purchase entered | `[hidden] { display: none !important }`; verified height 0 |
| 09 | Major | Case study | Before/after screenshots rendered stretched | 348×1688 for a 780×1688 image | `img { height: auto }`; now 348×751 |
| 10 | Accessibility, 1.4.10 | Case study header, 320px wide | The two toggles plus “Open the prototype” pushed the page to 386px | `scrollWidth 386, clientWidth 320`, from `div.right` | Under 400px the toggle labels become visually hidden (still their accessible names); now `scrollWidth 320` |

## Responsive and mobile-first (October 10, 2026)

All three pages are written mobile-first: base styles are the phone layout, and wider layouts are added with `min-width` queries. The app always was; the case study and system page were converted from 33 desktop-first `max-width` overrides.

- **The conversion changed nothing it shouldn’t.** Every element’s box, display, grid, borders and padding was recorded at 24 widths (320 to 1440) before and after. The case study is identical at all 24 widths; the system page differs only at 320px, where the fix below applies.
- **Checked at 10 widths** (320, 360, 390, 414, 600, 768, 820, 1024, 1280, 1440): page overflow, elements off-screen, clipped text, text under 12px, controls under 24px. The app was checked on all 9 screens at each width: 90 of 90 clean.

| # | Where | Finding | Fix |
| --- | --- | --- | --- |
| R1 | System page, 320px | The animation library grid needed a 320px column inside a 288px space: page 336px wide | Column minimum is now `min(100%, 320px)` |
| R2 | System page header, phones | Seven links wrapped into four rows: a 195px sticky header, 28% of a 640px screen | Links sit in one sideways-scrolling row under the wordmark: 98px |
| R3 | Case study header, 401 to 720px | “Reduce motion” wrapped and “Open the prototype” was cut off at the edge | Icon-only toggles and a “prototype” link until 721px; full labels stay as accessible names |
| R4 | Case study, Rive toggle, up to 820px | Negative margins put the button 11px past the left edge | The button is a 72 × 44 window onto the canvas |
| R5 | Case study, hero, phones | Three fixed headline lines each wrapped again: a ragged five-line headline, and the intro held to 26 characters | Below 641px the headline wraps naturally and the intro uses the full width |
| R6 | Case study header link | 22px tall on phones | 44px |
| R7 | Rive demo labels | Dropped to 11px in narrow cards; “Payday” touched the waterline | 12px always; “Payday” sits under the line |
| R8 | Text buttons | A disabled “Back” still looked clickable | Disabled style for text buttons |

Also fixed while converting: a garbled block of hero animation CSS, where a selector could never match and the tagline’s fade-in was always switched off.

## Advisory kept

- **Switch height 28px (2.5.5, AAA).** Bill switches measure 46×28. They pass 2.5.8 (24px minimum) and their touch area is 46×46 through an invisible hit area, which the probe can’t see because it measures the element box.

## Measured results

| Check | App | Case study |
| --- | --- | --- |
| Text contrast measured | 713 across 16 states, 0 failures | 400 per theme, 0 failures |
| Contrast pairings (tokens) | 68 across both themes, 0 failures (`source/contrast_audit.py`) | same tokens |
| Focus ring | 2px solid, 5.01 to 5.89:1, passes 1.4.11 and the 2px guidance in 2.4.13 | 2px, 5.89:1 |
| Targets under 24px | 0 | 0 non-inline after fixes (inline links are exempt under 2.5.8) |
| Unnamed controls | 0 | 0 |
| Horizontal overflow at 320px | none | none (data tables scroll inside their own containers) |
| Reduced motion | every duration token 0; Lotties hold the settled frame | same, plus a page switch |

## Performance

| Measure | Value |
| --- | --- |
| Hero animation, CPU 4× throttled | 61fps, worst frame 17ms, 0 long tasks |
| App first load, gzip | about 110 KB before fonts (HTML 5, CSS 10, lottie-web 74, app scripts 21) |
| All 24 Lottie files | 229 KB raw, 30 KB gzip; largest 16.3 KB |
| Lottie requests, case study | 12 unique fetches for 28 players (was 28 before the fetch cache) |
| Static fallbacks | 24 SVGs, 36.5 KB gzip |
| Rive runtime (case study only) | 51 KB JS + 431 KB WASM gzip, loaded only near the Rive demos; not loaded by the app |
| Keel Rive files | 4 files, 24 KB raw total (equilibrium 4.9, goal 3.7, onboarding 10.1, scenario 5.6), light and dark artboards in each |
| Screenshots | WebP, 31 to 47 KB each, served at 2.6 to 3.6× displayed size (sharp on high-density screens) |

## Not verified

- Real devices (tested in Chrome with mobile emulation and CPU throttling only).
- Safari and Firefox rendering of the Lottie SVG output.
- A human screen reader pass.
