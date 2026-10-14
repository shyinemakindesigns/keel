# Keel

A self-directed UX and visual design case study by Shyine Makin.

Keel is a fictional personal finance app built on one idea: confidence with money comes from steadiness, not restriction. Most budgeting apps meet a hard week with red numbers and overages. Keel leads with a single forward-looking answer instead: **if nothing else came in, how long are you covered?**

> A keel is the part of a boat you never see. It doesn’t stop the waves. It keeps you upright through them.

Keel is not a real company, product or client project, and it is not affiliated with any financial institution.

## What’s here

| Path | What it is |
| --- | --- |
| `design-system/`, `src/` | The design system page in React (Vite): Harbor & Signal tokens, calculated contrast, type, spacing, motion, and live accessible components. Shared React code in `src/shared`. See `docs/react-migration.md` |
| `index.html` | The case study: problem, research, define, architecture, wireframes, identity, illustration system, motion system (gallery and playground), application design, the embedded app, design system, testing plan, outcomes |
| `prototype/`, `src/prototype/` | The app in React: a first-visit welcome, overview and guided tour, then onboarding, Steady, Spending, Goals and Plan. Works on its own, on a phone, and in a wide layout. The old `/prototype.html` address redirects here (a rule in `netlify.toml`) |
| `system.html` | The animation library: every Lottie and Rive file, playable, with fallbacks and engineering notes |
| `DESIGN.md` | Short brand brief |
| `assets/tokens.css` | Harbor & Signal tokens (light and dark), glass button tokens and motion tokens |
| `assets/css/glass.css` | The glass buttons, with solid fallbacks |
| `assets/css/` | `components.css` (shared), `app.css` (the app), `case-study-motion.css` (the case study) |
| `assets/js/keel-lottie.js` | `<keel-lottie>`: the one Lottie player (lazy, cached, visibility-aware, themed, reduced-motion aware) |
| `assets/js/keel-charts.js` | Data-bound SVG charts shared by the app and the case study |
| `assets/js/motion-registry.js` | One description of every animation, read by the gallery, the system page and the specs |
| `assets/js/case-study.js` | Case study behavior (the prototype’s behavior is in `src/prototype/`) |
| `assets/lottie/` | 12 hand-authored Lottie animations, light and dark (30 KB gzip in total) |
| `assets/rive/`, `source/rive/` | Keel’s four Rive state machines and the code that writes them (`rivewriter.py`, `build_rive.py`, `rive-check.html`); the recolored CC BY toggle, its original and the recolor script |
| `assets/fallbacks/` | Static SVG of each animation’s settled frame, both themes |
| `assets/img/` | Screenshots (WebP) |
| `source/lottie/` | `build.py` and `kit.py` (the Lottie builder), preview, export and player-test pages, `gen_specs.cjs`, the Switzer wordmark outlines and the script that extracts them (`wordmark.swift`), the fallback exporter |
| `source/*.py` | Contrast audit, 60/30/10 check, the v1 keel animation generator |
| `docs/motion-system/` | Motion system README, animation specifications and storyboards, Rive specification, QA report, phase audit |
| `docs/stillform/` | The v1 audit that led to the second identity (Mineral & Ember), kept as a record |
| `portfolio/` | Portfolio thumbnail, link-preview image, LinkedIn carousel (PNG and PDF), post copy and interview talking points; editable sources in `portfolio/source/` |
| `vercel.json` | Deploy config (live on Vercel): runs `npm run build`, publishes `dist`, redirects the old prototype address, sets Rive headers |
| `netlify.toml` | The same config for Netlify |
| `tests/` | The automated test suite (`npm test`) |

## Run it

Keel is moving to React in phases (`docs/react-migration.md`). The design system and the prototype are React; the case study and the animation library are still plain HTML and are copied into the build as they are.

```bash
npm install
npm run dev       # http://localhost:5173/design-system/
npm run build     # the whole site in dist/ (this is what Netlify runs)
```

