# Keel design brief

Keel is a fictional personal finance app (a self-directed portfolio project, not a real company). This file is the short brand reference for anyone, or any tool, adding visuals or motion to the project. The full system lives in `assets/tokens.css` and the case study.

## The idea

**Money moves. You stay steady.** A keel is the part of a boat you never see. It doesn’t stop the waves; it keeps you upright through them. Keel leads with one answer, how long you’re covered, before any detail.

## Personality

Calm, precise, modern fintech. Clear, grounded, quietly confident.

**Not:** urgent, playful, bouncy, gamified, alarming, cluttered, decorative.

## Color: Harbor & Signal

Cool grey-white surfaces, deep navy type, one lime signal. Source palette: MP174 by Alex Cristache, extended with accessible greys, status colors and a dark theme.

| Role | Light | Dark |
| --- | --- | --- |
| Canvas (60%) | Fog White `#F4F5FA` | Abyss `#0B1530` |
| Surface (30%) | Paper `#FFFFFF`, Cloud `#E9EDF5`, Mist Blue `#D4EAFF` (water) | Deep Navy `#112358`, Night `#1A2E66` |
| Text | Deep Navy `#112358`, Slate `#4A5573` | Fog White `#F4F5FA`, Frost `#AEB9D6` |
| Accent (10%, actions only) | Navy fills with Signal Lime `#F1FF62` labels; links and focus in Harbor Blue `#004499` | Signal Lime fills with navy labels; lime links and focus |
| Data highlight | Ocean Blue `#0192C6` | `#3DB8EA` |
| Status (never lime) | positive `#0B7350`, negative `#B42342`, warning `#8A5600`, info `#0A6A99` | `#5ED3A0`, `#FF8FA3`, `#FFC857`, `#7CC8F2` |

Lime is 1.1:1 against the light surfaces: on light it is only a fill behind navy, and any lime shape that has to be seen carries a navy edge.

## Buttons

Pill-shaped glass: a translucent fill with a background blur and a top highlight. Labels are measured on the glass composited over every surface it can sit on (8.97:1 or more), the secondary button's edge is 3:1 or more, and people who ask for less transparency or more contrast get solid buttons.

## Type

Switzer (Indian Type Foundry, free via Fontshare), one family in three levels: display Regular with tight leading, data Medium with tabular figures, body Regular 14 to 17px.

## Shape

One motif: a horizontal line (the waterline, which always means payday), a form resting on it, and weight hanging below. Illustrations are 3D-inspired: oblique projection, flat three-tone shading per material (paper, cloud, navy, slate, signal lime), a thin navy edge on light, soft radial contact shadows. No gradients except shadows, no glow. Glass is for buttons only.

## Motion

Keel Motion Language: **settle, reveal, connect, respond, reassure.** Movement decelerates into rest (`cubic-bezier(0.2, 0.7, 0.2, 1)`). At most one small, damped overshoot, and only for physical objects. No shakes, bursts, confetti or attention loops. Every animation must answer: what does this movement help the user understand?

- Decorative and narrative motion: Lottie, authored for Keel (`source/lottie/`), never stock
- Exact data: progress-mapped Lottie for one value, data-bound SVG for many
- Interactive state machines: Rive. Keel’s four `.riv` files are authored in code (`source/rive/build_rive.py`) and run on the case study; the app ships web implementations with the same input names, for weight. Third-party Rive or Lottie files are allowed only if they’re licensed for reuse, recolored to these tokens, and credited where they appear (the one example: the CC BY toggle in `assets/rive/`)
- Reduced motion: show the settled final state; never hide information behind animation

## Lottie runtime decision

lottie-web 5.12.2, vendored, wrapped by `<keel-lottie>` (`assets/js/keel-lottie.js`). The animation-design skill recommends `@lottiefiles/lottie-player` for plain HTML; that package (2.0.3) is itself built on `lottie-web ^5.12.2`, so it would add a wrapper without changing the renderer. lottie-web is not marked deprecated on npm (latest 5.13.0, May 2025). Revisit if the project moves to dotLottie.
