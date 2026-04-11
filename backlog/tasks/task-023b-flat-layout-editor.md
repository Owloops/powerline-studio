---
id: task-023b-flat-layout-editor
title: 'Interactive flat layout editor with segment popovers and drag reorder'
status: 'To Do'
created_date: '2026-04-11 23:10'
updated_date: '2026-04-11 23:10'
parent: task-023-redesign-studio-ui
subtasks:
dependencies:
  - task-023a-scaffolding
---

## Description

Build the interactive layout editor for non-TUI modes (minimal, powerline, capsule). This is a CSS flex-based visual representation of the segment arrangement where each segment is a styled chip. Clicking a segment opens a popover with its config form. Segments can be dragged to reorder. An "Add Segment" button is always visible.

## Specification

- CSS flex layout that visually represents segments per line, styled to match the display style (arrow separators for powerline, rounded caps for capsule, plain blocks for minimal)
- Each segment is a SegmentChip component showing the segment icon + name
- Click a chip → Popover opens with: segment name header, enable/disable toggle, the segment's config form (from segmentConfigMap), and a remove button
- Drag chips to reorder (using motion-v Reorder or native drag-and-drop)
- "Add Segment" button visible at the end of each line → opens SegmentPicker
- Multi-line: line switcher integrated into the editor (prev/next, add line, remove line)
- Segments with no options (Model, Version, Tmux) show a minimal popover with just enable/disable and remove
- Empty state: when no segments are enabled, show a prompt to add segments or choose a preset

## Design

### Key Files

- NEW `src/components/studio/editor/FlatLayoutEditor.vue` — main editor component
- NEW `src/components/studio/editor/SegmentChip.vue` — individual draggable segment chip
- NEW `src/components/studio/editor/SegmentConfigPopover.vue` — popover wrapper for segment config forms
- `src/components/studio/SegmentPicker.vue` — reuse for adding segments
- `src/components/studio/segments/index.ts` — segmentConfigMap (unchanged)
- `src/components/studio/segments/segmentMeta.ts` — segment names/icons (unchanged)

### Approach

- SegmentChip renders as a button styled per display style. For powerline: trailing arrow glyph. For capsule: rounded ends. For minimal: simple block. Uses the theme's segment colors for background/foreground.
- SegmentConfigPopover wraps a Popover component. Content: segment name + icon header, Switch for enable/disable, dynamic `<component :is="segmentConfigMap[name]" />` for the config form, and a destructive "Remove" button.
- Drag reorder uses motion-v's Reorder.Group/Reorder.Item (already a dependency, used in current SegmentsPanel).
- The editor reads `configStore.currentLineSegments` and `editorStore.activeLineIndex`.
- Line management uses existing `configStore.addLine()` / `configStore.removeLine()`.

## TODO

- [ ] Create FlatLayoutEditor.vue with flex layout per line
- [ ] Create SegmentChip.vue with style-aware rendering (minimal/powerline/capsule visual)
- [ ] Create SegmentConfigPopover.vue wrapping segment config forms in Popover
- [ ] Integrate drag-to-reorder using motion-v Reorder
- [ ] Integrate SegmentPicker for adding segments
- [ ] Add line switcher (prev/next/add/remove) inline in the editor
- [ ] Handle empty state
- [ ] Wire into (home).vue layout (conditionally shown when not TUI mode)
