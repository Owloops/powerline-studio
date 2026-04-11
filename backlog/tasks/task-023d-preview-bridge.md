---
id: task-023d-preview-bridge
title: 'Preview ↔ layout editor bridge: click-to-scroll, highlight, and popover sync'
status: 'To Do'
created_date: '2026-04-11 23:10'
updated_date: '2026-04-11 23:10'
parent: task-023-redesign-studio-ui
subtasks:
dependencies:
  - task-023b-flat-layout-editor
  - task-023c-tui-layout-editor
---

## Description

Connect the preview overlay hitbox clicks to the interactive layout editor. When a user clicks a segment in the ANSI preview, the page should scroll to that segment in the layout editor, highlight it, and open its config popover. This replaces the current behavior of switching sidebar tabs.

## Specification

- Clicking a segment hitbox in the preview sets `editorStore.focusedSegment` with the segment name and source='preview'
- The layout editor (flat or TUI) watches `focusedSegment` and: scrolls the cell/chip into view, applies a highlight animation (ring pulse for ~2s), opens the config popover
- Clicking title/footer hitboxes sets `editorStore.focusedTuiArea` and opens the corresponding template popover in the TUI editor
- The highlight animation is a temporary visual effect (CSS ring + scale pulse) that clears after 2 seconds
- If the layout editor section is scrolled off-screen, smooth-scroll to bring it into view before highlighting
- Bidirectional: when a user clicks a segment in the layout editor, the corresponding segment in the preview overlay could also briefly highlight (nice-to-have, not critical)

## Design

### Key Files

- `src/components/studio/SegmentOverlay.vue` — change click handler: instead of panel switching, set `editorStore.focusedSegment`
- `src/stores/editor.ts` — `focusedSegment` ref, `focusedTuiArea` ref, clear-after-timeout logic
- `src/components/studio/editor/FlatLayoutEditor.vue` — watch focusedSegment, scroll to chip, open popover
- `src/components/studio/editor/TuiLayoutEditor.vue` — watch focusedSegment/focusedTuiArea, scroll to cell, open popover

### Approach

- SegmentOverlay's handleClick currently calls editorStore.selectSegment() which switches panels. Replace with: set focusedSegment (for segments) or focusedTuiArea (for title/footer).
- Each SegmentChip and TuiGridVisual cell gets a ref exposed for scrollIntoView. The parent editor uses a Map of segment-name → element ref.
- Popover opening is controlled via a reactive `openPopoverFor` ref in the editor, set when focusedSegment changes.
- The highlight animation uses a CSS class toggled on for 2s then removed.

## TODO

- [ ] Modify SegmentOverlay.vue click handler to set focusedSegment/focusedTuiArea instead of switching panels
- [ ] Add focusedSegment and focusedTuiArea to editor store with auto-clear timeout
- [ ] Add scroll-to-segment and popover-open logic in FlatLayoutEditor
- [ ] Add scroll-to-cell and popover-open logic in TuiLayoutEditor
- [ ] Implement highlight animation (CSS ring pulse, 2s duration)
- [ ] Test: click segment in preview → scrolls to editor → highlights → opens popover
