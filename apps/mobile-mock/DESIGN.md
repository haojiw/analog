# analog mobile-mock — Design

## Philosophy
- Core action is 记录. App opens to Home every time.
- AI only appears when summoned. No proactive behavior.
- Whitespace is load-bearing. Never inherit Spotify's density.

---

## Navigation
3 tabs: **Library** (left) · **Home** (center, circle indicator only) · **Mind** (right)

- Tab bar hides entirely during recording.
- Center tab: outlined circle = inactive, filled gold = active.

---

## Home
Full-screen recording ritual.

- Header (60px): `EST. MMXXIV` left · `SILENT`/`LISTENING` + status dot right
- Center: 5 concentric dashed SVG rings + 60px record button (dark circle, gold dot inside)
- Footer: *"i speak therefore i am"* in Cormorant Garamond Italic

**Recording state:** header fades up, quote fades down, tab bar gone, rings turn terracotta and breathe. On stop: reverses, status briefly shows `SAVING...`.

---

## Library
Compact chronological ledger. For scanning, not lingering.

- Per entry: date · transcript first line · duration · mood dot (2 lines max)
- Entry separators: `1px dashed` faint ink
- Tap entry → detail overlay slides up
- Full layout TBD in dedicated session

---

## Mind
- **Hero:** knowledge graph SVG — static for now, but sized/spaced as if nodes are tappable
  - Gold sun core with glow · dashed orbit rings · themed planet nodes · slow rotation
- **Below:** 2 cards (Spotify explore-style)
  - **Monthly Wrapped** — this month's patterns
  - **Portrait** — continuously updating self-model (personality, identity, themes, relationships). Always shows most recently updated dimension.

---

## Detail Overlay
Slides up from bottom (0.5s cubic-bezier) on Library entry tap.

- Header: `← Library` · date/duration meta
- Player: play button · waveform · timestamp
- Transcript (Inter, readable)
- AI insight (`✦` divider · `THE ARCHITECT NOTES` · italic terracotta serif) — only if exists

---

## Typography
| Role | Font |
|------|------|
| Display / quotes | Cormorant Garamond Italic |
| UI chrome | Space Mono — uppercase, `letterSpacing: 2`, `fontSize: 10` |
| Body / reading | Inter |

---

## Colors
| Token | Hex |
|-------|-----|
| `background` | `#FFF6E9` |
| `surface` | `#EAE6DD` |
| `ink` | `#342b22` |
| `inkFaint` | `#7A756D` |
| `border` | `#C2BBB0` |
| `accent` | `#C95A3A` |
| `gold` | `#E2A746` |

Never hardcode hex in components. Always use `theme.colors.*`.

---

## Dark Mode
Not built. Architecture is ready — swap `lightTheme` for `darkTheme` in ThemeContext.

---

## mock.html
Visual and motion reference only. Our conversation overrides it where they conflict.

- ✅ Ring animations, recording transitions, color palette, detail overlay interaction
- ❌ Tab labels (theirs: Capture/Archive/Mind · ours: Library/Home/Mind), 3-ring system
