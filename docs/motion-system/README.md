# Keel motion design system

The motion system behind Keel: principles, tokens, choreography, the animation library, and how it’s built. The live version is `system.html`; per-animation detail is in [animation-specifications.md](animation-specifications.md).

## Principles: Keel Motion Language

Every animation must answer: **what does this movement help someone understand?**

| Principle | Rule | Rules out |
| --- | --- | --- |
| **Settle** | Things move toward a stable position and stop. Decelerate into rest. | Bounce, perpetual motion, spin |
| **Reveal** | Information arrives in reading order, in small groups. | Everything appearing at once; long staggered intros |
| **Connect** | What changes keeps its identity: bars move, indicators travel, objects persist across steps. | Redraw-from-zero, cross-fading unrelated screens |
| **Respond** | Every action gets immediate, specific feedback within 140ms, then gets out of the way. | Silent buttons, decorative confirmation |
| **Reassure** | Done feels done; waiting shows signs of life; bad news is said in words. | Shakes, flashes, confetti, red pulses |

## Tokens (`assets/tokens.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--ease-settle` | cubic-bezier(0.2, 0.7, 0.2, 1) | Default. Arrivals and screen changes |
| `--ease-enter` | cubic-bezier(0.22, 1, 0.36, 1) | Sheets and reveals |
| `--ease-exit` | cubic-bezier(0.4, 0, 1, 1) | Leaving |
| `--ease-standard` | cubic-bezier(0.4, 0, 0.2, 1) | Changes in place: charts, values, colors |
| `--dur-press` | 140ms | Button and chip feedback |
| `--dur-hover` | 200ms | Hover |
| `--dur-card` | 280ms | Rows, confirmations, timeline marks |
| `--dur-chart` | 520ms | Every data-bound chart |
| `--dur-move` | 420ms | Screens, sheets, tab indicator |
| `--dur-settle` | about 900ms | The keel (spring k 70, c 15). The only spring in the system |
| `--dur-illustration` | 0.75 to 2.2s | Feedback Lotties |
| `--dur-hero` | 3 to 5s | Signature illustrations |
| `--stagger` | 60ms | Sequential reveals |

Reduced motion (OS setting, or `data-motion="reduced"` on `<html>`) sets every duration to 0. State still changes; it just doesn’t travel.

## Choreography

1. **One focal motion at a time.** When a screen opens, the primary element (the reading, the bars) moves first; secondary elements follow within 60 to 120ms.
2. **The ember moves last.** In every illustration the ember element is the final thing to settle, so the eye ends where the meaning is.
3. **Consequences after confirmations.** Confirm the action (check, completion), then show what changed (bars move, reading settles).
4. **No autoplay pile-ups.** In-view animations play once each as they’re reached; nothing loops except Loading, and Loading only while waiting.

## Technology rules

| Need | Use | Why |
| --- | --- | --- |
| Narrative or feedback illustration | Lottie | Vector, small, designer-controlled timing |
| One exact value over time | Lottie, progress-mapped | Timeline is linear in the value; the app eases to the matching frame |
| Several exact values | SVG + JS (`keel-charts.js`) | Lottie can’t hold arbitrary data |
| Continuous response to state | Rive (Keel’s four, authored in code; plus one CC BY community toggle) | State machines; see [rive-spec.md](rive-spec.md) |
| Simple UI transitions | CSS with tokens | Compositor-only, zero JS |

## The player: `<keel-lottie>` (`assets/js/keel-lottie.js`)

```html
<keel-lottie name="equilibrium" trigger="inview" poster="end" label="..."></keel-lottie>
```

- `trigger`: `inview` (play once at 35% visible), `load`, or `manual`
- `loop`, `poster` (`end`, `start` or a frame), `label` (empty means decorative and hidden from assistive tech), `no-fallback`
- API: `play()`, `pause()`, `stop()`, `replay()`, `goTo(f)`, `playSegment(a, b)` (reverse if a > b), `scrubTo(progress, { from, to, duration })`
- Loads lottie-web once, on first need; fetches each JSON once however many players use it; loads only within 300px of the viewport; pauses off-screen and in hidden tabs; swaps to the dark file on theme change, holding the frame; shows a static SVG fallback until ready

## Building the library

```bash
python3 source/lottie/build.py              # all animations, light and dark
python3 source/lottie/build.py equilibrium  # one
node source/lottie/gen_specs.js             # regenerate animation-specifications.md
```

Static fallbacks (`assets/fallbacks/`) are exported from `source/lottie/export.html` in headless Chrome. Frame previews for review: `source/lottie/preview.html?name=equilibrium&frames=0,48,96`. Player tests: `source/lottie/player-test.html` (14 checks).

## Engineering guidelines

- **Asset budget:** a Lottie file stays under 20 KB raw (largest today: 16.3 KB). All 24 files total 30 KB gzipped.
- **Lazy everything:** no animation JSON loads before it’s within 300px of the viewport; the runtime loads on first need.
- **Cleanup:** players destroy their animation when removed from the DOM; rAF loops stop when values settle.
- **Never fake waiting:** loading states appear only after 300ms of real waiting.
- **Fallbacks:** every Lottie has a static SVG of its settled frame in both themes.
- **Browser support:** evergreen Chrome, Safari, Firefox and Edge. Uses custom elements, IntersectionObserver, `inert`, and CSS custom properties.
