# 03-migration-from-old-repo
2026-03-10

## Context

The old analog repo (`.reference/old-repo/`) was a functioning local-first voice journal built under the name "plantalk". It proved the core record → SQLite → display loop is technically viable and produced polished UX patterns. However, its data model (flat `entries` table), AI service architecture (client-side API calls), provider layer, and styling system are all incompatible with the new architecture decisions. The correct posture: mine the old repo for battle-tested logic and UX patterns; write fresh infrastructure from scratch; treat the old UI as a reference prototype, not source code.

---

## What Exists in the Old Repo

### Screens and Navigation
- Home (chapel image + ripple shader entry point)
- Journal list with section headers and swipe-to-delete
- Me / Profile + Insights (mostly placeholder)
- Record screen
- Entry detail (transcript, AI chat, inline editing, retry)
- Settings screens (profile, appearance, language, notifications, billing, storage, developer)

Navigation uses `expo-router/unstable-native-tabs` — explicitly unstable API.

### Core Services
- **`DatabaseService`**: SQLite via `expo-sqlite`, version 4 schema, flat `entries` table
- **`SecureStorageService`**: AES encryption via `crypto-js` — encryption call is commented out; the service is dead code
- **`TranscriptionService`**: Sequential in-memory queue, three-strikes retry, crash watchdog. Architectural thinking is sound; implementation is server-side in the new app.
- **`SpeechService`**: Direct AssemblyAI API calls from the client. API keys in app bundle.
- **`TextService`**: Direct Gemini API calls from the client. API keys in app bundle.
- **`ChatService`**: Direct Gemini API calls from the client. API keys in app bundle.
- **`SecureJournalProvider`**: React Context wrapping all state. Calls full DB reload after every mutation.

---

## Migration Decisions

### Copy Verbatim

| Item | Location | Reason |
|---|---|---|
| `getAbsoluteAudioPath` / `getRelativeAudioPath` | `src/shared/utils/audioPath.ts` | Solves iOS container UUID survival. Production-proven. Necessary for all audio storage. |
| `resampleLevels` | `src/shared/utils/audio.ts` | Clean bucket-average downsampling for waveform display. No changes needed. |
| SQLite PRAGMA setup | `DatabaseService` constructor | `WAL`, `synchronous = NORMAL`, `cache_size`, `temp_store = memory` — correct config for mobile SQLite. |

### Adapt with Required Fixes

**`useRecorder` hook**
- Good: dB normalization, noise gate, rolling display buffer, full-accumulation ref for playback waveform.
- Fix: decouple from journal context — hook should return `{ uri, levels }` and the screen handles DB write.
- Fix: stale closure in 1hr timer — `handleFinishRecording` not in dep array and not memoized.
- Fix: explicit `audioRecorder.stop()` on unmount — current cleanup only stops the interval.
- Fix: make `useKeepAwake` conditional on recording being active (currently unconditional).

**`useAudioPlayer` + `AudioPlayer`**
- Good: dual-layer waveform scrubber (unplayed/played clip), `Gesture.Race` pan+tap composition.
- Fix: `player` return type is `any` — type it correctly.
- Fix: guard against `setAudioModeAsync` called while recording is active on another screen.

**`EntryItem` (swipe-to-delete)**
- Good: `Gesture.Exclusive(pan, tap)` with three-priority tap handler, delete collapse animation.
- Fix: `cancelAnimation` missing from `processingPulse` `useEffect` cleanup — animation leaks on unmount.
- Fix: `key={i}` index keys — use UUIDs.

**Journal section grouping (`sectionedEntries`)**
- Good: Today / Yesterday / Past 7 Days / Past 30 Days / Month concept.
- Fix: `new Date()` created inside `useMemo` with no date dependency — captures stale `now` until entries list changes. Add current date as memo dependency.

**`Waveform` component**
- Good: metering logic, `AnimatedBar` height animation.
- Rewrite styles in NativeWind.
- Minor: random animation duration computed inside `useEffect` on every metering tick (700 calls/sec for 50 bars). Compute once on mount instead.

### Rewrite from Scratch

**SQLite schema → `blocks` table**
The old `entries` table is incompatible with the block model. New schema: one `blocks` table with `type` column, `content` TEXT (JSON), `created_at`, `updated_at`, `synced` boolean. Single clean migration file.

**`DatabaseService` → `BlockRepository`**
- Old service has a SQL injection surface: `updateEntry` builds `SET` clauses by iterating `Object.entries(updates)` with no column whitelist.
- Dynamic `ALTER TABLE` guards swallow migration errors silently.
- New `BlockRepository`: typed methods only, parameterized queries, proper migration table.

**`SecureJournalProvider` → new context or Zustand**
Full DB reload on every mutation is O(N) on write. Every `addEntry`, `deleteEntry`, `updateEntry` calls `getAllEntries()` — reads every row into memory. At 200 entries, deleting one causes 200 row reads. The new provider must update local state incrementally.

**All settings screens**
`BillingScreen`, `LanguageScreen`, `NotificationsScreen`, `AppearanceScreen` are non-functional placeholders. Rebuild to spec when settings becomes a priority.

### Do Not Carry Over

