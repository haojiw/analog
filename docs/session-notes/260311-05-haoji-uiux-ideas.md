# 260311-05 — Haoji Ideas
2026-03-11

*Raw ideas from Haoji — not decisions, not yet designed. Captured for future reference and discussion.*

---

## Library Screen

### Search
- Search is a primary, important function for Library.
- Should be **traditional and linear** — filter/query the log list by keyword, title, transcript content.
- Not AI-powered (that belongs to Mind).

### Folders / Themes (the "projects" feature)
- Instead of a calendar grid view, what's needed is something like **GPT/Claude Projects** — a way to cluster important conversations into named groups.
- Could be called "folder", "theme", "project", or something else — naming TBD.
- Conceptual models that feel right:
  - **Spotify liked songs** → favorited logs accessible in one place.
  - **Spotify playlists** → folders you curate, each a named list of logs.
- Folders contain: important logs, favorited logs, and eventually **starred conversations** (the "start conversations" / conversation mode logs that will be added later).

### Top of the Library Screen
- First component: **horizontal scroll of folders/projects** — quick access to your clusters without going deep into a separate view.
- Tapping a folder card opens a filtered list view of that folder's logs.

### Swipe Gestures on Log Rows
- **Swipe left**: favorite the log OR assign it to a specific folder (show folder picker).
- **Swipe right**: delete or other destructive/secondary actions.

---

## Mind Screen

### Search / AI Mode
- Mind will have a search button, but it is **not a traditional search**.
- It is **conversational and AI-powered** — like Google's conversation mode or talking to an AI that knows your memory.
- You ask it questions out loud or by text; it synthesizes answers from your logs.
- For now: add the button as a placeholder. The button opens a conversational AI interface. Don't over-specify the interaction yet.

---

## Profile / Settings Button (Global Nav)

### Current state
- Home screen has: hamburger icon + username on top-left.

### Proposed change
- Replace hamburger + username with a **user profile picture** (same tap behavior — opens profile/settings).
- Functionality: access user profile, settings, and anything account-related.

### Open question: should this button live on every screen?
- Candidate: top-left of **all three tabs** (Home, Library, Mind) always shows the profile picture.
- This makes settings always reachable without going to Home first.
- Not yet decided — worth discussing whether the persistent presence is helpful or clutters secondary screens.

---

## Pull-Up Gesture (per screen)

What should a pull-up gesture trigger on each screen?

### Home
- Instinct: **fast-access general search** — a combined search that cuts across everything (logs, folders, transcripts, AI memory).
- Maybe something else alongside search — not yet clear.

### Library
- Instinct: **refresh / sync** — pull up to trigger a data sync with the server (classic pull-to-refresh pattern, but from bottom rather than top).

### Mind
- Instinct: something personal / reflective — not yet clear what.
- Feels like it should relate to the user's own patterns or history, not just a utility action.

---

## Open Questions

1. What do we call the folder/project/theme clusters? Does the name matter at the mock stage?
2. Should the horizontal folder scroll on Library always show (even if no folders exist yet) or only appear once a folder is created?
3. Should "favorited" logs be their own implicit folder, or just a tag/filter?
4. Pull-up on Mind — what's the right action? (Haoji's instinct: something self-referential, not a utility.)
5. Profile picture button across all screens — helpful ubiquity or visual clutter on secondary screens?
6. When "start conversations" (conversation mode logs) are added, do they live in Library alongside audio/text logs, or have their own section?
