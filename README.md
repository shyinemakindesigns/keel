# Keel

A self-directed UX and visual design case study by Shyine Makin.

Keel is a fictional personal finance app built on one idea: confidence with money comes from steadiness, not restriction. Most budgeting apps meet a hard week with red numbers and overages. Keel leads with a single forward-looking answer instead: **if nothing else came in, how long are you covered?**

> A keel is the part of a boat you never see. It doesn’t stop the waves. It keeps you upright through them.

Keel is not a real company, product or client project, and it is not affiliated with any financial institution.

## What’s here

| Path | What it is |
| --- | --- |
| `index.html` | The long-form case study: problem, research review, define, information architecture, wireframes, identity and motion system, prototype, testing plan, reflection, references |
| `prototype.html` | The interactive prototype, onboarding through to the steadiness view. Works on its own and on a phone |
| `assets/tokens.css` | Mineral & Ember design tokens shared by both pages: brand primitives, a semantic layer, a full dark theme, shape and motion |
| `assets/lottie/keel-settle.json`, `keel-settle-dark.json` | Hand-authored Lottie animation, one file per theme with identical keyframes: a boat rocks and settles level |
| `assets/vendor/lottie.min.js` | lottie-web 5.12.2 |
| `assets/img/` | Before and after screenshots used in the case study |
| `source/gen_lottie.py` | Generates both Lottie files. Source of truth for the animation |
| `source/svg_tokens.py` | Rewrites hardcoded SVG colors into token classes so artwork follows the theme |
| `source/contrast_audit.py` | WCAG 2.1/2.2 AA contrast audit of every text, control, chart and border pairing, both themes |
| `source/weight_check.py` | Measures the 60/30/10 color split from real screenshots (`--dark` for the dark theme) |
| `docs/stillform/` | STILLFORM upgrade notes, starting with the Phase 0 audit |

## Run it

The pages load the Lottie JSON with `fetch`, so serve the folder rather than opening the files directly:

```bash
python3 -m http.server 4317
```

Then open <http://localhost:4317/> for the case study and <http://localhost:4317/prototype.html> for the prototype.

Regenerate the animation or rerun the audits:

```bash
python3 source/gen_lottie.py
python3 source/contrast_audit.py
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
- The design changes listed in section 8 of the case study, which came from my own review of rendered screens

**Illustrative**

- Keel itself: the name, product and brand
- Every amount, bill, merchant and date in the prototype (sample data)
- The success criteria targets, which are proposals

**Not done yet, and not claimed**

- No interviews. The research section is a literature and competitor review
- No usability testing. Section 8 is a testing plan, clearly labeled

## Design notes in brief

- **Palette, Mineral & Ember:** Porcelain Clay `#F6F3ED` canvas (60), Mineral Stone `#E6E2D9` surfaces (30), Volcanic Ink `#252A28` and Weathered Slate `#656B66` type, and one Oxidized Ember `#B94F36` accent (10) that only appears where there’s something to act on. Dark mode uses Basalt `#202725` with layered charcoal surfaces, Chalk `#F4F0E7` type and a lifted ember `#E07F60`
- **Accessible derivatives:** where a brand value fails WCAG as given, a derived token takes that role instead of the brand hex changing: white labels on ember (Chalk is 4.36:1), `#9E412B` for ember text and focus (the brand hex is 4.48:1 as text), `#555B56` slate inside stone surfaces (the brand slate is 4.22:1 there)
- **Status colors:** positive, negative (oxblood, distinct from ember), warning and info, in both themes, always paired with words
- **Type:** Fraunces for headlines and the reading’s date, Archivo for UI and body
- **Motif:** a waterline (always payday), a hull resting on it, and a weighted keel whose depth means room past payday. Used for the brand mark, the reading, loading, goal progress, section breaks and the tab icon
- **Motion:** calm and decelerating. Screens and sheets use a 420ms settle curve, and the reading uses a damped spring. No shakes, flashes or success bursts
- **Theme:** follows the OS by default; the case study has a toggle, remembered per browser, that also drives the embedded prototype and swaps the Lottie files
- **Accessibility:** WCAG 2.2 AA contrast on all text, controls and chart marks in both themes, keyboard focus rings, switches with `role="switch"`, live regions for reading changes, and full `prefers-reduced-motion` support

## Status

- **v1:** case study, prototype, identity, animation and audits
- **STILLFORM, color refinement (done):** Mineral & Ember palette, semantic tokens, dark theme, recolored Lottie, re-run audits. Layout, type and spacing deliberately unchanged
- **STILLFORM, next:** see `docs/stillform/00-audit.md` for the remaining scope (equilibrium illustration, Lottie library, Rive specification, motion lab, design system page, cross-channel work). Each step lands as its own merge into `main`
