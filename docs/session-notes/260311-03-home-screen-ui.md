# 260311-03-home-screen-ui
2026-03-11

---

## Decisions

- **Header: top-aligned, not vertically centered.** `paddingTop` on the header container + `alignItems: flex-start` on both sides. Gives the center stage more visual focus — same principle as Spotify's profile-pinned-to-top layout.
- **Date format: `WED, 03/11`.** Short day + MM/DD. Matches the mono aesthetic, avoids wrapping.
- **Status line flows in beneath the date** in normal layout flow (not absolutely positioned). Opacity animates 0→1 without shifting the date.
- **Hamburger + username wrapped in a single `TouchableOpacity`.** No handler yet — placeholder `// TODO: open profile drawer` is the hook point.
- **`useVoiceManager` hook owns all recording logic.** `HomeScreen` is dumb: receives `{ status, isRecording, toggleRecord, togglePause, discard }` and drives visuals only.
- **Pause/resume icons use `Ionicons`** (`name="pause"` / `name="play"`), not hand-drawn SVG shapes. Already available via Expo.
- **Tab bar slides down (+10 translateY) on recording**, matching the quote's exit animation exactly.

---

## Changes Made

- `apps/mobile-mock/app/(tabs)/index.tsx` — full rewrite:
  - Header: hamburger + username (idle) / ✕ discard (recording), top-aligned
  - Top-right: date always visible; status line fades in beneath during recording
  - ✕ button is large (`fontSize: 40`), positioned in its own `closeSlot` outside the username row
  - Pause/resume button below center stage, fades + slides in from below (same track as quote)
  - Discard confirmation modal via `<Modal>`
  - All logic delegated to `useVoiceManager`
- `apps/mobile-mock/src/hooks/useVoiceManager.ts` — created:
  - Owns `isRecording`, `isPaused`, `isSaving`, `saveTimer`
  - Exports `status: VoiceStatus` (`'idle' | 'listening' | 'paused' | 'saving'`)
  - Exports `toggleRecord`, `togglePause`, `discard`
- `apps/mobile-mock/app/(tabs)/_layout.tsx` — tab bar now animates `opacity` + `translateY: 10` together on recording state change, matching the quote's exit motion.

---

## Key Reasoning

- **Pause button starts at `translateY: 10`** (the quote's resting exit position) and slides up to `0` as it fades in. This makes it feel like it physically replaces the quote on the same vertical track rather than appearing from nowhere.
- **Close slot is `position: absolute`** with its own style (`closeSlot`) separate from the idle row slot — this lets the ✕ render at full size without being constrained by the username row's layout bounds.
- **`pauseArea` has fixed `height: 72`** so the layout doesn't jump when the button appears/disappears. The space is always reserved.

---

## Next Steps

1. Wire hamburger `onPress` to a profile drawer or modal (the `TouchableOpacity` wrapper is already in place).
2. Build Library and Mind screens per `260311-02-library-and-mind-plan.md`.
3. Extract animation logic from `HomeScreen` into a `useHomeAnimations` hook to finish the "dumb screen" pattern.

---

## Open Questions

- Should the hamburger open a slide-in drawer or a bottom sheet? Not decided.
- Should pausing the recording also pause the ring animations visually? Currently rings keep pulsing while paused.
