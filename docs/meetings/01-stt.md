# 01-stt — STT Provider & Transcription Architecture
2026-03-10

## Decided

### Transcription architecture
Audio bytes: device → Supabase Edge Function → AssemblyAI (bytes via `/v2/upload`, not a public URL) + Supabase Storage (private bucket, parallel). Edge Function returns immediately after submitting job. Client polls `status`.

Rationale: API keys stay off device. Audio never at a public URL. Provider is swappable in one file.

### Supabase Storage: private bucket
Public bucket exposes users' voice recordings to anyone with the URL. Personal memory app warrants private. Cost: one `generateSignedUrl()` call in the Edge Function when AssemblyAI needs to fetch — acceptable.

### AssemblyAI flow
1. `POST /v2/upload` with raw bytes → returns private `upload_url`
2. `POST /v2/transcript` with `upload_url` → returns job ID
3. Poll `GET /v2/transcript/:id` until `completed` or `error`

AssemblyAI does not require a public URL. Private upload URL is accessible only by AssemblyAI servers.

### Provider abstraction
Edge Function interface: `(audio bytes + mime type + duration) → { raw_transcript }`. Client never calls STT providers directly. Swapping providers = changing Edge Function internals only.

### Provider landscape

| Provider | Model | API mechanic | Notes |
|---|---|---|---|
| AssemblyAI | Conformer-2 | bytes → private URL → poll | MVP choice. Two-step upload is slightly awkward. |
| Deepgram | Nova-3 | bytes → transcript (one shot, no polling) | Better long-term fit. Faster, simpler API. Switch after MVP. |
| Willow Voice | Whisper-based | self-hosted only | Requires GPU infrastructure. Not relevant. |
| Wispr Flow | unknown | consumer dictation API | Product, not infrastructure. Wrong tool. |

## Open
None. Architecture decided.
