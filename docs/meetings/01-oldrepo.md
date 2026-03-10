# 01-oldrepo — Plantalk Repo Salvage
2026-03-10

## Decided

### Copy

- **SpeechService** — retry logic, crash recovery patterns, custom error classes (`NetworkError`, `APIError`, `FileError`). Not the full class (it assumed client-side polling). Extract patterns only.
- **TranscriptionService** — watchdog pattern: on app resume, check entries with `status: processing` older than N minutes and surface as failed. Client-side queue is irrelevant (transcription is now server-side). Extract watchdog concept only.
- **`useRecorder`** — recording mechanics, expo-audio setup, background recording config, noise gate, audio level metering, waveform accumulation. Save logic (local filesystem) is not reusable — replace with Supabase upload via Edge Function.
- **`useAudioPlayer`** — copy when building Phase 2.1, not before.
- **`JournalEntry` type shape** — `processingStage` enum, `externalJobId`, `retryCount`, `audioLevels`. Adapt for Supabase (snake_case, drop SQLite-specific fields).
- **`resampleLevels`** — pure utility, copy directly.
- **`EntryContent` resolution logic** — empty → "Transcribing...", rawText only → show raw, both → show refined. Copy logic, rewrite JSX to match analog's visual style.
- **`EntryItem` swipe gesture** — swipe-to-delete pattern and processing state animations.
- **theme/motion structure** — copy the structure, replace visual values.
- **`SettingsRow`, `SettingsSection`** — generic UI primitives.

### Do not copy

- **SQLite layer** (`DatabaseService`, `BackupService`, `DataValidationService`, `SecureStorageService`) — entire local storage layer replaced by Supabase.
- **`SecureJournalProvider`** — rewrite entirely for Supabase. Provider pattern is fine; implementation is not.
- **Chapel/Skia home screen** (`app/(tabs)/index.tsx`) — plantalk-specific. Analog's home is a record button.
- **Auto-chat trigger** (`useEntryChat` auto-trigger) — violates analog's personality. AI does not speak first.
- **Me screen / WeeklyRecap** — subconscious AI. Phase 3.
- **Streak logic** — premature for MVP.
- **Auto-summary after transcription** — AI must not act unsummoned.
- **Migration service** — not applicable.
