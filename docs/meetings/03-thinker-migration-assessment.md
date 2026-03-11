# Migration Assessment: Old Analog Repo → New Analog Mobile App
2026-03-10

*Full thinker review. Conclusions condensed into `docs/decisions/03-migration-from-old-repo.md`.*

---

## Executive Summary

The old repo is a functioning local-first voice journal with a real transcription pipeline, SQLite persistence, and polished UI. However, it was built under the name "plantalk", uses a flat entry model that the new architecture has already superseded, calls AI APIs directly from the client (API keys on device), and carries significant tech debt in its provider layer. The new app's architecture decisions — block model, Supabase sync, Edge Function-mediated transcription, NativeWind — are fundamentally different enough that a transplant approach would be actively harmful. The correct posture is: mine the old repo for battle-tested logic and UX patterns; write fresh infrastructure from scratch; treat the old UI as a reference prototype, not source code.

---

## What Exists in the Old Repo

### Screens and Navigation

| Screen | File |
|---|---|
| Home (chapel image + ripple shader entry point) | `app/(tabs)/index.tsx` |
| Journal list | `app/(tabs)/journal.tsx` |
| Me / Profile + Insights | `app/(tabs)/me.tsx` |
| Record | `app/record.tsx` |
| Entry detail | `app/entry/[id].tsx` |
| Settings (index, profile, appearance, language, notifications, billing, storage, developer) | `app/settings/` |

Navigation uses `expo-router/unstable-native-tabs` (NativeTabs) for the tab bar, which is an unstable API.

### Features

- **Recording** (`src/features/recording/`): `useRecorder` hook + `Waveform` component. Auto-starts recording on mount, polls metering via `setInterval` at 70ms, accumulates all samples in a ref, downsamples to 200 points on finish. Uses `expo-audio`.
- **Audio player** (`src/features/audio-player/`): `useAudioPlayer` hook + `AudioPlayer` component. Gesture-based scrubbing (pan + tap), two-layer waveform overlay for playback progress, `expo-audio`.
- **Journal list** (`src/features/journal/`): `HistoryList`, `EntryItem`, `WeeklyRecap`. Swipe-to-delete with Reanimated interpolation, section headers (Today / Yesterday / Past 7 Days / etc.), processing state indicators with pulse animation.
- **Entry detail** (`src/features/entry-detail/`): Markdown rendering, tab toggle between journal and AI chat, inline editing, transcription retry, refinement retry, copy-to-clipboard. `useEntryChat`, `useEntryEditor`, `useEntryOptions` hooks.
- **Settings** (`src/features/settings/`): Profile, appearance, language, notifications, billing, storage diagnostics, developer tools.

### Services and Providers

- **`DatabaseService`**: SQLite via `expo-sqlite`, version 4 schema with manual migration guards. Tables: `entries`, `metadata`, `transcription_outbox`, `chat_messages`.
- **`SecureStorageService`**: AES encryption via `crypto-js`, key stored in `expo-secure-store`. Wraps `expo-file-system` for encrypted file I/O.
- **`TranscriptionService`**: In-memory sequential queue. Handles AssemblyAI → Gemini pipeline, chunking, checkpointing, three-strikes retry, crash watchdog on app start.
- **`SpeechService`**: Direct AssemblyAI API calls from the client. Upload → poll → paragraph fetch.
- **`TextService`**: Direct Gemini API calls from the client. Chunk-based refinement with JSON response parsing and fallback regex extraction.
- **`ChatService`**: Direct Gemini API calls from the client. Conversation history passed on each call.
- **`SecureJournalProvider`**: React Context wrapping all state. Calls `loadState` (full DB read) after every mutation. Runs transcription watchdog on init.
- **`SettingsProvider`**: Theme, display name, avatar, language settings stored in `expo-secure-store`.

### Utilities

- `resampleLevels`: bucket-average resampling for waveform data
- `getAbsoluteAudioPath` / `getRelativeAudioPath`: relative-to-absolute path conversion, survives iOS container UUID changes
- `chunkText`: word-count-based text splitter (800 words per chunk)

### Third-party Packages of Note

