# Rive specification

**Status: all four Keel components are authored and running.** I don’t have the Rive editor, so the files are written in code: `source/rive/rivewriter.py` emits the Rive binary format (version 7, type and property keys from the open-source `rive-app/rive-runtime` generated headers), and `source/rive/build_rive.py` authors the four components. Each file holds a `light` and a `dark` artboard. They run live in the case study (section 8, `#rive-four`); `source/rive/rive-check.html` renders any file with given inputs for review.

| File | Size | State machine |
| --- | --- | --- |
| `assets/rive/equilibrium.riv` | 4.9 KB | `Equilibrium` |
| `assets/rive/goal.riv` | 3.7 KB | `Goal` |
| `assets/rive/onboarding.riv` | 10.1 KB | `Onboarding` |
| `assets/rive/scenario.riv` | 5.6 KB | `Scenario` |

The app still ships the web implementations (same input names): the Rive runtime is 51 KB plus a 431 KB WebAssembly module gzipped, more than four times the app’s whole first load.

**One more `.riv` runs in the project:** a CC BY 4.0 community file, [“Toggle switch” by ashishb](https://rive.app/community/files/2795-5761-toggle-switch), recolored to Mineral & Ember by `source/rive/recolor_toggle.py` (colors only; geometry, animations and the `Switch` state machine untouched). See “Integration in practice” at the end.

## How the files are built

- **Exact values through blend states.** Every number input drives a 1D blend state between two poses keyed at the ends of its range. Every keyed property is linear in the input, so the drawing is exact at every value: 9 days draws at 9 days, and every step of the plan chart is exact.
- **Springs stay in the host.** A blend state is a pure function of its input. The host eases the input: the keel’s spring (stiffness 70, damping 15), the goal’s 0.9s settle, the chart’s 520ms change.
- **Feedback is a separate layer.** `hasUpdated`, `contributed` and `applied` play short one-shots on their own layer, so they never fight the value.
- **Reduced motion.** Every timed transition has a 0ms twin guarded by `reducedMotion`, listed first so it wins; one-shots don’t play at all.
- **No text in Rive.** Tick labels, axis labels and readouts are DOM.

## What changed from the spec while authoring

- **Equilibrium Indicator gained `ghostValue`** (number, 0 to 14). The “Now” outline needs its own depth while `steadinessValue` shows the preview.
- **`direction` is accepted but unused.** Steps are poses and moving between them is a blend, which reverses exactly without it. It stays so the interface matches.
- **Scenario’s axis is fixed at $0 to $6,000** and the file encodes the sample plan ($380 saved, $50 a paycheck, 13 paychecks). The app’s SVG chart rescales its axis; the Rive file can’t without a second input per gridline, and a fixed axis keeps steps comparable while the slider moves.
- **Surfaces are flat.** No gradients or soft shadows: the oblique boxes keep the Lottie geometry with flat faces.

Why these four: they respond to state continuously instead of playing once. That is what Rive state machines are for, and what Lottie is not.

## Shared rules

- **Artboard size:** author at 2× the largest display size; the runtime scales down.
- **Colors:** two artboards per component, `light` and `dark`, using the Mineral & Ember illustration tones from `source/lottie/kit.py` (`PALETTES`). No other colors.
- **Easing:** cubic-bezier(0.2, 0.7, 0.2, 1) for arrivals, (0.4, 0, 0.2, 1) for changes in place. The keel alone may use a damped spring (stiffness 70, damping 15, mass 1).
- **Reduced motion:** every state machine has a boolean input `reducedMotion`. When true, every transition has duration 0.
- **Accessibility:** the canvas is `aria-hidden="true"`; the host element carries `role="img"` and an `aria-label` the app updates from the same state it feeds the inputs. Rive renders no text that isn’t also in the DOM.
- **Rendering:** render only while a transition is running (`rive.stopRendering()` when idle, `startRendering()` on input change). Pause when off-screen via IntersectionObserver.

## 1. Equilibrium Indicator

The keel on the Steady screen. Today: SVG plus a JS spring in `assets/js/app.js`, exposed as `window.keelEquilibrium`.

| Input | Type | Meaning |
| --- | --- | --- |
| `steadinessValue` | number, 0 to 14 | Days past payday the money covers. Clamped; below 0 shows as 0.4 (a stub keel) |
| `isInteracting` | boolean | A purchase preview is showing: draw the “Now” ghost at the previous depth |
| `isLoading` | boolean | First reading in progress |
| `hasUpdated` | trigger | Re-read state: the hull dips 6px, rises 2px past rest and settles (54 frames) |
| `ghostValue` | number, 0 to 14 | Depth of the “Now” outline while previewing (added during authoring) |
| `reducedMotion` | boolean | All transitions instant |

| State | Enters when | Visual |
| --- | --- | --- |
| Idle | default | Hull on the waterline, keel at `steadinessValue` depth, still |
| Loading | `isLoading` true | Waterline draws, hull drops, keel sinks (matches the CSS loader) |
| Changing | `hasUpdated` fires or `steadinessValue` changes | Keel springs to the new depth, one small overshoot |
| Previewing | `isInteracting` true | Keel moves to the preview depth; dashed outline remains at the old depth, labeled |
| Needs attention | `steadinessValue` < 0.5 | Stub keel. No color change, no shake: the copy says what happened |
| Reduced motion | `reducedMotion` true | Same states, zero-duration transitions |

Transitions: Idle ↔ Changing (spring, about 900ms), Idle ↔ Previewing (spring), any → Loading (on `isLoading`), Loading → Changing (when `isLoading` turns false).

## 2. Interactive Savings Goal

Today: the Goal Progress Lottie, progress-mapped (`goal.json`, frames 0 to 200 linear, completion 200 to 260).

| Input | Type | Meaning |
| --- | --- | --- |
| `progress` | number, 0 to 1 | saved ÷ target |
| `isComplete` | boolean | progress ≥ 1 |
| `contributed` | trigger | Money was just added: ease the ballast to `progress` |
| `reducedMotion` | boolean | |

States: Filling (ballast width = `progress`, ember block at the leading edge), Contributed (0.9s settle to the new width), Complete (block lowers into its seat, capstone line draws; plays once).

## 3. Onboarding Equilibrium

Today: the Onboarding Transition Lottie with four segments (`onboarding.json`).

| Input | Type | Meaning |
| --- | --- | --- |
| `step` | number, 0 to 3 | accounts, bills, payday, ready |
| `direction` | number, 1 or -1 | forward or back, so back undoes exactly what forward added |
| `reducedMotion` | boolean | |

States: Accounts (mass lands, beam tips), Bills (three bills stack, beam swings), Payday (shore extends to the payday post, beam levels), Ready (ember settles on the pivot). Each transition about 1s; backward transitions are the reverse.

## 4. Scenario Visualization

Today: an SVG step chart in `assets/js/keel-charts.js` (`KeelCharts.scenario`).

| Input | Type | Meaning |
| --- | --- | --- |
| `extraPerPaycheck` | number, 0 to 300 | The slider value |
| `applied` | trigger | The plan was saved |
| `reducedMotion` | boolean | |

Caveat recorded on purpose: a Rive artboard can only approximate exact chart values unless every step height is bound to a number input. If the chart moves to Rive, bind each step to its own input or keep the SVG. Accuracy wins over tooling.

## Runtime integration

```html
<canvas id="eq-canvas" width="680" height="312" aria-hidden="true"></canvas>
<script src="assets/vendor/rive.js"></script>
<script>
  const r = new rive.Rive({
    src: 'assets/rive/equilibrium.riv',
    canvas: document.getElementById('eq-canvas'),
    artboard: isDark() ? 'dark' : 'light',
    stateMachines: 'Equilibrium',
    autoplay: true,
    onLoad: () => {
      r.resizeDrawingSurfaceToCanvas();            // crisp on high-DPI screens
      const inputs = r.stateMachineInputs('Equilibrium');
      const steadiness = inputs.find(i => i.name === 'steadinessValue');
      steadiness.value = window.keelEquilibrium.inputs.steadinessValue;
    }
  });
  // dispose on teardown: r.cleanup();
</script>
```

## Integration in practice: the community toggle

What `assets/js/case-study.js` does with `assets/rive/keel-toggle.riv`, and what the four Keel components should copy:

- **Lazy runtime.** `assets/vendor/rive.js` (2.21.2, 51 KB gzip) and `rive.wasm` (431 KB gzip) load only when the demo is within 300px of the viewport. `rive.RuntimeLoader.setWasmUrl()` points at the self-hosted WASM.
- **One owner of state.** A native `<button role="switch">` holds `aria-checked` and fires the `Pressed` trigger. `shouldDisableRiveListeners: true` stops the file’s own pointer listeners, so the visual can’t drift from the accessible state.
- **Themes.** Two recolored files; the instance is rebuilt on theme change and restores its state.
- **Reduced motion.** The state machine isn’t started; the runtime scrubs the `On` or `Off` animation to its end instead.
- **Rendering.** `stopRendering()` off-screen, `startRendering()` on interaction or when visible; `cleanup()` before every rebuild.
- **High DPI.** `resizeDrawingSurfaceToCanvas()` in `onLoad`.

Measured: the switch toggles from the keyboard, and the reading it drives moves from Oct 25 to Oct 26, matching the app.
