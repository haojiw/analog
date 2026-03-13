# 260311-04 — Library & Mind UI Refinements

## Decisions

- Library list view uses a **date-square + grouped log rows** layout: one bordered square showing the day number anchors each day group; subsequent rows are indented with a same-size spacer. Won't revisit.
- No transcript preview in the list — title only. The list is a navigation surface, not a reading surface.
- Duration shown as `m:ss` (e.g. `1:06`, `0:47`) with no surrounding box — plain mono text, right-aligned.
- Text-only logs show `txt` as their duration indicator (added by user post-session).
- `MockLog` now requires a `title` field. Titles are explicit, not derived from transcript.
- Mind tab: knowledge graph scrolls with cards, not fixed. Height is `width * 0.85` (proportional, not screen-fraction).

## Changes Made

- `apps/mobile-mock/src/mocks/data.ts` — added `title: string` to `MockLog` type; added titles to all 12 mock logs.
- `apps/mobile-mock/app/(tabs)/library.tsx` — full rewrite: replaced `SectionList` + `useSectionedLogs` with `ScrollView` + inline `groupLogs()` returning `MonthGroup[]`/`DayGroup[]`; new `DateSquare`, `DayGroupView`, `LogRow` components; month headers; duration as plain text.
- `apps/mobile-mock/app/(tabs)/mind.tsx` — removed fixed `graphContainer`, moved `KnowledgeGraph` into `ScrollView` as first child; removed `Dimensions` import; graph height now `width * 0.85`.

## Key Reasoning

- `groupLogs()` lives inline in `library.tsx` (not a hook) because it's only used in one place and the data is small — no need for the abstraction.
- `useSectionedLogs` hook left in place (not deleted) since it may be used by the real mobile app later.
- `DateSquare` spacer uses the exact same `width`/`height` as the square so title columns align pixel-perfectly without measuring.

## Next Steps

1. Add search bar to Library (toggleable, slides in from top).
2. Decide on alternate views for Library (calendar grid, files/type view).
3. Wire up `DetailOverlay` title display — currently shows time + duration in header, should show `log.title`.

## Open Questions

- What should "Untitled" logs eventually be called in production — auto-generated from transcript, or user-editable?
- Calendar view for Library: separate tab within the screen, or a toggle on the existing list?
- Should the date square reflect any state (e.g. dot indicator if a day has unsynced entries)?
