# Coding Principles

## Architecture
- Code lives in `src/features/<name>/`. No cross-feature imports.
- `src/core/` for services and providers. `src/shared/` for pure UI primitives.
- One-way data flow: features call core, never the reverse.
- Routing lives in `app/` (Expo Router). Features do not own routes.

## TypeScript
- Strict mode. No `any`. No `as unknown as X`.
- `type` for data shapes. `interface` for extendable contracts.
- Shared types in `packages/shared-types/`.

## Testing
- TDD. Failing test first.
- Test files next to component: `Component.tsx` → `Component.test.tsx`.
- Jest + React Native Testing Library.
- Test behavior, not implementation.
- Mock at the boundary: Supabase, AssemblyAI, Claude API. Never mock internal modules.

## Simplicity
- Only validate at system boundaries: user input, external API responses.
- No premature abstraction. Duplication is cheaper than the wrong abstraction.
- YAGNI. Build for now, not for imagined futures.
- Complex solution = wrong solution. Stop and find the simpler path.

## Safety Boundaries
Stop and confirm before:
- New third-party dependency
- Database schema change
- Routing structure change
- New feature start

NEVER:
- Skip pre-commit hooks
- Force-push to `main`
- Auto-push without explicit instruction
- Commit `.env` or credentials