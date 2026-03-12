# 260311-02-library-and-mind-plan
2026-03-11

---

## Decisions

- **Library layout: receipt roll.** Zero gap between entries, full-width rows, continuous tape. No cards, no shadows, no breathing room. The density is intentional — it makes the volume of your memory feel real.
- **Entry row anatomy:** `[time] · [duration] · [transcript first line or placeholder]`. Time and duration in Space Mono. Transcript in Inter. Waveform NOT shown in list view — only in detail overlay.
- **Section headers:** Date label only (TODAY / YESTERDAY / MON MAR 9 / etc.), Space Mono, all caps, muted. Flush left. Acts as a visual break in the tape.
- **Detail overlay:** Slides up from bottom on row tap. Full-screen sheet. Contains waveform scrubber, full transcript, AI insight stub. Does not navigate — dismisses back to Library.
- **Mind screen layout:** Knowledge graph SVG hero (top ~55% of screen) + scrollable cards below (Monthly Wrapped, Portrait). Cards scroll under the graph which stays fixed.
- **Knowledge graph:** Nodes are topic strings (hardcoded). Node size = frequency weight. Edges = co-occurrence. Tappable appearance, no tap handler yet. Labels in Inter, small.
- **Monthly Wrapped card:** Month name header + 3 hardcoded insight lines. Placeholder for now.
- **Portrait card:** Shows one "dimension" label + a one-line description. Hardcoded. Continuously updates in Phase 3.

---

## Build Plan

### Library screen (`app/(tabs)/library.tsx`)

**Step 1: Mock data**
Define `mockLogs` array in `src/mocks/data.ts`. Each log: `{ id, createdAt, entries: [{ id, type, durationMs, transcript }] }`. Include ~12 entries across 3–4 date groups.

**Step 2: Section grouping**
`useSectionedLogs(logs)` — pure function, groups by date bucket (Today / Yesterday / day-name for past week / MMM D for older). Returns `{ title, data }[]`. Include current date as dependency.

**Step 3: `EntryRow` component**
- Layout: single `View`, `flexDirection: row`, `paddingVertical: 12`, `paddingHorizontal: 16`, `borderBottomWidth: 0` (no separator — receipt roll uses no divider between rows in the same section).
- Left cluster: time string (HH:MM) + bullet + duration string (`1m 23s`), Space Mono, small, muted.
- Right: transcript first line truncated to 1 line, Inter, regular weight. If no transcript: `"..."` in muted color.
- Active state: background dims slightly on press (no scale).
- Swipe-to-delete: defer to after detail overlay works. Stub the gesture for now.

**Step 4: `LibrarySectionHeader` component**
- Full-width row, `paddingHorizontal: 16`, `paddingTop: 20`, `paddingBottom: 6`.
- Date label in Space Mono, uppercase, muted, small.

**Step 5: `SectionList` assembly**
Wire `SectionList` with `useSectionedLogs`, `renderItem={EntryRow}`, `renderSectionHeader={LibrarySectionHeader}`, `stickySectionHeadersEnabled={false}`, no `ItemSeparatorComponent` (receipt roll has no dividers).

**Step 6: Detail overlay**
- `DetailOverlay` component: `Modal` with `animationType="slide"` and `presentationStyle="pageSheet"`.
- Contains: drag handle, waveform bar (static for now — flat grey bars), full transcript text, a divider, AI insight section (hardcoded stub text), close button.
- Triggered by `EntryRow` `onPress` → sets `selectedLog` state in Library screen.

---

### Mind screen (`app/(tabs)/mind.tsx`)

**Step 1: Knowledge graph**
- Fixed-height `View` (55% of screen height), `overflow: hidden`.
- SVG canvas fills it. Nodes: `Circle` + `Text`. Edges: `Line`. Hardcode 8–10 nodes with positions, sizes, labels. Edges between a subset.
- Node press: no handler yet (visual only).
- Color: nodes use accent color at varying opacity for weight. Edges are muted lines.

**Step 2: Scrollable card section**
- `ScrollView` below the graph (not over it — graph is outside the ScrollView).
- Monthly Wrapped card: section header `MARCH WRAPPED`, then 3 insight lines in Inter. Subtle background tint.
- Portrait card: label `PORTRAIT` + one dimension string + one-line description. Same card style.
- Cards have `borderRadius: 12`, `marginHorizontal: 16`, `marginBottom: 12`, light background.

**Step 3: Fixed graph + scrolling cards layout**
Use a `View` with `flex: 1`. Top child: graph view with fixed height. Bottom child: `ScrollView` with `flex: 1`. No `NestedScrollView` needed — the graph does not scroll.

---

## Open Questions

- **Entry row tap target:** Tap anywhere on the row, or only on the transcript text? Anywhere.
- **Waveform in detail overlay:** Static placeholder bars for now — real waveform data in Phase 0 real app.
- **Mind graph tap:** When tapped, should it open a filtered Library view (entries related to that topic)? Phase 3 question — defer.
- **Portrait card update frequency:** How often does the "most recently updated dimension" change? Phase 3 question.
