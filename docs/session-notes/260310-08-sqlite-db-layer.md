# 08-sqlite-db-layer
2026-03-10

## Decisions

- **`step` + `error` as separate columns, not a single `status` column.** Cleaner TypeScript mapping — a single enum including `failed` forces callers to check both step progress and error state from one field.
- **Plain async functions for repositories, not classes.** No lifecycle, no state, no reason for a class.
- **`better-sqlite3` as the test backend for `expo-sqlite`.** `expo-sqlite` requires native modules unavailable in Node/Jest. `better-sqlite3` wraps the same SQLite engine and lets tests run without a simulator.

---

## Key Reasoning

**JSON boundary only at the repository layer.** `waveform` and `embedding` are `TEXT` in SQLite. Parse on read, serialize on write, only inside the repository. Callers always see `number[] | null`.

**`PRAGMA user_version = N` is string-interpolated, not parameterized.** SQLite does not support parameterized PRAGMA writes. Safe here because `migration.version` is always a hardcoded integer literal, never user input.

**`withExclusiveTransactionAsync` wraps each migration individually.** If it wrapped all migrations together, a partial failure would leave the DB in a state where some DDL ran but the version counter wasn't updated — making the migration un-replayable. Per-migration transactions mean each one either fully commits or fully rolls back.

**`better-sqlite3` mock enables foreign key enforcement in tests.** The mock calls `PRAGMA foreign_keys = ON` on construction. Without this, the cascade delete test would pass vacuously.

---

## Open Questions

- **Record screen post-save navigation:** Navigate to journal list or to the new entry detail? Not decided.
