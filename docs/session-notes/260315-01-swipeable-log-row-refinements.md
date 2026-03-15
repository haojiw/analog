# 260315-01 — SwipeableLogRow Refinements
2026-03-15

---

## What We Did

Five UI fixes to swipe actions on library log rows, plus follow-up perf work.

**Visual**
- Removed star icon from favorited row bodies
- Add-to-collection button: gold fill, white icon (was outlined gold)
- Collection picker: compact transparent bottom sheet instead of full pageSheet modal

**Swipe logic simplification**
- Removed full-swipe auto-trigger (drag listeners, boost animation, `FULL_SWIPE_THRESHOLD`, `Dimensions`)
- Swipe reveals button; tap button → action. No special behavior on full swipe.

**Single open row at a time**
- Initial approach: React state + `useEffect` — caused ~0.5s delay because `onSwipeableOpen` fires after the spring animation settles
- Second attempt: moved to `onSwipeableWillOpen` (fires at start of snap) — still async due to setState → re-render → effect chain
- Final: shared `openSwipeableRef = useRef<Swipeable | null>(null)` passed to all rows. `onSwipeableWillOpen` calls `openSwipeableRef.current?.close()` synchronously — no React cycle, true simultaneity

**Close on scroll**
- Added `onScrollBeginDrag` to the `ScrollView` — closes the open row when the user starts scrolling, interpreted as abandoning the action
- Complements `handleRowPress` (which handles tap-to-dismiss); the two cover different interactions

**Dead code removed**
- `isOpenRef` — redundant with `openSwipeableRef.current === swipeableRef.current`
- `isFavorite` and `onToggleFavorite` props on `SwipeableLogRow` — unused after swipe simplification
- `handleToggleFavorite` and its prop threading in `LibraryScreen` / `DayGroupView`