The plain pages also run from a static server. They load the Lottie JSON with `fetch`, so serve the folder rather than opening the files directly:

```bash
python3 -m http.server 4317
```

Then open <http://localhost:4317/> for the case study. The React pages (design system, prototype) need `npm run dev` or a build.

**Test:** `npm test` drives headless Chrome (no extra packages) against a served build:

```bash
npm run build
python3 -m http.server 4319 --directory dist
npm test                         # or: node tests/run.mjs journeys keyboard   (VERBOSE=1 shows progress)
```

Seven suites: `pages` (every page and app state, light and dark, at 320, 390, 768 and 1280px: script errors, failed requests, sideways scrolling, text contrast, accessible names, target size, alt text, headings), `links` (every internal URL returns 200; external links reported), `clicks` (presses every control and watches for errors), `keyboard` (tabs through each page: focus visible, on screen, never stuck), `journeys` (the guided tour, explore, returning visitor and the app's numbers, design system interactions, the case study embed) `media` (portfolio image sizes, carousel PDF pages, the video decodes) and `palette` (116 screens and states, both themes, scanned element by element for any color from the earlier identities). Results go to `tests/results/`; the command exits non-zero on any problem.

**Replacing an image, animation or Rive file:** static assets keep their file names, so every reference carries a version tag (`?v=5`). When you replace files, bump it in the HTML pages, `assets/js/keel-lottie.js` (`V`), the Rive `src` values in `assets/js/case-study.js` and the tour preview images in `src/prototype/tour/Overview.jsx`, or browsers may keep showing the old copies.

**Responsive:** every page is written mobile-first (phone styles first, `min-width` layers for wider screens) and checked from 320px to 1440px; see `docs/motion-system/qa-report.md`.

**Deploy:** live at <https://keel-casestudy.vercel.app>. Vercel builds every push to `main`; `vercel.json` sets the build (`npm run build`), the output (`dist`), the old prototype redirect and the Rive headers. `netlify.toml` holds the same setup for Netlify. The link-preview tags in `index.html` use the Vercel address; change them if you deploy elsewhere.

Regenerate the animations or rerun the audits:

```bash
python3 source/lottie/build.py      # every Lottie, light and dark
python3 source/gen_lottie.py        # the keel-settle sailboat, light and dark
node source/lottie/export-fallbacks.mjs   # static SVG fallbacks (serve the repo root on 4317 first)
node source/lottie/gen_specs.cjs     # docs/motion-system/animation-specifications.md
python3 source/rive/build_rive.py   # the four Rive files, light and dark artboards
node portfolio/source/export.mjs    # thumbnail, link preview and LinkedIn carousel (needs Chrome)
python3 source/contrast_audit.py    # 94 pairings, including the glass buttons
python3 source/weight_check.py path/to/screenshot.png   # needs Pillow
```

## How the prototype works

The reading is computed, not drawn. Starting from a fixed “today” (Thursday, October 8, 2026), the prototype walks forward one day at a time, subtracting usual daily spending and any bill that falls due, and ignoring future income. The last day the balance stays above zero is the “steady through” date. The gap between that date and payday is drawn as the depth of a keel below a waterline that always means payday.

Turning a bill off during onboarding, choosing a different payday, checking a purchase, or moving money into a goal all change the reading.

## What’s real and what’s illustrative

**Real and checkable**

- The cited research and competitor positioning, linked in the case study’s references
- The prototype’s logic: the reading, the purchase check and the goal preview all compute live
- The contrast audit (68 pairings across light and dark, 0 failing) and the 60/30/10 measurements, with the scripts that produced them
- The Lottie animation, written by hand against the Lottie schema and rendered frame by frame for review
- The design changes listed in section 12 of the case study, which came from my own review of rendered screens

**Illustrative**

- Keel itself: the name, product and brand
- Every amount, bill, merchant and date in the prototype (sample data)
- The success criteria targets, which are proposals

**Not done yet, and not claimed**

- No interviews. The research section is a literature and competitor review
- No usability testing. Section 12 is a testing plan, clearly labeled

## Design notes in brief

- **Palette, Harbor & Signal:** Fog White `#F4F5FA` canvas (60), white cards (30), Deep Navy `#112358` and Slate `#4A5573` type, and one Signal Lime `#F1FF62` accent (10) that only appears where there’s something to act on. Harbor Blue `#004499` for links and focus, Ocean Blue `#0192C6` for the highlighted data series, Mist Blue `#D4EAFF` for the water. Dark mode uses Abyss `#0B1530` with layered navy surfaces, Fog White type and lime as the action color. Source palette: MP174 by Alex Cristache
- **Accessibility rules in the palette:** lime is 1.1:1 on light, so on light it is only a fill behind navy (13.7:1), and lime shapes carry a navy edge. Glass buttons are measured with their fill composited over each surface (labels 8.97:1 or more), with solid fallbacks for reduced transparency and more contrast. 94 pairings, 0 failing (`source/contrast_audit.py`)
- **Status colors:** positive, negative, warning and info, never lime, in both themes, always paired with words
- **Type:** Switzer in three levels: display Regular, data Medium with tabular figures, body Regular
- **Motif:** a waterline (always payday), a hull resting on it, and a weighted keel whose depth means room past payday. Used for the brand mark, the reading, loading, goal progress, section breaks and the tab icon
- **Motion:** calm and decelerating. Screens and sheets use a 420ms settle curve, and the reading uses a damped spring. No shakes, flashes or success bursts
- **Theme:** follows the OS by default; the case study has a toggle, remembered per browser, that also drives the embedded prototype and swaps the Lottie files
- **Accessibility:** WCAG 2.2 AA contrast on all text, controls and chart marks in both themes, keyboard focus rings, switches with `role="switch"`, live regions for reading changes, and full `prefers-reduced-motion` support

## Motion: what each animation is made of

- **12 Lottie animations**, written in code with `source/lottie/kit.py` (no After Effects export). Three are progress-mapped: their timelines are linear in one value, and the app eases to the frame that matches real state.
- **4 data-bound SVG charts** (spending by category, day by day, upcoming expenses, scenario comparison), because exact numbers can’t live in a keyframed file.
- **Rive:** Keel’s four state machines (Equilibrium Indicator, Savings Goal, Onboarding Equilibrium, Scenario Visualization) are `.riv` files written in code by `source/rive/build_rive.py` with a small format writer (`source/rive/rivewriter.py`), and run live in the case study. Rebuild with `python3 source/rive/build_rive.py`; check renders with `source/rive/rive-check.html`. The app keeps the lighter web implementations, which use the same input names. One more `.riv` is a CC BY community toggle by ashishb, recolored by `source/rive/recolor_toggle.py`.

## Status

- **v1:** case study, prototype, identity, animation and audits
- **Mineral & Ember color system:** palette, semantic tokens, dark theme, recolored animation, re-run audits
- **Harbor & Signal:** a cool fintech palette, Switzer type and glass buttons; every animation, Rive file, fallback and audit regenerated
- **Motion-forward pass:** Lottie library, motion gallery and playground, expanded app (Spending, Goals, Plan, wide layout), embedded app with mobile and desktop modes, design system page, documentation, and an accessibility and performance audit (`docs/motion-system/qa-report.md`)
- **Rive:** Keel’s four state machines, written in code and running in the case study
- **React, phases 1 and 2:** the design system and the prototype in React, with a first-visit welcome, overview and guided tour
- **Automated tests:** `npm test` (pages, links, controls, keyboard, journeys, media)
- **Not done:** React phase 3 (the case study and animation library); usability testing with people; a human screen reader pass; checks in Safari, Firefox and on real devices
