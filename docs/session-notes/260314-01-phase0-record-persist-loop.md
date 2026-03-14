# 260314-01 — Phase 0: Record → Persist Loop
2026-03-14

---

## What We Did

Wired the full Phase 0 record-to-persist loop: press record → mic captures audio → stop → entry saved to SQLite → appears in Library.

---

## Implementation

### Packages installed
- `expo-audio` — microphone recording with metering
- `expo-keep-awake` — keeps screen on during recording

### New files
- `apps/mobile/src/shared/utils/audio.ts` — `resampleLevels()`, bucket-averaging downsampler (ported from old repo). Compresses full metering history to 200 samples for DB storage.
- `apps/mobile/src/shared/utils/uuid.ts` — `generateUUID()`, UUID v4 via `Math.random()`. Needed because Hermes JS engine has no `crypto` global.
- `apps/mobile/src/shared/hooks/useLibraryLogs.ts` — DB-backed library data hook. Queries `logs` + `entries` on every Library tab focus via `useFocusEffect`. Returns `LibraryLog[]` shaped to match the existing render code.

### Modified files

**`apps/mobile/app.json`**
- Added `NSMicrophoneUsageDescription` under `ios.infoPlist`
- Added `RECORD_AUDIO` under `android.permissions`

**`apps/mobile/src/shared/hooks/useVoiceManager.ts`** — full rewrite
- Uses `useAudioRecorder` + `useAudioRecorderState` from `expo-audio`
- Custom `TRANSCRIPTION_PRESET`: 16kHz mono AAC at 32kbps (speech recognition optimized)
- `isMeteringEnabled: true` — 70ms metering interval, normalized dB → 0–1
- On stop: reads `durationMillis` from native recorder state (pause-aware), downsamples metering history to 200 samples, writes `insertLog` + `insertEntry` to SQLite
- Adds `audioLevels: number[]` to return (rolling 50-bar live waveform, for future visual use)
- `useKeepAwake()` to prevent screen sleep during recording

**`apps/mobile/app/_layout.tsx`**
- Fire-and-forget `getDb()` in `useEffect` with empty deps — runs migrations before first user interaction

**`apps/mobile/app/(tabs)/library.tsx`**
- Replaced `mockLogs`/`MockLog` import with `useLibraryLogs`/`LibraryLog`
- `monthGroups` now derived from live DB data; render code unchanged

**`apps/mobile/src/core/db/LogRepository.ts` + `EntryRepository.ts`**
- Replaced `crypto.randomUUID()` with `generateUUID()` — Hermes has no `crypto` global

---

## Bugs Fixed During Session

### `crypto.randomUUID()` not available in Hermes
Two attempts before the right fix:
1. First tried `uuid` package (`v4`) — also uses `crypto.getRandomValues()`, same failure
2. Final fix: `generateUUID()` using `Math.random()` — no crypto dependency, works in Hermes

---

## Architecture Notes

### Recording preset
Using a custom preset instead of `RecordingPresets.HIGH_QUALITY` (44.1kHz stereo, 128kbps). 16kHz mono at 32kbps is the standard speech recognition input format — smaller files, same transcription quality. Approximately 240KB/min.

### Duration tracking
`durationMillis` comes from `recorderStateRef.current` (native recorder state, polled at 100ms). This is pause-aware by construction — paused time is excluded automatically. `Date.now()` delta was not used.

### Library reload strategy
`useFocusEffect` re-queries the DB every time the Library tab comes into focus. No explicit invalidation signal between recording and Library — the focus event handles it naturally when the user navigates tabs.

### `useLibraryLogs` type design
Defines local `LibraryLog` / `LibraryEntry` types shaped to match the existing Library render code field names (`durationMs`, `createdAt`, `transcript`). The render code required zero changes.

---

## Files Changed

| File | Action |
|------|--------|
| `apps/mobile/app.json` | mic permissions |
| `apps/mobile/src/shared/utils/audio.ts` | new |
| `apps/mobile/src/shared/utils/uuid.ts` | new |
| `apps/mobile/src/shared/hooks/useVoiceManager.ts` | rewrite |
| `apps/mobile/src/shared/hooks/useLibraryLogs.ts` | new |
| `apps/mobile/app/_layout.tsx` | getDb() init |
| `apps/mobile/app/(tabs)/library.tsx` | swap mock → DB |
| `apps/mobile/src/core/db/LogRepository.ts` | generateUUID fix |
| `apps/mobile/src/core/db/EntryRepository.ts` | generateUUID fix |

---

## Open Questions (deferred)
- Show waveform bars in Library detail overlay from stored waveform data (currently uses hash-based pseudo-random)
- Use `audioLevels` from `useVoiceManager` to animate live waveform on home screen during recording
- Phase 1: audio upload → AssemblyAI transcription → populate `formatted_text` (title in Library)
