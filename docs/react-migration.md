# Moving Keel to React

Keel is moving from hand-written HTML and JavaScript to React (Vite), one page at a time,
so nothing that works today breaks on the way. Every phase is checked with the same
layout, responsive and accessibility probes used before the move.

| Phase | Page | Status |
| --- | --- | --- |
| 1 | Design system (`/design-system/`), shared tokens, header and site navigation | Done |
| 2 | Prototype (`/prototype.html`, moving to `/prototype/`) | Next |
| 3 | Case study (`/`) and animation library (`/system.html`) | After the prototype |

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
