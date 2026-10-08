# Motion upgrade: Phase A audit and plan

Audit of `main` at `4c71691` (Mineral & Ember color system merged), written October 8, 2026, before any motion work.

## 1. Architecture as it stands

| Area | State |
| --- | --- |
| Framework | None. Static HTML, CSS and vanilla JS. No build step, no package manager. The brief describes the project as “React/HTML/CSS/JS”; it is the latter, and stays that way (see decisions) |
| Routes | `index.html` (case study), `prototype.html` (the app, with `?screen=`, `?theme=` and `?embed=1`) |
| App screens | welcome, accounts, bills, payday, taking (first reading), home (Steady), activity, goals, plus a bottom sheet |
| Case study | 9 numbered sections plus references, sticky table of contents, theme toggle, embedded prototype in an iframe |
| Tokens | `assets/tokens.css`: Mineral & Ember primitives, semantic layer, dark theme, motion durations and easings |
| Motion dependencies | lottie-web 5.12.2, vendored (300 KB). Nothing else |
| Chart libraries | None. All charts are hand-built SVG |
| Rive | None. No `.riv` files exist |
| 3D illustrations | None. The only illustration is the flat keel boat |
| Accessibility patterns | `role="switch"`, focus moved to the screen heading on navigation, sheet focus return and Escape, `aria-live` on the reading and purchase check, `prefers-reduced-motion` honored in CSS and JS |
| Responsive | App is a single phone-width column (max 430px) at every size. Case study tested at 375 to 1920 with no horizontal overflow |

## 2. Animation inventory

| # | Name | Location | Technology | Purpose | Trigger | Duration | Performance | Reduced motion | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Keel settle | Prototype welcome; case study hero, illustration section, frame strip | Lottie (hand-authored JSON, light and dark files) | Introduces the keel metaphor | Welcome shown; case study: in view | 5s, plays once, holds | 11 KB JSON. Case study runs 8 instances at once (hero, large view, 6 strip frames), all loaded on page load | Shows final frame | **Keep.** Moves out of the case study hero (the new Equilibrium takes that role) into the illustration section. Lazy-load instead of loading all 8 up front |
| 2 | Taking a reading | Prototype, first reading screen | CSS keyframes on SVG (line draw, hull drop, keel sink) | Loading that teaches the motif | Screen shown | about 2.3s | Compositor-friendly transforms, negligible | 1ms, then continues | **Keep.** It works and is motif-based. Not duplicated by the new loading Lottie, which covers waits with unknown length |
| 3 | Keel depth spring | Prototype home, the reading | JS damped spring writing SVG attributes | Shows room past payday changing | Reading changes (bills, payday, purchase check, goal transfer) | about 900ms | One rAF loop only while moving | Jumps to the end value | **Keep, formalize.** Becomes the web implementation of the Rive “Equilibrium Indicator” spec, with named inputs |
| 4 | Screen transition | Prototype, every screen | CSS opacity and translate, 420ms ease-settle | Orientation | Navigation | 420ms | Compositor only | Instant | **Keep** |
| 5 | Sheet | Prototype | CSS translate plus scrim fade | Continuity for detail views | Open and close | 420ms | Compositor only | Instant | **Keep** |
| 6 | Press, switch, chip | Prototype, case study buttons | CSS transitions | Response | Pointer and keyboard | 180ms | Negligible | Instant | **Keep** |
| 7 | Tab marker | Prototype tab bar | CSS background-color fade | Orientation | Tab change | 420ms | Negligible | Instant | **Improve.** The marker should travel between tabs (Connect principle) |
| 8 | Goal ballast fill | Prototype goals | JS cubic ease on SVG width | Progress | Money added | 900ms | One rAF loop | Instant | **Replace** with the progress-mapped Goal Progress Lottie (animation 05) |
| 9 | Category weight bar | Prototype activity | CSS background-color only; widths jump | Filter feedback | Filter chip | 420ms | Negligible | Instant | **Replace** with data-bound animated bars (animation 04). Today a recategorized transaction couldn’t animate at all |
| 10 | Snap vs settle demo | Case study, motion section | JS (bezier and spring) on SVG | Explains the pacing decision | Button | 350ms and about 900ms | rAF while moving | Jumps to the end | **Keep**, moves into the Motion Playground |
| 11 | Easing curve plots | Case study | Static SVG drawn by JS | Documents tokens | Load | n/a | n/a | n/a | **Keep** |
| 12 | Horizon dividers, TOC marker | Case study | CSS | Wayfinding | Scroll | 180 to 420ms | Negligible | Instant | **Keep**, add a one-time line draw on entry |

