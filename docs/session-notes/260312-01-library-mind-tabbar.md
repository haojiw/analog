# 260312-01 — Library & Mind Headers, Collections, Tab Bar
2026-03-12

---

## Decisions

### Header (Library & Mind)
- Header matches Home pattern exactly: hamburger (20×15px, 2px lines) + `USERNAME` left, action icon right
- Left: `paddingHorizontal: 24`, `gap: 9` — identical to Home's `idleRow`
- Typography: mono 14px, `letterSpacing: 1.5`, uppercase
- `paddingTop: 14`, `paddingBottom: 16`, `alignItems: 'flex-start'`
- Library right: `search-outline` icon (24px)
- Mind right: `sparkles-outline` icon (24px) — placeholder for AI conversation interface
- Both icons: no handler yet, TODO

### Collections strip (Library)
- Renamed from "folders" → **collections** throughout
- Sits inside the main `ScrollView` — scrolls with the log list, not pinned to top
- Chips: Favorites (★ star, no circle) → collection chips (44px filled circle + name below) → Add chip (+ outlined circle)
- `CollectionChip` label: mono 10px, `numberOfLines={1}`, `maxWidth: 60` — truncates long names
- Mock collections: Work, Travel, Personal Growth

### Mock data
- Added 10 February 2026 logs across 5 days (Feb 3, 12, 18, 24, 28)
- Tests the month-section grouping and scroll behavior in Library

### Tab bar redesign
- **Library**: square outline (20×20px, 2px border) + short horizontal line centered inside
- **Home**: circle (32px, 1.5px border) — no label, no fill. Active state: border darkens to `C.ink`, no color fill
- **Mind**: ring (24px, 2px border) + 4px filled center dot — orbital / universe feel
- All icons: geometry-only, no icon library
- Layout: vertical — icon on top, label (8px mono, `letterSpacing: 1`) below. `gap: 4`
- `paddingTop: 12` on each tab so all icon tops are top-aligned
- Divider lines between tabs: **removed**
- Spacing: `paddingHorizontal: 25` on tab bar (keeps `flex: 1` on tabs, adaptive to screen width)

---

## Files Changed
- `apps/mobile-mock/app/(tabs)/_layout.tsx` — full tab bar rewrite
- `apps/mobile-mock/app/(tabs)/library.tsx` — header + collection strip
- `apps/mobile-mock/app/(tabs)/mind.tsx` — header
- `apps/mobile-mock/app/(tabs)/index.tsx` — header sizing aligned
- `apps/mobile-mock/src/mocks/data.ts` — February 2026 mock logs added

---

## Open Questions (deferred)
- Wire search icon → slide-down search bar on Library
- Wire sparkles icon → placeholder AI modal on Mind
- Collection chip tap → filtered log list view
- Add chip → create collection flow
