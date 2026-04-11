---
id: task-023c-tui-layout-editor
title: 'Interactive TUI layout editor with grid, popovers, breakpoints, and options'
status: 'To Do'
created_date: '2026-04-11 23:10'
updated_date: '2026-04-11 23:10'
parent: task-023-redesign-studio-ui
subtasks:
dependencies:
  - task-023a-scaffolding
---

## Description

Build the interactive TUI layout editor. This is a CSS grid that visually mirrors the TUI panel's area layout for the active breakpoint. Cells are clickable (opening config popovers), rows are draggable/deletable, columns have visual resize handles, and title/footer areas are editable. A breakpoint switcher syncs with the terminal width. TUI-specific options (box style, separators, padding, sizing) are grouped together.

## Specification

- CSS grid layout matching the breakpoint's columns and areas definitions
- Each cell shows the segment name and icon, clickable → popover with: segment config form, color override controls (bg/fg), segment template override
- Empty cells (`.` placeholders) show a "+" button → segment picker
- Row controls: drag handle to reorder (reuses configStore.moveAreaRow), per-row delete button, add row/divider buttons at any position
- Column controls: visual column border handles that open a popover with column size type (auto/fr/fixed) and value, plus alignment select. Or: draggable to resize.
- Title bar: rendered above the grid as a clickable strip → popover with TemplateEditor (left/right templates + TokenPicker)
- Footer: same as title bar, below the grid
- Breakpoint switcher: horizontal tabs/buttons showing each breakpoint's minWidth. Clicking a breakpoint auto-sets previewStore.terminalWidth to show that breakpoint's range. The active breakpoint is highlighted.
- TUI Options section (collapsible or menu): groups box style picker, separator config, padding, fitContent/minWidth/maxWidth
- Divider rows render as visual `--- divider ---` strips (similar to current GridAreaEditor)
- Validation errors from useTuiValidation shown inline

## Design

### Key Files

- NEW `src/components/studio/editor/TuiLayoutEditor.vue` — main TUI editor
- NEW `src/components/studio/editor/TuiGridVisual.vue` — CSS grid rendering of areas
- NEW `src/components/studio/editor/TuiCellPopover.vue` — cell config popover (segment config + colors + template)
- Reuse/adapt: `src/components/studio/tui/BreakpointManager.vue`, `src/components/studio/tui/ColumnSettings.vue`, `src/components/studio/tui/TemplateEditor.vue`, `src/components/studio/tui/TokenPicker.vue`, `src/components/studio/tui/TuiStylingSection.vue`, `src/components/studio/tui/TuiGlobalOptions.vue`, `src/components/studio/tui/BoxStylePicker.vue`
- `src/stores/preview.ts` — add breakpoint-width sync logic
- `src/composables/useTuiValidation.ts` — reuse for inline errors

### Approach

- TuiGridVisual uses CSS `grid-template-columns` from the breakpoint's column defs and renders each area row. Merged cells (same segment spanning columns) are handled by CSS `grid-column: span N`. The component parses areas the same way the current GridAreaEditor does.
- TuiCellPopover contains: segment name header, the config form from segmentConfigMap, a color override section (ColorPairRow for bg/fg), and a template override section (SegmentTemplateItem or similar). This consolidates what's currently spread across SegmentRow, ThemeOverrides, and SegmentTemplateEditor.
- Breakpoint-width sync: when user clicks a breakpoint tab, set `previewStore.terminalWidth` to `breakpoint.minWidth + previewStore.reservedWidth` (so the preview renders at the start of that breakpoint's range).
- TUI Options: wrap TuiGlobalOptions + TuiStylingSection (BoxStylePicker, SeparatorConfig, PaddingConfig) into a single collapsible section or a Popover/Sheet.
- Column controls can start simple (click column header to open settings popover) and add drag-to-resize later.

## TODO

- [ ] Create TuiLayoutEditor.vue as the top-level TUI editor
- [ ] Create TuiGridVisual.vue: CSS grid matching breakpoint areas/columns
- [ ] Create TuiCellPopover.vue: segment config + color overrides + template in a popover
- [ ] Add title/footer clickable strips with template editing popovers
- [ ] Implement row controls: drag reorder, per-row delete, add row/divider
- [ ] Implement column controls: clickable column headers → settings popover
- [ ] Build breakpoint switcher with terminal width sync
- [ ] Create TUI Options section grouping box/separator/padding/sizing
- [ ] Show validation errors inline
- [ ] Wire into (home).vue layout (conditionally shown when TUI mode)
