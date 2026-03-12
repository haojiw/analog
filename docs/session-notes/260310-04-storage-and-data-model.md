# 04-storage-and-data-model
2026-03-10

Data model (block model) superseded by `260310-06-schema-and-architecture.md` (logs + entries).

## Storage split

| Layer | What lives here |
|---|---|
| SQLite (local) | Full `logs` + `entries` mirror + `synced` flag. Primary read store. Always available offline. |
| Supabase Postgres (cloud) | Replica. Sync target and recovery store. |
| Supabase Storage (object) | Audio binary files only. Never in SQLite. |
| SecureStore (device) | Auth session tokens. |

## Sync strategy

Local-first. SQLite is the primary read store. Cloud is the sync target.

- New entries written to SQLite immediately. UI reads from local only.
- `synced = 0` on creation. Pushed to cloud on reconnect or app foreground.
- Pull on login fetches all cloud entries newer than device's last-seen `updated_at`.
- Append-only, last-write-wins. No concurrent multi-author edits. Conflicts not a concern at this stage.
