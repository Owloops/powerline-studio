---
id: task-026c-flat-editor-improvements
title: 'Flat layout editor: all lines visible, z-index fix, compact popovers'
status: 'To Do'
created_date: '2026-04-12 14:35'
updated_date: '2026-04-12 14:35'
parent: task-026-ui-polish-v2
subtasks:
dependencies:
  - task-026a-page-shell
---

## Description

Improve the flat layout editor: show all config lines simultaneously instead of switching between them, fix z-index issues where hovered segment borders get overlayed by adjacent segments, and make segment config popovers more compact with horizontal label/input layout and themed scrollbars.

## Specification

1. **Show all lines at once**: Instead of using `LineSelector` to switch between lines, render all lines vertically. Each line shows as its own flex row with a "Line N" label and its own "Add Segment" button. "Add Line" button at the bottom to add new lines. "Remove Line" control per line (except line 1, which remains protected — the store blocks removing index 0).

   **Line-index data flow**: All 10 segment config forms read from `configStore.currentLineSegments` and write via `editorStore.activeLineIndex`. Rather than refactoring every config component, set `editorStore.activeLineIndex` to the line's index when the user interacts with that line section (popover open, chip click, add segment). This ensures the existing config forms bind to the correct line automatically. Use composite keys (`${lineIndex}:${segmentKey}`) for popover-open state, chip refs, and highlight state to avoid collisions when the same segment type appears on multiple lines.

   **Preview-to-editor bridge**: `FocusedSegment` in `editor.ts` currently has no `lineIndex` field. Add an optional `lineIndex` to `FocusedSegment` so preview clicks can target the correct line's chip when all lines are visible. The flat statusline renderer already knows which line it is rendering, so it can pass the index through the overlay click handler.

   **5-line cap**: The "Add Line" button should be disabled when there are already 5 lines (matching the existing store guard). Show a tooltip or disabled state to communicate the limit.

2. **Z-index hover fix**: When hovering a segment chip, its border highlight gets overlayed by the next chip (especially in powerline mode where chips are flush). Apply `hover:z-10` to the `Reorder.Item` wrapper div (not just the inner chip button), because `Reorder.Item` can create its own stacking context during drag animations, preventing a child z-index from rising above adjacent wrappers. The chip button can also get `hover:relative` as a fallback.

3. **Compact segment config popovers**:
   - Layout: labels on the left, inputs on the right (horizontal flex layout instead of vertical stacking)
   - Use small variants of form inputs (smaller text, reduced padding)
   - Popover content that overflows should get a scrollbar
   - Style scrollbars thin and themed (use `ScrollArea` or CSS `scrollbar-width: thin` with themed scrollbar colors)
   - The popover width may need to increase slightly to accommodate horizontal layout (e.g., `w-96` instead of `w-80`)
   - **Form field approach**: Add a CSS class on the popover content wrapper (e.g., `.compact-fields`) that targets the form field layouts via descendant selectors to flip them horizontal (`flex-row`, `items-center`, label `shrink-0 w-24`). `FormSwitchField` already uses horizontal layout so it needs no change. For `FormSelectField`, `FormTextField`, and `FormNumberField`, their `flex-col` containers become `flex-row` under `.compact-fields`. Error/helper text stays full-width below via `flex-wrap`.

### Acceptance Criteria

- All config lines visible simultaneously in the editor
- Each line has its own label, segments, and add button
- Opening a popover on any line sets `activeLineIndex` so config forms bind to the correct line
- Popover-open state uses composite keys — opening segment X on line 1 does not affect line 2
- Segment chip hover shows border above adjacent chips (z-index on Reorder.Item wrapper)
- Segment config popover uses horizontal label/input layout
- Overflowing popover content is scrollable with thin themed scrollbar
- "Add Line" button disabled at 5 lines, "Remove Line" available on all lines except line 1
- Preview click on a segment scrolls to and highlights the correct line's chip

