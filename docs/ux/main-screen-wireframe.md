# Main timetable screen wireframe

One page for the timetable route (`TimetableView`). Existing glass cards, badges, and tabs stay. Only the status region and the weekly grid entrance changed.

```
+------------------------------------------------------------------+
| Navigation (unchanged)                                           |
+------------------------------------------------------------------+
| Timetable Management                         [theme] [export]    |
| subtitle                                     [Auto Generate]     |
|                                              [Add Entry]         |
+------------------------------------------------------------------+
| Staff search (unchanged)                                         |
+------------------------------------------------------------------+
| STATUS  (new, also repeated inside Auto Generate)               |
| [icon] Status: Ready to generate | Generating | Timetable        |
|        generated                                                 |
|        one sentence of what to do next                           |
|                                          badge: Generate |       |
|                                          Loading | Result        |
+------------------------------------------------------------------+
| Tabs: Grid View | Department by Year | Preview | Search Results  |
+------------------------------------------------------------------+
| Filters (unchanged; still their existing motion)                 |
+------------------------------------------------------------------+
| WEEKLY TIMETABLE                                                 |
| Loading: spinner is optional; text says "Loading timetable"      |
| Loaded: department grid. One entrance on the whole grid.         |
| Day rows no longer slide in separately.                          |
+------------------------------------------------------------------+
```

## Regions changed

- Status strip on the timetable page, above the tabs. It follows generate, loading, and result. The same strip is the first block inside Auto Generate, because that dialog covers the page while generation runs.
- Weekly timetable grid. Its entrance is one opacity-and-translate motion. Per-row 20px slides were removed so the grid does not travel farther than the entrance.
- Grid fetch state. The spinner is no longer the only cue. The card says "Loading timetable" and explains that the saved schedule is being fetched.

## Motion

- Decision: `timetableEntranceMotion` and `timetableStateMotion` in `src/utils/timetableMotion.ts`. Both take a boolean for reduced motion. The UI reads `prefers-reduced-motion` and passes that boolean in. It does not decide inside the animation call.
- If motion is allowed: opacity 0 to 1, translate Y 8px to 0, 240ms, ease-out (`easeOut`). No axis moves more than 8px.
- Generate, loading, and result each replay that same entrance when the phase changes (`key` is the phase). The badge text changes with the phase: Generate, Loading, or Result. Color and icons are extra, not the only signal.
- The grid replays the entrance when department, semester, year, or view mode changes.

## Reduced motion

- If `prefers-reduced-motion: reduce` matches, the pure function returns opacity 1, translate 0, and duration 0. Nothing fades or moves.
- The loading icon does not spin in that case. The status text and badge stay.
- Global CSS that shortens animations is unchanged and is not the decision this screen uses.