## 3. Decisions on conflicts in the brief

1. **Typography.** The brief lists Instrument Serif, Satoshi and IBM Plex Mono, and also says to maintain the existing approved typography implementation and not replace fonts unnecessarily. The implemented and last-approved fonts are Fraunces and Archivo (the color brief explicitly said not to change typography). They stay. Swapping fonts is a one-token change in `tokens.css` whenever it’s requested directly
2. **Framework.** No React. The brief’s `<LottieAnimation>` interface is implemented as a vanilla custom element, `<keel-lottie>`, with the same options (trigger, loop, autoplay, reduced-motion fallback, aria-label) plus a JS API (play, pause, replay, stop, goTo). It works in both pages without a build step
3. **Which animations are Lottie.** Lottie is keyframed, so it can only show exact data in two ways: a single value mapped onto the timeline (scrub to the frame that equals the value), or not at all. So:
   - Narrative and feedback animations are **Lottie**
   - Single-value data animations (Equilibrium Line, Goal Progress, onboarding steps) are **progress-mapped Lottie**: the timeline is linear in the value, and the app eases to the frame that matches real state
   - Multi-value charts (Spending Insight, Upcoming Expenses, Weekly Summary, Scenario Comparison) are **data-bound SVG with JS**, because a Lottie can’t hold five independent accurate bar lengths. They are labeled SVG, never Lottie
4. **Demo data.** The brief’s example figures ($5,200 income, $2,850 balance, and so on) are marked illustrative. The prototype already has a consistent model behind “steady through Oct 25”, quoted throughout the case study. It stays, extended with income ($1,980 every two weeks), last stretch’s spending, and goals, so every new screen reads from the same numbers
5. **Rive.** There is no Rive editor here, so no `.riv` files. The four priority components get a written state-machine specification (inputs, states, transitions) and working web implementations that use the same input names, labeled “web prototype, pending Rive authoring”. No file will be called Rive unless it is one
6. **Hero.** The new Hero Equilibrium Lottie becomes the case study hero. The keel boat stays as the app’s welcome illustration and in the illustration section, so nothing that works is thrown away

## 4. Phased plan

Each phase is verified by rendering before the next starts, and lands on `main` through its own branch.

| Phase | Work | Verification |
| --- | --- | --- |
| A | This audit | |
| B | Motion tokens; `<keel-lottie>` player (lazy runtime, in-view trigger, visibility-aware pause, theme swap, reduced motion, controls); `lottie_kit.py` builder shared by every animation | Player test page: play, pause, replay, stop, goTo, offscreen pause, theme swap, reduced motion |
| C | 01 Hero Equilibrium | Frame strips in both themes |
| D | Dashboard: 02 Equilibrium Line, 10 Upcoming Expenses, 09 Weekly Summary, 11 Loading | Values match the model; screenshots |
| E | Goals and transactions: 04 Spending Insight, 05 Goal Progress, 06 Transaction Update, 07 Empty State, 08 Goal Created, 12 Scenario Comparison (new Plan tab), 15 Confirmation; transaction detail with editable category; goal creation; reset demo | Functional script plus screenshots |
| F | Onboarding: 13 Onboarding Transition, 03 Clarity Reveal, 14 Brand Signature | Frame strips |
| G | Motion Gallery in the case study | All 15 entries play on demand, none autoplay together |
| H | Motion Playground | Each demo triggerable, reduced-motion toggle |
| I | Experience KEEL: desktop and mobile modes, full-experience link, wide-screen app layout, loading and failure states, sandboxed iframe | 375 to 1920 |
| J | Case study storytelling: progressive reveals, IA line drawing, lo-fi to hi-fi comparison, storyboards | No-JS and reduced-motion pass |
| K | Motion design system documentation page and docs | Links resolve |
| L | Accessibility, performance and QA report | Console clean, metrics measured |