`@shopify/react-native-skia`, `react-native-reanimated`, `react-native-gesture-handler`, `expo-audio`, `expo-sqlite`, `crypto-js`, `expo-secure-store`, `expo-keep-awake`, `react-native-markdown-display`, `expo-file-system/legacy`, 11 `@expo-google-fonts/*` packages.

---

## Per-Component Assessment

### SQLite Schema and DatabaseService

**Verdict: Rewrite from scratch.**

The old schema uses a flat `entries` table. The new architecture has already decided on a `blocks` table with a `type` column. These are incompatible at the root. A rewrite is not optional.

Additionally:
- `updateEntry` builds a dynamic `SET` clause by iterating `Object.entries(updates)` and blindly mapping field names to column names. This is a SQL injection surface if any caller ever passes user-controlled key names — which `entryOperations.ts` does indirectly through `Partial<JournalEntry>`.
- Migration logic catches every `ALTER TABLE` failure silently (`console.log('column may already exist')`). This masks real migration errors. The new schema should use a proper migration table.
- `convertDatabaseEntryToJournalEntry` is `async` and calls `secureStorageService.getSecureFile()` per row — meaning every `getAllEntries()` call issues N async decrypt operations serially via `Promise.all`. With 100 entries this is 100 async file reads. The encryption was never actually wired up (the encrypt call is commented out), making this dead code that still costs overhead.
- The `metadata` table is a single-row hack (`CHECK (id = 1)`) that stores `streak` and `lastEntryISO`. The new app should derive streak from the `blocks` table query rather than maintaining a denormalized counter.
- `getAppState()` calls `getAllEntries()` every time, loading the full dataset into memory. With a large block store this becomes a bottleneck. The new app must paginate from day one.

**What to carry forward as reference (logic only, not code):** The PRAGMA setup (`WAL`, `synchronous = NORMAL`, `cache_size`, `temp_store = memory`) is correct and should be reproduced in the new schema. The relative audio path strategy (`audio/audio_123.m4a` stored in DB, resolved at runtime) is correct and necessary for iOS container UUID survival.

### SecureStorageService

**Verdict: Do not carry over.**

The encryption is never used (the encrypt call in `DatabaseService.addEntry` is commented out). The service exists but provides no security. The `BackupService` uses it for backup files, but that feature is entirely out of scope for Phase 0. `crypto-js` is a JavaScript AES implementation — slower than native crypto and a dependency that adds risk. The new app should omit client-side SQLite encryption entirely for Phase 0 and, if it becomes a requirement later, use SQLCipher or expo-sqlite's built-in encryption extensions rather than application-layer AES.

### TranscriptionService (queue + watchdog)

**Verdict: Understand deeply, but rewrite to match new architecture.**

The architectural thinking here is good: sequential queue prevents concurrent transcription jobs from hammering the API, idempotency check against `externalJobId` prevents re-uploading on crash, three-strikes retry, crash watchdog on startup. These patterns are worth keeping.

What must change:
- In the new architecture, the client does not call AssemblyAI directly. Audio goes to a Supabase Edge Function. The queue and watchdog logic moves to the server side (or becomes a simple client-side poller against `blocks.status`).
- The `onProgress` and `onComplete` callbacks passed through the queue create a coupling between the queue (a singleton service) and React state (`SecureJournalProvider`). In the new app, the DB is the source of truth and the UI should poll or subscribe to DB changes rather than receiving callbacks from a service singleton.
- `activeTaskIds` is in-memory state that is lost on app kill. On restart, the watchdog re-scans the DB. This is correct, but the in-memory guard is redundant if the DB already tracks status.

### SpeechService / TextService / ChatService

**Verdict: Do not carry over. The architecture violates the decided security model.**

The new architecture explicitly decided: API keys stay off device. The old repo does the opposite — all three services call external APIs directly from the client, which means:
- AssemblyAI and Gemini API keys are shipped in the app bundle (via `expo-constants`/`app.config.js`).
- Any user who inspects the bundle can extract both keys.
- There is no way to rotate keys without a full app release.

The new transcription flow uses a Supabase Edge Function. `SpeechService` is a dead pattern for the new app. The chunking logic in `chunkText` and the paragraph-fetching pattern are worth reading when building the Edge Function, but the client-side code itself is not reusable.

