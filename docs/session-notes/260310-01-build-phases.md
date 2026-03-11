# 01-phases — Build Phases
2026-03-10

## Decided

### Phase 0 — skeleton
- Monorepo: `packages/shared-types/`, root workspaces, `.env.example`, Husky + lint-staged
- Migrate `App.tsx` → Expo Router
- Supabase schema: `entries` table — `id`, `user_id`, `created_at`, `audio_url`, `transcript_raw`, `transcript_polished`, `duration_seconds`, `status`, `embedding vector(768)` (nullable). pgvector enabled now. RLS: users own their rows.
- Magic Link auth with deep link config in `app.json` (custom URL scheme required for magic link on device)
- NativeWind config

**Parallelizable tracks:**
- Track A: Expo Router migration + NativeWind config
- Track B: Supabase project + schema + Magic Link auth

Phase 1 starts only when all of Phase 0 is complete.

### Phase 1 — core loop
- Record screen: hold to record, release to stop, expo-av. Check offline + mic permissions before recording. Upload raw bytes via Edge Function. Show save animation with explicit failure state. Navigate to journal on success.
- Transcription architecture: Edge Function on insert submits bytes to AssemblyAI `/v2/upload` → gets `upload_url` → submits transcription job → stores `transcript_id` in DB → sets `status: processing` → returns immediately. Client polls for status change. Then Gemini polish. No long-running Edge Function (150s timeout risk).
- Text entry fallback — part of Phase 1, not Phase 2.
- Journal screen: flat list, tap → `entry/[id].tsx` (modal presentation — explicit in layout, not implied by file location)

### Phase 2 — harden
- Audio playback in entry detail
- Transcription failure handling (surface failed entries, allow retry)
- Offline feedback polish

### Phase 3 — AI (only after core loop has real users)
- Search via pgvector
- Chat / Memory Query (conscious AI)
- Portrait / Wrapped (subconscious AI)

### Architectural decisions
- `entry/[id].tsx` — `presentation: 'modal'` set explicitly in layout
- Supabase Storage bucket: private (see `01-stt.md`)
- Audio bytes flow through Edge Function, never directly from device to AssemblyAI

## Open
- Does Phase 3 AI chat need to be ready for the first demo? Decide before Phase 2 ends.
