# 260311-01-mobile-mock-init: UI Sandbox Init + Home Screen
2026-03-11

---

## Decisions

- **`apps/mobile-mock` is a pure UI sandbox — no shared packages, all data hardcoded.** Patterns graduate to `apps/mobile` only when proven.
- **3-tab bar: Library (left) · Home (center) · Mind (right).** Home is the default landing. The core action is record, not exploration.
- **Center tab: circle indicator only, no text label.** Left/right tabs get `LIBRARY` / `MIND` in Space Mono. Home is self-evident.
- **Tab bar hides entirely during recording** via `RecordingContext` — not a style toggle, a full `return null`.
- **Fonts: Cormorant Garamond (display) + Space Mono (chrome) + Inter (body).** Locked. Not revisiting.
- **Color tokens defined once in `src/theme/tokens.ts`, never hardcoded in components.** Structured for future dark mode.
- **Monthly Wrapped** (not weekly). Portrait is a continuously updating self-model, not a snapshot.
- **Knowledge graph on Mind tab: static SVG for now**, but node sizes/spacing designed as if tappable.

---

## Key Reasoning

**`stateAnim` as single source of truth for recording state visuals.** One 0→1 value drives all visual properties via `interpolate` (ring color, ring width, button bg, button scale, dot morph). All properties stay in sync on the same easing curve.

**Ring stagger via `setTimeout`, not `Animated.stagger`.** `Animated.stagger` fires once and doesn't re-stagger with `Animated.loop`. `setTimeout` offsets let each ring run an independent infinite loop with a permanent phase offset.

**`useNativeDriver: false` for `stateAnim`.** Required because it drives color interpolations (`stroke`, `backgroundColor`). Ring scale animations use separate values with `useNativeDriver: true` — two systems run in parallel without conflict.

**Grain texture as a real image asset, not SVG feTurbulence.** SVG filter support in react-native-svg is inconsistent across platforms. A tiled `.webp` is guaranteed and performs better.

---

## Open Questions

- **Library compact layout** — receipt roll (zero gap, entries stacked tight) vs. notebook (breathing room)? Decide before building.
- **Portrait card design** — always shows most recently updated dimension; needs a concrete visual treatment.
- **Detail overlay trigger** — from Library only, or also reachable from Mind graph nodes?
