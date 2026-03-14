# 260313-01 — Component Extraction & Mobile Migration
2026-03-13

---

## What We Did

### Component extraction in mobile-mock

Discussed the right level of abstraction before touching any code. Key question: what earns its own file?

Decision: extract exactly two components. Both clear the bar because they have significant animation logic and will have sibling UI added around them in the future.

**`BreathingRing`** (`src/components/BreathingRing.tsx`)
- Owns the SVG circle + all breathing animation (ringR, ringOpacity, breathingActive)
- Own internal `stateAnim` for stroke color/width interpolation (no sharing needed — both components react to the same `isRecording` prop with identical timing, so they stay in sync independently)
- Props: `{ isRecording: boolean }`

**`RecordButton`** (`src/components/RecordButton.tsx`)
- Owns the size-morph animation (180→68→81px), texture image fade, dot color/size
- Own internal `stateAnim`
- Props: `{ isRecording: boolean, onPress: () => void }`

**What was deliberately NOT extracted:**
- Timer + saved badge — 3 lines in the header, costs more to abstract than to keep inline
- Tab bar — exists once, tightly coupled to navigation
- Detail overlay — one-off
- A `RecordingStage` wrapper — wait until vinyl keywords and journal prompt actually arrive

**Future home screen structure discussed:**
- Vinyl keywords will wrap around the ring (between ring and button)
- Journal prompt will sit above the stage
- These additions are why ring and button must stay as separate siblings, not fused

`index.tsx` after extraction: ~200 lines stripped of animation noise. Center stage is now just:
```tsx
<BreathingRing isRecording={isRecording} />
<RecordButton isRecording={isRecording} onPress={toggleRecord} />
```

---

### Migration from mobile-mock → mobile

Full UI migration. All mock design changes are now in the production app.

**Assets added to mobile:**
- `assets/space4.jpg` — used as record button texture
- `assets/universe.jpg` — used as Mind screen hero image

**Files updated:**
- `src/theme/textures.ts` — replaced `button` (paper4.jpg) with `space` + `universe`
- `app/_layout.tsx` — preloads all 3 textures at splash

**Files replaced:**
- `app/(tabs)/_layout.tsx` — new 3-tab bar (Library/Home/Mind) with custom geometry icons
- `app/(tabs)/index.tsx` — breathing ring + timer + saved badge (replaces old 2-ring pulse)
- `app/(tabs)/mind.tsx` — hero image + wrapped/portrait cards (replaces geometric eye)

**Files created:**
- `src/shared/components/BreathingRing.tsx`
- `src/shared/components/RecordButton.tsx`
- `src/mocks/data.ts` — 22 mock logs (Feb–Mar 2026)
- `app/(tabs)/library.tsx` — full log list with collection chips + detail overlay

**Files deleted:**
- `app/(tabs)/notes.tsx` — replaced by library.tsx

---

## Architecture Notes

### Path structure differences (intentional)
Mobile uses the organized `src/shared/`, `src/core/` structure per CLAUDE.md. Mock uses a flatter layout. All import paths were adjusted during migration. TypeScript confirms zero errors in both apps.

### Library screen data
Library in mobile uses `src/mocks/data.ts` — same 22 logs as mock. This is intentional for now. Wiring to SQLite (`LogRepository` + `EntryRepository`) is Phase 0 work, separate from this UI migration.

### `stateAnim` duplication
BreathingRing and RecordButton each own their own `stateAnim` Animated.Value responding to `isRecording`. They don't share it. This is correct — both use identical timing/easing so they animate in sync without coupling.

---

## Files Changed

**mobile-mock:**
- `src/components/BreathingRing.tsx` — new
- `src/components/RecordButton.tsx` — new
- `app/(tabs)/index.tsx` — refactored to use extracted components

**mobile:**
- `app/(tabs)/_layout.tsx` — replaced
- `app/(tabs)/index.tsx` — replaced
- `app/(tabs)/library.tsx` — new
- `app/(tabs)/mind.tsx` — replaced
- `app/(tabs)/notes.tsx` — deleted
- `src/shared/components/BreathingRing.tsx` — new
- `src/shared/components/RecordButton.tsx` — new
- `src/mocks/data.ts` — new
- `src/theme/textures.ts` — updated
- `app/_layout.tsx` — asset preload updated
- `assets/space4.jpg` — new
- `assets/universe.jpg` — new

---

## Open Questions (deferred)
- Wire library to SQLite when Phase 0 DB work is complete
- Journal prompt component above the stage (future)
- Vinyl keywords wrapping around ring (future)
- Search icon → slide-down search bar (Library)
- Sparkles icon → AI modal placeholder (Mind)
