# Moving Keel to React

Keel is moving from hand-written HTML and JavaScript to React (Vite), one page at a time,
so nothing that works today breaks on the way. Every phase is checked with the same
layout, responsive and accessibility probes used before the move.

| Phase | Page | Status |
| --- | --- | --- |
| 1 | Design system (`/design-system/`), shared tokens, header and site navigation | Done |
| 2 | Prototype (`/prototype/`; `/prototype.html` redirects through a rule in `netlify.toml`), plus the first-visit welcome, overview and guided tour | Done |
| 3 | Case study (`/`) and animation library (`/system.html`) | Next |

## How it fits together during the move

- `vite.config.js` lists each React page as an entry. Bundles go to `/_app` so they never
  collide with the existing `/assets` folder.
- `scripts/copy-static.mjs` copies the pages not yet ported (and the files they use) into
  `dist`. The list shrinks with each phase and disappears at the end.
- Netlify runs `npm run build` and publishes `dist` (`netlify.toml`).
- Theme and motion preferences use the same storage keys everywhere (`keel-theme`,
  `keel-motion`), so a choice made on any page follows you to the others.

## Shared code (`src/shared`)

| File | What it is |
| --- | --- |
| `src/styles/tokens.css` | Mineral & Ember tokens: primitives, semantic light and dark, spacing, radius, motion, reduced motion |
| `prefs.js` | Theme and reduced-motion state, system preference until the person chooses |
| `SiteHeader.jsx` | The sticky site header: site links, page sections with a tracking underline, theme and motion switches |
| `Keel.jsx` | The keel figure and the illustration family |
| `motion.js` | The keel spring (stiffness 70, damping 15) as a hook |
| `model.js` | The illustrative sample data and the steady-through calculation |
| `contrast.js` | WCAG contrast from rendered values |

## Commands

```bash
npm install
npm run dev       # http://localhost:5173/design-system/ (legacy pages are served too)
npm run build     # dist/, the whole site
npm run preview   # serve dist on http://localhost:4318
```

## Phase 2 notes: the prototype

- `src/prototype/` replaces `assets/js/app.js` (retired; it remains in git history). The data model in `src/prototype/model.js` is the same rules line for line, and the app keeps its existing styles (`assets/tokens.css`, `components.css`, `app.css`) and its framework-free modules: the `<keel-lottie>` player and `keel-charts.js` for the data-bound charts.
- Verified to give the same results as before the port: pausing the gym moves the reading to Oct 26; a $700 purchase check reads "covered through Oct 14", with car insurance the first bill reached; recategorizing Hana Sushi moves $16.80; adding $50 to the goal gives Oct 24; a plan of $100 more per paycheck gives $3,030 against $1,730, with the goal done Nov 27 instead of Mar 19, 2027.
- The case study embed and its messages (`go`, `theme`, `motion`, `reset`, `whatif`, and `screen` back) work unchanged at `/prototype/?embed=1`.

### Visitor experience (`src/prototype/tour/`)

| Piece | What it does |
| --- | --- |
| `Intro.jsx` | First visit: "Meet Keel.", with "Take a guided tour" or "Explore on my own" |
| `Overview.jsx` | The four tabs, each with its question, purpose, main feature, a capture of the real screen, and "Explore" (opens that screen with its screen guide) |
| `steps.jsx` | The eight steps. Each names a real element, its screen, and what the visitor can do there; panel actions mirror page actions |
| `Tour.jsx` | Nonmodal guidance: a double outline with a step tag (no dimming, which would lower text contrast), a panel docked above the tab bar on phones or a popover beside the element on wide screens, and a modal finish |
| `GuideSheet.jsx` | The Guide: restart tour, guide for this screen, overview, what the keel means, sample-data assumptions, replay setup, reset |
| `visitor.js` | `keel-visitor` in localStorage: new, touring (with step), completed, exploring |

New in the app: a "Spend a little less each day?" demonstration on Plan. It reruns the same reading with a lower daily figure; balance, bills and payday are unchanged, nothing is saved, and it is labelled as a demonstration.