**`SpeechService`, `TextService`, `ChatService`**
All three call external AI APIs directly from the client with keys shipped in the app bundle. New architecture: API calls happen in Supabase Edge Functions. These services are the wrong pattern entirely.

**`SecureStorageService` + `crypto-js`**
The encryption call in `DatabaseService.addEntry` is commented out. The service is dead code. `crypto-js` is a JavaScript AES implementation (slow, risky). Drop both. If SQLite encryption is ever needed, use SQLCipher or expo-sqlite's native encryption extensions.

**`WeeklyRecap` and Me screen insights**
Contains hardcoded placeholder text (`"I completed 5 journal entries this week, mostly reflecting on work challenges."`). Never wired to real data. Exclude from Phase 0 and 1.

---

## Critical Bugs That Must Not Be Repeated

1. **API keys on device** — `SpeechService`, `TextService`, `ChatService` read keys from `expo-constants`. Keys stay server-side.
2. **SQL injection in dynamic UPDATE** — `updateEntry` builds `SET` from object keys without a whitelist. Always use parameterized queries with explicit column lists.
3. **Full DB reload on every write** — `SecureJournalProvider` pattern. Update state incrementally.
4. **ID generation with `Date.now() + Math.random()`** — not a UUID, collision-prone under fast sequential creation. Use `crypto.randomUUID()` consistently.
5. **Stale `new Date()` in section memo** — memo captures `now` at last entries-change, not at render time. Include current date as dependency.
6. **Stale closure in 1hr recording timer** — `handleFinishRecording` captured via closure inside `setInterval` updater, not memoized, not in dep array.
7. **`DataValidationService.validateAudioFiles`** — calls `FileSystem.getInfoAsync(entry.audioUri)` with relative path without converting to absolute. Always reports files as missing. Validation service was broken.
8. **`expo-file-system/legacy` import** — deprecated. Use current `expo-file-system` import path.
9. **`unstable-native-tabs`** — use stable tab navigation.

---

## Packages

| Package | Decision |
|---|---|
| `expo-audio` | Keep — proven for both recording and playback |
| `expo-sqlite` | Keep — required by architecture |
| `react-native-reanimated` | Keep — required for waveform, gestures, transitions |
| `react-native-gesture-handler` | Keep — required for swipe-to-delete and audio scrubbing |
| `expo-file-system` (non-legacy) | Keep — required for audio file management |
| `expo-secure-store` | Keep — required for auth session tokens |
| `expo-keep-awake` | Keep — needed for recording |
| `expo-haptics` | Keep — swipe-delete feedback (add when needed) |
| `react-native-markdown-display` | Keep for Phase 1+ — needed once refined transcripts render |
| `@shopify/react-native-skia` | Defer — heavy (~20MB), only needed for chapel shader visual flourish |
| `expo-image`, `expo-clipboard` | Defer — Phase 2+ features |
| `crypto-js` | Drop — no longer needed |
| All 11 `@expo-google-fonts/*` | Audit — keep only fonts actually in use, drop the rest |
| `expo-router/unstable-native-tabs` | Replace with stable tabs |

---

## Missing Tests (Add During Migration)

- `resampleLevels`: empty input, targetCount > source length, targetCount = 1, equal lengths
- `getAbsoluteAudioPath` / `getRelativeAudioPath`: round-trip correctness, backward compat with absolute paths
- `BlockRepository`: insert, read, update, delete; `synced` flag behavior; pagination
- Journal section grouping: midnight boundary conditions, section key deduplication
- `useRecorder`: permission denied path, cleanup on unmount, duration formatting
- Record screen integration: block persisted to DB, navigation on success, error state on failure

---

## Recommended Migration Order

### Phase 0 — local only

**Step 1: Core infrastructure**
- SQLite `blocks` table + migration file
- `BlockRepository` (typed, parameterized)
- Audio path utilities (copy verbatim)
- `resampleLevels` (copy verbatim, add tests)

**Step 2: Recording feature**
- Port `useRecorder` with listed fixes
- Port `Waveform` component with NativeWind styles
- Record screen: `useRecorder` → `BlockRepository.insertBlock` on finish → navigate to journal

**Step 3: Journal list**
- Port section grouping logic (fix stale Date bug)
- Port `EntryItem` swipe gesture (fix animation leak, UUID keys)
- Port `HistoryList` scroll container
- All styles in NativeWind

**Step 4: Entry detail (read-only)**
- Display block content
- Port `AudioPlayer` + `useAudioPlayer` (fix `any` types, audio mode guard)
- No AI pipeline yet

### Phase 1 — cloud sync

**Step 5: Supabase integration**
- Auth (magic link) + `blocks` table mirror
- Audio upload Edge Function
- Transcription Edge Function (AssemblyAI → Gemini). TranscriptionService queue logic is reference for Edge Function design; client-side implementation is not reused.
- Client-side sync: insert locally → push on reconnect

**Step 6: Entry detail processing states**
- Port processing state UI (transcribing / refining / failed banners)
- Port `useEntryEditor` for manual correction
- Retry mechanism against new Edge Function API

### Phase 2+

AI chat (conscious feature), AI insights (subconscious), pgvector embeddings. Do not build until Phase 1 is in production with real users.
