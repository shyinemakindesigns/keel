# Keel design brief

Keel is a fictional personal finance app (a self-directed portfolio project, not a real company). This file is the short brand reference for anyone, or any tool, adding visuals or motion to the project. The full system lives in `assets/tokens.css` and the case study.

## The idea

**Money moves. You stay steady.** A keel is the part of a boat you never see. It doesn’t stop the waves; it keeps you upright through them. Keel leads with one answer, how long you’re covered, before any detail.

## Personality

Calm, grounded, architectural, editorial, warm. Quiet confidence.

**Not:** urgent, playful, bouncy, gamified, alarming, glossy, neon, “fintech blue”.

## Color: Mineral & Ember

| Role | Light | Dark |
| --- | --- | --- |
| Canvas (60%) | Porcelain Clay `#F6F3ED` | Basalt `#202725` |
| Surface (30%) | Mineral Stone `#E6E2D9` | `#2A322F` |
| Text | Volcanic Ink `#252A28`, Weathered Slate `#656B66` | Chalk `#F4F0E7`, `#B3B6AE` |
| Accent (10%, actions only) | Oxidized Ember `#B94F36` (text-safe `#9E412B`) | `#E07F60` |
| Status (never ember) | positive `#2E6A4E`, negative `#9B2C3A`, warning `#7D5300`, info `#3B5A72` | `#7FC4A0`, `#F09AA3`, `#E2B45C`, `#9DBCD6` |

## Type

Fraunces (headlines, the reading’s date, wordmark) and Archivo (UI, body, numbers with tabular figures).

## Shape

One motif: a horizontal line (the waterline, which always means payday), a form resting on it, and weight hanging below. Illustrations are 3D-inspired: oblique projection, flat three-tone shading per material (porcelain, mineral, basalt, slate, ember), soft radial contact shadows. No gradients except shadows, no gloss, no glow.

## Motion

Keel Motion Language: **settle, reveal, connect, respond, reassure.** Movement decelerates into rest (`cubic-bezier(0.2, 0.7, 0.2, 1)`). At most one small, damped overshoot, and only for physical objects. No shakes, bursts, confetti or attention loops. Every animation must answer: what does this movement help the user understand?

- Decorative and narrative motion: Lottie, authored for Keel (`source/lottie/`), never stock
- Exact data: progress-mapped Lottie for one value, data-bound SVG for many
- Interactive state machines: Rive specification plus a web implementation until `.riv` files are authored
- Reduced motion: show the settled final state; never hide information behind animation

## Lottie runtime decision

lottie-web 5.12.2, vendored, wrapped by `<keel-lottie>` (`assets/js/keel-lottie.js`). The animation-design skill recommends `@lottiefiles/lottie-player` for plain HTML; that package (2.0.3) is itself built on `lottie-web ^5.12.2`, so it would add a wrapper without changing the renderer. lottie-web is not marked deprecated on npm (latest 5.13.0, May 2025). Revisit if the project moves to dotLottie.
