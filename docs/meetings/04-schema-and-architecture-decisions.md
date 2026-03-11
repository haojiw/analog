# analog · Schema & Architecture Decisions
2026-03-10

---

## Naming

The two core data concepts have deliberate names rooted in the product's founding metaphor — Darwin's notebook on the Beagle. You are on a voyage. What you record is your log.

- **Log** — the thought container. A topic, a feeling, something you keep returning to. A log is the book; you write in it across time. In code: `logs` table.
- **Entry** — a single act of speaking into the log. One moment of opening your mouth. Raw, timestamped, atomic. In code: `entries` table.

These replace the generic terms "entry" (container) and "block" (unit) used in earlier drafts. Anywhere you see `log_id` in code, it means "which thought does this belong to." Anywhere you see `entry`, it means "one recorded moment."

---

## Decisions Made

### 1. Data Model: logs + entries (not flat logs, not generic entries alone)

**Decision:** Two-table relational model. `logs` is the thought container. `entries` is the atomic unit of content within a log.

**Rationale:** The unit of meaning in analog is a *thought*, not a recording session. A user may record something, then return 20 minutes later and add more to the same thought. Forcing these into separate logs breaks the mental model. A log with one entry and a standalone single-recording log are identical at query time — the architecture handles both without special-casing.

**Rejected alternatives:**
- Flat `logs` table: can't support the "go deeper" feature or multi-entry logs without a schema migration later.
- Generic `entries`-only model (content as JSON blob): can't query on status, duration, or type without deserializing every row. Wrong for a product with a predictable, uniform content shape.

---

### 2. "Go Deeper" feature is part of the product

**Decision:** Build a "go deeper" interaction — a button available after a completed recording that triggers the AI to ask one precise, succinct follow-up question. The user's response becomes a new entry on the same log.

**Rationale:** Fits the product identity exactly. The product personality is silent until called. "Go deeper" is the user calling it — a Socratic mirror, not a chatbot. It maps directly to the logs + entries architecture: the follow-up response is a new entry on the same log_id.

**Constraint:** One question maximum per "go deeper" trigger. No follow-up to the follow-up. The question quality lives entirely in the system prompt — a bad question makes the whole product feel manipulative. This requires dedicated prompt engineering work before the feature ships.

**Phase:** Phase 1 (after transcription pipeline is live). Not Phase 0.

---

### 3. Embeddings live on the entry level

**Decision:** The `embedding` column belongs on `entries`, not `logs`.

**Rationale:** A long log may cover multiple topics across multiple entries. Entry-level embeddings allow the AI to retrieve semantically relevant chunks rather than entire logs. This is strictly more useful for the "what have I been thinking about" query pattern that powers the conscious AI feature.

---

## Schema

### logs

```sql
logs (
  id          TEXT PRIMARY KEY,   -- crypto.randomUUID()
  user_id     TEXT,               -- null until Phase 1 auth
  created_at  INTEGER NOT NULL,   -- Unix ms, timezone-safe, sortable
  updated_at  INTEGER NOT NULL
)
```

The log is a lightweight container. All content and metadata lives on entries.

### entries

```sql
entries (
  id              TEXT PRIMARY KEY,   -- crypto.randomUUID()
  log_id          TEXT NOT NULL REFERENCES logs(id) ON DELETE CASCADE,
  position        INTEGER NOT NULL,   -- order within log, 0-indexed

  type            TEXT NOT NULL,      -- 'audio' | 'text'

  -- audio fields (null when type = 'text')
  audio_url       TEXT,               -- relative path locally, Supabase URL after sync
  duration_ms     INTEGER,
  waveform        TEXT,               -- JSON array of amplitude levels

  -- transcription fields
  raw_transcript  TEXT,
  formatted_text  TEXT,
  summary         TEXT,

  -- ai fields
  embedding       TEXT,               -- JSON float array, null until Phase 2

  -- pipeline state (split into step + error for cleaner type mapping)
  step            TEXT NOT NULL DEFAULT 'local',
  -- local | uploading | uploaded | transcribing | refining | done
  error           TEXT,
  -- null | upload_failed | transcription_failed | refining_failed

  -- text input fields (null when type = 'audio')
  text_content    TEXT,

  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  synced          INTEGER NOT NULL DEFAULT 0   -- 0/1, used for Phase 1 sync queue
)
```

### Indexes (add at migration time)

```sql
CREATE INDEX idx_entries_log_id ON entries(log_id);
CREATE INDEX idx_entries_step ON entries(step);
CREATE INDEX idx_logs_created_at ON logs(created_at DESC);
```

---

## Phase Mapping

| Phase | What gets built |
|-------|----------------|
| Phase 0 | logs + entries tables, local SQLite only. Every log has exactly one entry. No "go deeper" UI yet. status is always 'local'. |
| Phase 1 | Supabase sync, transcription pipeline, status transitions through the full enum. user_id populated on auth. |
| Phase 1 | "Go deeper" — second entry on a log, triggered by AI question. |
| Phase 2 | embedding populated via pgvector. AI chat uses entry-level semantic retrieval. |

---

## Open Questions (not yet decided)

- **Sync conflict resolution:** Current plan is "insert locally → push on reconnect." What happens when the same log is modified on two devices? Acknowledged gap — decision deferred to Phase 1 planning. Likely answer: last-write-wins on entry content, append-only on entry list.
- **Log grouping UI:** How does the user decide which log to add an entry to? "Go deeper" is the primary path. Manual "add to existing log" UI is deferred — needs a design answer before implementation.
- **Summary granularity:** Does `summary` on an entry summarize just that entry, or does the log-level summary get derived from all entry summaries? Decision deferred to Phase 1 when the transcription pipeline is built.
