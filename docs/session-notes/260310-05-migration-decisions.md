# 05-migration-from-old-repo
2026-03-10

## Context

The old analog repo (`.reference/old-repo/`) was a functioning local-first voice journal ("plantalk"). It proved the core record → SQLite → display loop. However, its data model (flat `entries` table), AI architecture (client-side API calls), and styling system are all incompatible with the new architecture. The correct posture: mine the old repo for battle-tested logic and UX patterns; write fresh infrastructure from scratch.

---

## Copy Verbatim

| Item | Location | Reason |
|---|---|---|
| `getAbsoluteAudioPath` / `getRelativeAudioPath` | `src/shared/utils/audioPath.ts` | Solves iOS container UUID survival. Production-proven. |
| `resampleLevels` | `src/shared/utils/audio.ts` | Clean bucket-average downsampling for waveform display. |
| SQLite PRAGMA setup | `DatabaseService` constructor | `WAL`, `synchronous = NORMAL`, `cache_size`, `temp_store = memory` — correct config for mobile SQLite. |

---

## Adapt with Required Fixes

**`useRecorder` hook**
- Good: dB normalization, noise gate, rolling display buffer, full-accumulation ref for playback waveform.
- Fix: decouple from journal context — hook returns `{ uri, levels }`, screen handles DB write.
- Fix: stale closure in 1hr timer — `handleFinishRecording` not in dep array and not memoized.
- Fix: explicit `audioRecorder.stop()` on unmount — current cleanup only stops the interval.
- Fix: make `useKeepAwake` conditional on recording being active.

**`useAudioPlayer` + `AudioPlayer`**
- Good: dual-layer waveform scrubber, `Gesture.Race` pan+tap composition.
- Fix: `player` return type is `any`.
- Fix: guard against `setAudioModeAsync` called while recording is active on another screen.

**`EntryItem` (swipe-to-delete)**
- Good: `Gesture.Exclusive(pan, tap)` with three-priority tap handler, delete collapse animation.
- Fix: `cancelAnimation` missing from `processingPulse` cleanup — animation leaks on unmount.
- Fix: `key={i}` index keys — use UUIDs.

**Journal section grouping**
- Good: Today / Yesterday / Past 7 Days / Past 30 Days / Month concept.
- Fix: `new Date()` inside `useMemo` with no date dependency — captures stale `now`. Include current date as memo dependency.

**`Waveform` component**
- Good: metering logic, `AnimatedBar` height animation.
- Fix: random animation duration computed on every metering tick (~700/sec). Compute once on mount.
- Rewrite styles in NativeWind.

---

## Rewrite from Scratch

**`DatabaseService` → `LogRepository` + `EntryRepository`**
- Old `updateEntry` builds `SET` clauses from object keys with no column whitelist — SQL injection surface.
- New repositories: typed methods only, parameterized queries, proper migration table via `PRAGMA user_version`.

**`SecureJournalProvider` → Zustand or React Context (incremental updates)**
- Full DB reload on every mutation (`loadState()` after every `addEntry`/`deleteEntry`/`updateEntry`) is O(N) on write.
- New provider must update local state incrementally.

**All settings screens**
- `BillingScreen`, `LanguageScreen`, `NotificationsScreen`, `AppearanceScreen` are non-functional placeholders. Rebuild when settings becomes a priority.

---

## Do Not Carry Over

**`SpeechService`, `TextService`, `ChatService`**
All three call external AI APIs from the client with keys in the app bundle. New architecture: all AI calls in Supabase Edge Functions.

**`SecureStorageService` + `crypto-js`**
Encryption call is commented out — dead code. Drop both. If SQLite encryption is ever needed, use SQLCipher.

**`WeeklyRecap` and Me screen insights**
Hardcoded placeholder text. Never wired to real data. Phase 3.

**Auto-chat trigger (`useEntryChat` auto-trigger)**
Violates product personality. AI does not speak first.

---

## Critical Bugs That Must Not Be Repeated

1. **API keys on device** — keys in `expo-constants`. Keys stay server-side.
2. **SQL injection in dynamic UPDATE** — whitelist column names always. Parameterized queries only.
3. **Full DB reload on every write** — update state incrementally.
4. **ID generation with `Date.now() + Math.random()`** — use `crypto.randomUUID()`.
5. **Stale `new Date()` in section memo** — include current date as dependency.
6. **Stale closure in 1hr recording timer** — memoize `handleFinishRecording`, include in dep array.
7. **`DataValidationService.validateAudioFiles`** — calls `getInfoAsync` with relative path, always reports files missing. Always resolve to absolute path first.
8. **`expo-file-system/legacy` import** — use current import path.
9. **`unstable-native-tabs`** — use stable tab navigation.