**Bugs in SpeechService:**
- `transcribeAudioWithId` is a legacy method name; `transcribeAudio` wraps it but the naming implies `transcribeAudio` is the canonical API when it is actually the reduced one.
- The paragraph fetch falls back to `[transcript.text.trim()]` when paragraphs are empty. The result `paragraphedText` is then used as input to Gemini refinement, but the TranscriptionService only reads `.text` from the result, not `.paragraphedText`. The paragraph effort is therefore wasted.

**Bugs in TextService:**
- The first-chunk prompt is truncated in the source with `...` placeholder text — a placeholder that was never replaced with the actual prompt.
- The fallback regex for extracting `formattedText` from a Gemini JSON response — `/"formattedText":\s*"((?:[^"\\]|\\.)*)"/` — will fail on multi-line text that contains unescaped control characters or JSON-encoded newlines.
- `fetchWithTimeout` in TextService duplicates `fetchWithTimeout` in SpeechService. Two implementations of the same utility in the same codebase.

**Bugs in ChatService:**
- `generateSummary` passes the raw entry text as a user message with no system prompt, no instruction, no context about what "summarize" means. It will produce wildly inconsistent output.
- `thinkingConfig: { thinkingBudget: 0 }` disables Gemini's extended thinking unconditionally. Setting it to zero is a hardcoded policy that belongs in configuration, not in the service constructor.

### SecureJournalProvider

**Verdict: Do not carry over.**

The provider pattern itself is fine, but this specific implementation has critical structural problems:

1. **Full state reload on every mutation.** Every `addEntry`, `deleteEntry`, `updateEntry` call ends with `await loadState()`, which calls `databaseService.getAppState()`, which calls `getAllEntries()`, which reads every row from SQLite into memory and hydrates JS objects. For a user with 200 entries, deleting one entry causes 200 row reads, 200 object constructions, and a full React re-render of the entire entry list. This is O(N) on every write.

2. **Transcription watchdog fired from within a provider `useEffect`.** The watchdog (`transcriptionService.resumePendingTasks`) is called with callbacks that themselves call `loadState()` — so each transcription progress update triggers another full DB read.

3. **The provider mixes too many concerns.** Backup operations, diagnostics, streak operations, emergency recovery, schema migration — all surface through a single context. Any consumer that needs `deleteEntry` gets access to `runStorageDiagnostics` and `emergencyRecovery`. The new app should split these at the boundary.

4. **`isInitialized` flag is set before `performMigrationFromOldStorage` completes.** The flag is set after `loadState` but before migration finishes — migration runs after but is not awaited relative to `setIsInitialized`. If migration modifies state, the UI could render before migration-touched rows are visible.

### useRecorder

**Verdict: Adapt with changes.**

The metering logic is solid: dB normalization with a -30dB noise gate, power curve, rolling 50-bar display buffer, full-accumulation ref for playback waveform. `resampleLevels` is a clean utility. `useAudioRecorderState` with a 70ms interval is a reasonable polling rate.

**Problems to fix in the new version:**
- Recording starts automatically on mount with no mechanism to handle the case where the screen is navigated to while a recording is already in progress.
- `handleFinishRecording` calls `addEntry` directly through `useSecureJournal`. In the new architecture, the hook should return `{ uri, levels }` and the screen should handle persistence. This separates the recording concern from the storage concern.
- The 1-hour timer uses `setInterval` with a state updater that calls `handleFinishRecording()` — `handleFinishRecording` is defined in the hook body and captured via closure. If `handleFinishRecording` changes identity between renders (it is not memoized), the closure in the timer captures a stale version. This is a latent bug.
- `cleanupRecording` only stops the interval. It does not stop the audio recorder itself if the hook unmounts mid-recording. The `expo-audio` recorder is not explicitly stopped in cleanup. This may leave the recording session open.
- `useKeepAwake` is called unconditionally at the top of the hook. This means any screen that uses `useRecorder` keeps the display awake even after recording ends (during `saving` state). Should be conditional on recording being active.

### useAudioPlayer + AudioPlayer

**Verdict: Adapt.**

The dual-layer waveform rendering (unplayed bars underneath, played bars clipped by progress) is a clean approach. The gesture composition (`Gesture.Race`) is correct. The `resampleLevels` reuse for fitting stored levels to display bar count is correct.

