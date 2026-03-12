# 01-phases — Build Phases
2026-03-10

Superseded by `260310-06-schema-and-architecture.md` for phase definitions and schema.

## Decisions not captured elsewhere

- `entry/[id].tsx` — `presentation: 'modal'` must be set explicitly in the layout file, not implied by file location.
- Text entry fallback is Phase 1, not Phase 2.
- Audio bytes always flow through the Edge Function. Device never calls AssemblyAI directly.

## Open
- Does Phase 3 AI chat need to be ready for the first demo? Decide before Phase 2 ends.
