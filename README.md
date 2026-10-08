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
| `assets/tokens.css` | Design tokens shared by both pages: color, type, shape, motion |
| `assets/lottie/keel-settle.json` | Hand-authored Lottie animation: a boat rocks and settles level |
| `assets/vendor/lottie.min.js` | lottie-web 5.12.2 |
| `assets/img/` | Before and after screenshots used in the case study |
| `source/gen_lottie.py` | Generates the Lottie JSON. Source of truth for the animation |
| `source/contrast_audit.py` | WCAG 2.1 contrast audit of every text, control and border pairing |
| `source/weight_check.py` | Measures the 60/30/10 color split from real screenshots |

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
- The contrast audit (19 pairings, 0 failing) and the 60/30/10 measurements, with the scripts that produced them
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

- **Palette:** warm off-white canvas, stone structural surface, deep warm ink, and one terracotta accent that only appears where there’s something to act on
- **Type:** Fraunces for headlines and the reading’s date, Archivo for UI and body
- **Motif:** a waterline (always payday), a hull resting on it, and a weighted keel whose depth means room past payday. Used for the brand mark, the reading, loading, goal progress, section breaks and the tab icon
- **Motion:** calm and decelerating. Screens and sheets use a 420ms settle curve, and the reading uses a damped spring. No shakes, flashes or success bursts
- **Accessibility:** WCAG 2.1 AA contrast on all text and controls, keyboard focus rings, switches with `role="switch"`, live regions for reading changes, and full `prefers-reduced-motion` support

## Status

Version 1 is complete: case study, prototype, identity, animation and audits. A second pass, the STILLFORM direction, is in progress. It covers a revised palette and type system, dark mode, an equilibrium illustration, a Lottie library, Rive specifications, a motion lab, a design system page and cross-channel work. Each step will land as its own merge into `main`.