**Problems:**
- `player` is typed as `any` in the return type.
- The pseudo-random waveform fallback seeds from `duration`. Two entries with the same duration show identical waveforms.
- `setAudioModeAsync` is called in a `useEffect` with `[]` deps — no guard against calling it while recording is active from another screen simultaneously.

### EntryItem (swipe-to-delete)

**Verdict: Adapt the gesture logic, rewrite styles in NativeWind.**

The `Gesture.Exclusive(panGesture, tapGesture)` implementation with the three-priority tap handler (close other open items → close self → navigate) is correct and covers edge cases properly. The delete animation (scaleY + opacity + translateX collapse) is clean.

**Problems:**
- `processingPulse` animation via `withRepeat` leaks: `useEffect` starts the pulse but the cleanup does not call `cancelAnimation`. When the component unmounts mid-pulse, the shared value continues to update until GC.
- `key={i}` index key on bars inside `AudioPlayer` — habit that causes bugs when items reorder.

### HistoryList + sectionedEntries grouping

**Verdict: Rewrite the grouping logic, keep the sectioned display concept.**

The `useMemo` that groups entries into Today/Yesterday/Past 7 Days/Past 30 Days/Month sections creates `new Date()` inside the memo with no date dependency. The memo only recalculates when `state.entries` changes — meaning `now` is captured at the time of the last entries change. An entry added at 11:59 PM will still show under "Today" the next morning until the entries list changes. This is a correctness bug for all section boundaries. Fix: include current date as a memo dependency.

### WeeklyRecap

**Verdict: Do not carry over.**

Contains hardcoded placeholder text: `"I completed 5 journal entries this week, mostly reflecting on work challenges."` Not connected to any data. The "Me" screen's insights cards (Patterns, Mirror) are also entirely placeholder. Exclude from Phase 0/1, build properly in Phase 3.

### Waveform (recording screen)

**Verdict: Adapt.**

`AnimatedBar` uses `Math.random()` inside `useEffect` to compute animation duration on every metering tick — 700 `Math.random()` calls per second for 50 bars at 70ms intervals. Duration is only for visual variation; compute it once on mount instead. `React.memo` on `AnimatedBar` provides no protection here since `level` changes for essentially every bar on every tick. Acceptable at 50 bars.

### Settings Screens

**Verdict: Do not carry over for Phase 0.**

`BillingScreen`, `LanguageScreen`, `NotificationsScreen`, `AppearanceScreen` are all placeholders with no functional implementation. Rebuild to spec when settings becomes a priority.

### Theme System (`src/styles/`)

**Verdict: Reference only. The new app uses NativeWind/Tailwind.**

The `theme.ts` color palette and spacing values are good references for the Tailwind config. The motion constants (`motion.ts`) are worth replicating as a constants file. Do not copy the `StyleSheet.create` approach.

---

## Bugs and Anti-Patterns That Must NOT Be Carried Over

1. **API keys on device.** All three AI services read keys from `expo-constants`. Keys stay server-side in the new app.
2. **SQL injection in dynamic UPDATE.** `updateEntry` builds `SET` clauses from object keys without a column whitelist.
3. **Full DB reload on every write.** `SecureJournalProvider` O(N) pattern.
4. **`expo-file-system/legacy` import.** Use current `expo-file-system` API.
5. **`any` typed return values.** `useAudioPlayer`, `entryOperations.ts`, `DataValidationService`.
6. **`as unknown as X` casts.** `DatabaseService.convertDatabaseEntryToJournalEntry` does `JSON.parse(dbEntry.audioLevels as unknown as string)`.
7. **ID generation via `Date.now() + Math.random()`.** Not a UUID, collision-prone. Use `crypto.randomUUID()` consistently.
8. **`unstable-native-tabs` import.** Explicitly marked unstable.
9. **Stale closure in 1-hour timer.** `handleFinishRecording` captured via stale closure inside `setInterval` updater.
10. **`setTimeout` for navigation.** `handleChapelPress` uses `setTimeout` to trigger navigation; component unmount before timeout fires still executes `router.push`.
11. **Double state update in `useEntryChat`.** After auto-trigger, both `updateEntry` (context) and `databaseService.updateEntry` are called separately for `summaryStatus` — can diverge if one fails.
12. **`WeeklyRecap` hardcoded fake data.** Placeholder UI shipped as if real.
13. **`DataValidationService.validateAudioFiles` broken.** Calls `FileSystem.getInfoAsync(entry.audioUri)` with relative path without converting to absolute — always reports files as missing. The validation service was never functional.
14. **`retryCount` tracking redundancy.** `deleteEntry` calls `getAppState()` to find the entry, then `deleteEntry(id)` which itself calls `getEntry(id)`. Two separate DB reads for the same row.

