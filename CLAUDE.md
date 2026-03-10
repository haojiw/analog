# analog

Voice-first personal memory app. 

**North star:** *I speak therefore I am.*
**Product personality:** Silent, loyal, non-intrusive. Reliably transcribes and organizes thoughts. The AI only appears when summoned.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Mobile | Expo (React Native) + NativeWind |
| STT | AssemblyAI → Gemini polish |
| AI | Gemini |
| Backend | Supabase (auth + db + storage + edge functions) |
| Package manager | npm |
| Auth | Magic Link |

---

## Docs

- `docs/core` - keeps core values and north stars
- `docs/decisions` - keeps decisions made and objectives
- `docs/meetings` - keeps meeting notes from each session

---

## Git

- Feature branch → merge to main. Never push directly to main.
- Never force-push. Never skip hooks.
