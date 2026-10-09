# Rive specification

**Status: specification only. No `.riv` files exist in this project.** Rive files are authored in the Rive editor, which wasn’t available in the environment Keel was built in. Each component below has a working web implementation today that already uses these exact input names, so an authored `.riv` can replace it behind the same interface. Nothing in the case study or app is labeled as Rive.

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
| `hasUpdated` | trigger | Re-read state and settle to the new depth |
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

## Runtime integration (when the files exist)

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

The vendored `rive.js` and `rive.wasm` already exist in the sibling Clearstep project and can be copied when the first `.riv` is authored.