## Design

### Key Files

- `src/components/studio/editor/FlatLayoutEditor.vue` — rewrite to render all lines, remove LineSelector usage
- `src/components/studio/editor/SegmentChip.vue` — no changes needed (z-index goes on wrapper)
- `src/components/studio/editor/SegmentConfigPopover.vue` — horizontal layout, compact inputs, scrollbar styling
- `src/components/studio/LineSelector.vue` — may become unused (keep for now, just stop using it)
- `src/stores/editor.ts` — add optional `lineIndex` to `FocusedSegment` interface

### Approach

- **FlatLayoutEditor multi-line rendering**: Iterate `configStore.config.display.lines` array and render each line as its own section. Each section: "Line {i+1}" label on the left, flex-wrap chip container with its own `Reorder.Group`, per-line "Add Segment" button, per-line remove button (except line 1). Below all lines: "Add Line" button (disabled at 5 lines).

- **Line-index binding strategy**: When a popover opens or a chip is clicked on line N, call `editorStore.setActiveLineIndex(N)`. This makes `currentLineSegments` point to the correct line. The 10 segment config forms already read/write through `activeLineIndex`, so no form refactoring is needed. Each line section needs its own `enabledSegmentKeys` and `segmentOrder` computed from `configStore.config.display.lines[lineIndex]` directly (not from `currentLineSegments`), so the chip list renders correctly for all lines simultaneously.

- **Composite state keys**: Use `${lineIndex}:${segmentKey}` for `openPopover`, `chipEls`, and `highlightedChip` to prevent cross-line collisions when the same segment type exists on multiple lines.

- **Preview-to-editor bridge**: Add optional `lineIndex` to `FocusedSegment` in `editor.ts`. The flat renderer's overlay handler already knows the line index — pass it through. `FlatLayoutEditor`'s focus watcher uses `lineIndex` to target the correct line's chip ref.

- **Z-index fix**: Add `hover:z-10` to the `Reorder.Item` wrapper `div` in `FlatLayoutEditor.vue`. This ensures the hovered item's entire stacking context (including the chip and its ring) rises above adjacent reorder items, even when `Reorder.Item` creates its own context during drag.

- **Compact popover layout**: Add a `.compact-fields` CSS class on the `SegmentConfigPopover` content wrapper. Use descendant selectors to flip `FormSelectField`, `FormTextField`, `FormNumberField` containers from `flex-col` to `flex-row items-center` with label `shrink-0 w-24`. `FormSwitchField` already uses horizontal layout. Error text stays full-width via `flex-wrap`. `ScrollArea` wraps the config form area with `max-h-72` (already present).

## TODO

- [ ] Add optional `lineIndex` to `FocusedSegment` interface in `editor.ts`
- [ ] Rewrite FlatLayoutEditor to render all lines simultaneously with per-line state
- [ ] Use composite keys (`${lineIndex}:${segmentKey}`) for popover, chip ref, and highlight state
- [ ] Set `activeLineIndex` on popover open / chip interaction so config forms bind correctly
- [ ] Derive per-line `enabledSegmentKeys` and `segmentOrder` from `config.display.lines[i]` directly
- [ ] Add "Line N" labels for each line section
- [ ] Add per-line "Add Segment" button
- [ ] Add "Add Line" button below all lines (disabled at 5 lines)
- [ ] Add per-line remove control (except line 1 — store blocks index 0 removal)
- [ ] Add `hover:z-10` to `Reorder.Item` wrapper div for z-index fix
- [ ] Add `.compact-fields` CSS class on SegmentConfigPopover content wrapper
- [ ] Style descendant form fields as horizontal layout under `.compact-fields`
- [ ] Add ScrollArea with themed scrollbar for overflowing popover content (already has max-h-72)
- [ ] Update preview-to-editor focus watcher to use `lineIndex` from `FocusedSegment`
- [ ] Verify drag reorder still works within each line