---

## Missing Tests (Add During Migration)

- `resampleLevels`: edge cases (empty input, targetCount larger than source, targetCount = 1, equal lengths)
- `getAbsoluteAudioPath` / `getRelativeAudioPath`: round-trip correctness, backward compatibility with absolute paths
- `chunkText`: empty string, single word, exactly 800 words, 801 words, whitespace-only input
- SQLite block repository: insert, read, update, delete; `synced` flag behavior; pagination correctness
- Journal sectioning logic: boundary conditions at midnight, section key deduplication
- `useRecorder`: permission denied path, cleanup on unmount, duration formatting
- Recording screen integration: `handleFinishRecording` persists block to DB, navigates to journal on success, shows error on failure

---

## Recommended Migration Order

### Phase 0 — local only

**Step 1: Core infrastructure**
SQLite `blocks` table with `type`, `content` (JSONB as TEXT), `created_at`, `updated_at`, `synced` flag. One clean migration file, no dynamic ALTER TABLE guards. `BlockRepository` with typed read/write methods, parameterized queries only. Audio path utilities (copy verbatim). `resampleLevels` (copy verbatim, add tests).

**Step 2: Recording feature**
Port `useRecorder` with fixes: decouple from journal context (return URI + levels), fix stale closure in timer, add explicit recorder cleanup, make `useKeepAwake` conditional. Port `Waveform` with NativeWind styles. Record screen: `useRecorder` → `BlockRepository.insertBlock` on finish → navigate to journal.

**Step 3: Journal list feature**
Port `sectionedEntries` grouping logic with stale Date fix. Port `EntryItem` swipe gesture with animation leak fix + UUID keys. Port `HistoryList`. All styles in NativeWind.

**Step 4: Entry detail (read-only)**
Display block content. Port `AudioPlayer` + `useAudioPlayer` with fixes (typed return, audio mode guard). No AI pipeline yet.

### Phase 1 — cloud sync and transcription

**Step 5: Supabase integration**
Auth (magic link) + `blocks` table mirror. Audio upload Edge Function. Transcription Edge Function (AssemblyAI → Gemini) — TranscriptionService queue logic is reference for design, not source code. Client-side sync: insert locally → push on reconnect.

**Step 6: Entry detail processing states**
Port processing state UI (transcribing / refining / failed / audio unavailable banners). Port `useEntryEditor` for manual correction. Retry mechanism against new Edge Function API.

### Phase 2+
AI chat (conscious), AI insights (subconscious), pgvector embeddings. Do not build until Phase 1 is in production with real users.

---

## Third-party Packages: Keep vs. Replace

| Package | Decision | Reason |
|---|---|---|
| `expo-audio` | Keep | Proven for both recording and playback |
| `expo-sqlite` | Keep | Required by architecture decision |
| `react-native-reanimated` | Keep | Required for waveform, swipe gestures, transitions |
| `react-native-gesture-handler` | Keep | Required for swipe-to-delete and audio scrubbing |
| `expo-file-system` (non-legacy) | Keep | Required for audio file management |
| `expo-secure-store` | Keep | Required for auth session tokens |
| `expo-keep-awake` | Keep | Needed for recording |
| `expo-haptics` | Keep | Swipe-delete feedback (add when needed) |
| `react-native-markdown-display` | Keep for Phase 1+ | Needed once refined transcripts render |
| `@shopify/react-native-skia` | Defer | Heavy (~20MB), only for chapel shader visual flourish |
| `expo-image`, `expo-clipboard` | Defer | Phase 2+ features |
| `crypto-js` | Drop | No longer needed |
| All 11 `@expo-google-fonts/*` | Audit and cull | Keep only fonts actually in use |
| `expo-router/unstable-native-tabs` | Replace | Use stable tab navigation |
