# 260311-06 — Library & Mind Top Section Design
2026-03-11

---

## Decisions

### Library header bar
- Left: `library` label — mono, muted, left-aligned
- Right: search icon (`search-outline`) — tapping slides a search bar down (replaces the header row)
- Search is traditional/linear: keyword filter across title + transcript

### Library folder scroll (below header)
- Horizontal `ScrollView`, no scroll indicator
- Sits between the header bar and the existing month-grouped log list
- Always visible (even with no user folders, Favorites is always present)

### Folder chip anatomy
- **Favorites chip**: `★` star icon (no circle), label `Favorites` below — visually special, always first
- **User folder chips**: filled circle (~44px diameter, avatar size) + folder name below, centered
  - Color is assigned per folder (distinguish folders visually without icons)
  - Name is mono, small, centered under the circle
  - If name is too long: truncate with `…` (fixed max width on the label, `numberOfLines={1}`)
- **Add chip**: `+` at the end, same size as user folder chips — placeholder, no handler yet

```
  ★         ●         ●         ⊕
Favorites   Work    Travel      +
```

### Mind header bar
- Left: `mind` label — mono, muted, left-aligned (matches Library)
- Right: sparkle icon (`sparkles-outline`) — tapping opens AI conversation interface
  - For now: placeholder modal / bottom sheet, no real AI yet
- No section label above the knowledge graph — graph speaks for itself

---

## Open Questions (deferred)

- What color palette to use for folder circles? Random from a fixed set, or user-picks?
- Should Favorites show a count badge (number of favorited logs)?
- Should the folder scroll show if zero user folders exist, or hide until first folder is created? (Favorites alone is enough reason to always show it.)
