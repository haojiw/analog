# analog

Voice-first personal memory app.

**North star:** *I speak therefore I am.*
**Product personality:** Silent, loyal, non-intrusive. Reliably transcribes and organizes thoughts. The AI only appears when summoned.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Mobile | Expo (React Native) + NativeWind |
| Web | TBD |
| Landing | TBD |
| STT | AssemblyAI → Gemini polish |
| AI | Gemini |
| Backend | Supabase (auth + db + storage + edge functions) |
| Package manager | npm workspaces |
| Auth | Magic Link |

---

## Monorepo Structure

```
analog/                          ← repo root
├── apps/
│   ├── mobile/                  ← Expo (React Native) app
│   ├── web/                     ← Web app (not yet initialized)
│   └── landing/                 ← Landing page (not yet initialized)
├── packages/
│   └── shared-types/            ← Shared TypeScript types across all apps
│       └── src/
│           ├── index.ts         ← barrel export
│           └── entry.ts         ← Entry type (core domain model)
├── supabase/
│   ├── functions/               ← Deno edge functions
│   └── migrations/              ← SQL migrations
└── docs/
    ├── core/                    ← North stars, product values
    ├── decisions/               ← ADRs
    ├── meetings/                ← Session notes
    └── principles/              ← Coding + writing principles
```

### Where things go

- **Shared TypeScript types** used by 2+ apps → `packages/shared-types/src/`
- **App-specific types, components, hooks** → inside the relevant `apps/` directory
- **Database schema changes** → `supabase/migrations/` as SQL files
- **Server-side logic / API endpoints** → `supabase/functions/` as Deno edge functions
- **Mobile-only UI, screens, features** → `apps/mobile/src/features/<feature>/`

### Running things

```bash
# Mobile
cd apps/mobile && npx expo start -c

# TypeScript check (from root)
npx tsc --noEmit -p apps/mobile/tsconfig.json
npx tsc --noEmit -p packages/shared-types/tsconfig.json
```

### npm workspaces

The root `package.json` manages the workspace. Run `npm install` from the root — never from inside an app directory. Shared deps are hoisted to root `node_modules/`.

Currently registered workspaces: `apps/mobile`, `packages/shared-types`.
Add new apps to `workspaces` in root `package.json` when initialized.

---

## Docs

- `docs/core` - keeps core values and north stars
- `docs/decisions` - keeps decisions made and objectives
- `docs/meetings` - keeps meeting notes from each session
- `docs/principles` - coding and writing principles

---

## Git

- Feature branch → merge to main. Never push directly to main.
- Never force-push. Never skip hooks.
