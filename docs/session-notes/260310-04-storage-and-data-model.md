# 02-storage-and-data-model
2026-03-10

## Decided

Every piece of user input is a **block** — one row in one table, differentiated by `type`. There is no separate entries table, transcripts table, or tags table.

Current block types:
- `audio` — a voice recording. Contains everything about that recording: file reference, raw transcript, polished transcript, summary, duration, and any other derived data. It is one block.
- `text` — a typed entry.

The exact JSONB field schema inside each block type is not decided yet.

Rationale: a flat per-entry schema hits a ceiling the moment the product needs linked content or AI artifacts attached to entries. The block model eliminates that ceiling without requiring schema migrations for new content types.

## Storage split

| Layer | What lives here |
|---|---|
| SQLite (local) | Full `blocks` table mirror + `synced` flag. Primary read store. Always available offline. |
| Supabase Postgres (cloud) | Replica of blocks. Sync target and recovery store. |
| Supabase Storage (object) | Audio binary files only. Never in SQLite. |
| SecureStore (device) | Auth session tokens. |

## Sync strategy

Local-first. SQLite is the primary read store. Cloud is the sync target.

- New blocks are written to SQLite immediately. UI reads from local only.
- `synced = false` on creation. Pushed to cloud on reconnect or app foreground.
- Pull on login fetches all cloud blocks newer than the device's last-seen `updated_at`.
- Append-only, last-write-wins. No concurrent edits from multiple authors. Conflicts are not a concern at this stage.

Flow for a voice entry:
1. User records → audio file saved to device filesystem.
2. Audio block inserted into local SQLite. Entry appears immediately.
3. Background: audio uploaded to Supabase Storage. Block updated with file reference and `synced = true`.
4. Background: transcription triggered. Block updated with transcript data when complete.

## Open questions

- Exact JSONB content schema per block type — needs detail before locking.
- Whether soft delete (`deleted_at`) is required in Phase 1 or can be deferred.
- Audio playback cache strategy (local filesystem vs. re-fetch from signed URL).
- Whether embeddings belong inside the audio block or in a separate structure — deferred.

## Build order

| Phase | What |
|---|---|
| 0 | Local SQLite `blocks` table + `synced` flag. No cloud. UI reads local only. |
| 1 | Supabase `blocks` table + audio upload to object storage + push sync + transcription pipeline. |
| 2 | Pull sync on login (new device / reinstall). |
