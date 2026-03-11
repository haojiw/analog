# SQLite DB Layer
2026-03-10

---

## Decisions

- **`step` + `error` as separate columns, not a single `status` column.** Cleaner TypeScript mapping — a single enum that includes `failed` forces callers to check both step progress and error state from one field.
- **Plain async functions for repositories, not classes.** No lifecycle, no state, no reason for a class.
- **`better-sqlite3` as the test backend for `expo-sqlite`.** `expo-sqlite` requires native modules unavailable in Node/Jest. `better-sqlite3` wraps the same SQLite engine and lets tests run without a simulator.
- **`docs/meetings/` → `docs/session-notes/`, `docs/decisions/` → `docs/next-steps/`.** `meetings` implied synchronous events; `session-notes` describes what the files actually are. `decisions` implied a final-answer archive; `next-steps` describes the actual use.
- **Session note naming: `yymmdd-num-title`.** Sequential number within a day preserves order when multiple notes share a date.

---

## Changes Made

**Schema doc** (`260310-06-schema-and-architecture.md`)
- `status TEXT` replaced with `step TEXT NOT NULL DEFAULT 'local'` + `error TEXT`
- Index renamed `idx_entries_status` → `idx_entries_step`

**Shared types** (`packages/shared-types/src/`) — finalized in previous session, no changes this session.

**New files — `apps/mobile/src/core/db/`**
- `migrations/001_initial.ts` — creates `logs` + `entries` tables with 3 indexes
- `db.ts` — lazy singleton, `runMigrations` via `PRAGMA user_version`
- `LogRepository.ts` — `insertLog`, `getLogById`, `getAllLogs` (paginated DESC), `deleteLog`
- `EntryRepository.ts` — `insertEntry`, `getEntryById`, `getEntriesByLogId`, `updateEntryStep`, `updateEntryError`, `deleteEntry`
- `__tests__/db.test.ts`, `LogRepository.test.ts`, `EntryRepository.test.ts` — 17 tests, all passing

**New files — test infrastructure**
- `apps/mobile/src/__mocks__/expo-sqlite.ts` — wraps `better-sqlite3` in the expo-sqlite async interface
- `apps/mobile/jest.config.js` — jest-expo preset, moduleNameMapper for expo-sqlite and shared-types

**`apps/mobile/package.json`** — added `expo-sqlite ~16.0.0`, `jest`, `jest-expo`, `better-sqlite3`, `@types/*`

**Docs restructure**
- `docs/meetings/` → `docs/session-notes/`, all files renamed to `yymmdd-num-title`
- `docs/decisions/` → `docs/next-steps/` (was empty)
- `CLAUDE.md` updated to reflect new paths and naming convention

---

## Key Reasoning

**JSON boundary only at the repository layer.** `waveform` and `embedding` are `TEXT` in SQLite. Parse on read, serialize on write, only inside the repository. Callers always see `number[] | null`. If this boundary moved up, every caller would need to handle both representations.

**`PRAGMA user_version = N` is string-interpolated, not parameterized.** SQLite does not support parameterized PRAGMA writes. Safe here because `migration.version` is always a hardcoded integer literal in the migrations array, never user input.

**`withExclusiveTransactionAsync` wraps each migration individually.** If it wrapped all migrations together, a partial failure would leave the db in a state where some DDL ran but the version counter wasn't updated — making the migration un-replayable. Per-migration transactions mean each one either fully commits or fully rolls back.

**`better-sqlite3` mock enables foreign key enforcement in tests.** The mock calls `PRAGMA foreign_keys = ON` on construction. Without this, the cascade delete test would pass vacuously — the row would be gone because the parent was deleted, but not because of the constraint.

---

## Next Steps

1. Build the record screen: `useRecorder` hook (returns `{ uri, levels }`) → on finish → `insertLog` + `insertEntry` → navigate to journal
2. Build the journal list: section grouping by date, `EntryItem` with swipe-to-delete, `HistoryList`
3. Build entry detail (read-only): `AudioPlayer` + `useAudioPlayer`, display transcript if present

---

## Open Questions

- **`expo-audio` not yet installed.** Needed for Step 1. Check if it's in `apps/mobile/package.json` before starting `useRecorder`.
- **Record screen navigation target.** After saving, does the app navigate to the journal list or to the new entry's detail view? Not decided.
