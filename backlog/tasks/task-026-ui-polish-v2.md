---
id: task-026-ui-polish-v2
title: 'UI polish v2: page shell, compact controls, editor improvements, TUI visual overhaul'
status: 'To Do'
created_date: '2026-04-12 14:35'
updated_date: '2026-04-12 14:35'
parent: null
subtasks:
  - task-026a-page-shell
  - task-026b-compact-controls
  - task-026c-flat-editor-improvements
  - task-026d-tui-visual-overhaul
  - task-026e-tui-preview-bug
dependencies:
---

## Description

<!-- DESCRIPTION:BEGIN -->

A second round of UI polish for the redesigned Powerline Studio. The first redesign (task-023) replaced the sidebar-tabbed layout with a single-page vertical flow. This pass focuses on compactness, alignment, and visual cohesion — making the page feel tighter and more professional.

Key themes:

- **Compact controls**: Replace card grids and large sections with grouped selects and inline buttons for presets, style, and theme selection
- **Page shell refinements**: Non-sticky header aligned with body, sticky preview, terminal config as dropdown menu, fix double scrollbar
- **Flat layout editor**: Show all lines at once, fix z-index hover issues, compact popover forms
- **TUI layout editor**: Seamless title/grid/footer area, column labels with guidelines, condensed row actions and template strings
- **Bug fix**: TUI preview not updating on style switch without page reload

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Items by subtask

**026a: Page shell — header, preview, scrolling**

1. Header: align "Powerline Studio" text with the `max-w-4xl` body container, not full-width. Remove sticky behavior (header scrolls away).
2. Terminal config: move the settings button from header into the preview component's right side (next to cols badge). Tooltip: "Configure terminal preview". Opens a dropdown menu (not a collapsible row) with all 8 preview control options.
3. Preview: make sticky so it follows at the top when scrolling (can go over header). Use `sticky top-0 z-30` or similar.
4. Fix double scrollbar: the `overflow-y-auto` on the content wrapper creates a nested scrollbar inside the `overflow-hidden` layout wrapper. Remove the inner scrollbar so only the page-level scroll exists.

**026b: Compact presets and style/theme selects** 4. Presets: replace card grid with two buttons: [Choose Preset] and [Import Config]. "Choose Preset" opens a custom Select with grouped options — "Statusline Mode" group (Compact, Standard, Full) and "TUI Mode" group (Compact, Standard, Full). 5. Style & Theme: replace card grid and theme grid with two Select dropdowns. Style select has inline visual previews per option. Theme select has color swatch previews per option. Both selects can be large to accommodate previews. Below the selects: "Customize Theme" and "Create Custom Theme" buttons that open the existing theme editors.

**026c: Flat layout editor improvements** 6. Show all lines vertically at once (no line switcher). Each line gets its own flex row with "Add Segment" button and line label. 7. Segment chip hover: z-index issue where border gets overlayed by adjacent segment. Hovered chip needs higher z-index. 8. Segment config popover: labels on left, inputs on right (horizontal layout). Use small variants of inputs. Overflowed content gets a scrollbar. Style scrollbars thin and themed.

**026d: TUI layout editor visual overhaul** 11. Connect title bar, grid area, and footer into one seamless bordered area — no gap between them, shared border radius (title gets top corners, footer gets bottom corners, grid has no border radius). 12. Column alignment: add column labels (Col 1, Col 2, etc.) above grid. Add subtle dashed vertical guidelines behind grid content (very low contrast, below cell content). Account for row action buttons offset. 13. Row actions: condense from 4 vertical buttons to a 2×2 grid (up + add on top row, down + remove on bottom row). 14. Title/footer template strings: condense display with smaller font, truncated text, or abbreviated format so long templates fit on screen.

**026e: Bug fix** 10. Switching to TUI mode doesn't update the preview until a full page refresh.

### Acceptance Criteria

- No double scrollbar on the page
- Header scrolls away, preview sticks
- Presets section is a single row with two buttons
- Style/Theme section is two selects with inline previews
- All config lines visible simultaneously in flat mode
- Segment chips don't overlap on hover
- Segment config popovers don't overflow
- TUI title/grid/footer visually connected as one unit
- TUI column labels visible and aligned with grid content
- TUI row actions take half the vertical space
- Switching to TUI mode updates the preview immediately

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

### Architecture Approach

All subtasks modify existing components — no new component creation needed. The changes are primarily template/CSS with some minor store adjustments.

### Subtask Breakdown

| Subtask                | Scope                                              | Key Files                                                                                     |
| ---------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 026a: Page shell       | Header, preview sticky, config dropdown, scrollbar | `(home).vue`, `default.vue`, `StudioHeader.vue`, `TerminalPreview.vue`, `PreviewControls.vue` |
| 026b: Compact controls | Preset/style/theme selects                         | `PresetSection.vue`, `StyleThemeSection.vue`                                                  |
| 026c: Flat editor      | All lines visible, z-index, popover layout         | `FlatLayoutEditor.vue`, `SegmentChip.vue`, `SegmentConfigPopover.vue`, `LineSelector.vue`     |
| 026d: TUI visual       | Seamless areas, columns, row actions, templates    | `TuiLayoutEditor.vue`, `TuiGridVisual.vue`                                                    |
| 026e: TUI bug          | Preview update on style switch                     | `useRenderer.ts` or `config.ts`                                                               |

**Context Manifest:**

### How This Currently Works: Page Layout and Scrolling

`default.vue` wraps the app in `h-svh flex flex-col overflow-hidden`. `(home).vue` is `flex h-full flex-col` with two children: `StudioHeader` (shrink-0) and a scrollable `div.flex-1.overflow-y-auto` containing everything. The terminal preview is inside this scrollable div (NOT sticky). Below the preview, a `max-w-4xl mx-auto px-4 py-6` container holds sections separated by `gap-8`.

### How This Currently Works: Preview Controls

`PreviewControls.vue` renders as a flex-wrap row with 8 control groups (Width, Reserved, Color, Charset, Font Size, Line Height, Font, Terminal theme). Currently shown inside a `Collapsible` below the preview, toggled by a button in `StudioHeader`.

### How This Currently Works: Presets

`PresetSection.vue` has two `grid-cols-3` card grids for flat and TUI presets, plus an Import Config dialog button. Each card is a button with name + description.

### How This Currently Works: Style/Theme

`StyleThemeSection.vue` uses `RadioGroupRoot` with `grid-cols-4` of `StyleCard` components (each with a mini Nerd Font preview). Below: padding/auto-wrap controls for non-TUI, or TUI info Alert. Then `ThemeGrid`, optional `CustomThemeEditor`, and `ThemeOverrides`.

### How This Currently Works: Flat Layout Editor

`FlatLayoutEditor.vue` uses `LineSelector` for switching between lines (shows "Line N of M" with prev/next/add/remove). Segment chips are in a flex-wrap container inside a bordered card. Each chip wrapped in `SegmentConfigPopover`.

### How This Currently Works: TUI Layout Editor

`TuiLayoutEditor.vue` structure: breakpoint switcher → validation errors → title bar (rounded-t-lg button with Popover) → TuiGridVisual → footer bar (rounded-b-lg button with Popover) → Column Settings collapsible → TUI Options collapsible. Title and footer are separate elements with their own borders and gaps between them and the grid.

### How This Currently Works: TUI Grid Visual

`TuiGridVisual.vue` renders a CSS grid with column header buttons (clickable for settings) and data rows. Row actions appear on hover: 4 vertical icon buttons (up, down, insert, remove) in a `flex-col gap-0.5 opacity-0 group-hover:opacity-100` container. Column headers show size labels (auto, 1fr, etc.). Grid cells use `gridTemplateColumns` from column defs.

### How This Currently Works: Rendering Pipeline

`useRenderer.ts` watches 14 reactive sources with `useDebounceFn(render, 150)`. Watch sources include `configStore.config` (deep watch). The render branches on `config.display.style`. TUI path calls `renderTuiPanel`. Non-TUI iterates lines and segments via `SegmentRenderer`.

### Available UI Components

- `dropdown-menu/` — full menu with items, separators, labels, groups (NOT currently used, ideal for preview controls)
- `select/` — custom select with groups and items (used in PreviewControls, TuiGridVisual)
- `tooltip/` — tooltip with trigger/content (used in TuiLayoutEditor)
- `popover/` — heavily used throughout
- `scroll-area/` — custom scrollbar container

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] task-026a: Page shell — header alignment, sticky preview, config dropdown, fix scrollbar
- [ ] task-026b: Compact controls — preset buttons with select, style/theme selects with previews
- [ ] task-026c: Flat editor — all lines visible, z-index fix, compact popover forms
- [ ] task-026d: TUI visual — seamless areas, column labels/guidelines, condensed row actions, template strings
- [ ] task-026e: Bug fix — TUI preview not updating on style switch

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Key decisions:**

- Preview controls become a DropdownMenu rather than a collapsible row — more compact and accessible from the preview itself
- Style/Theme use Select components with rich option rendering (inline previews/swatches) rather than card grids
- TUI title/grid/footer merge into one visual unit by removing gaps and sharing border radius
- Column guidelines are purely decorative (dashed lines, very low contrast) — they sit behind cell content via z-index

**Related Tasks:**

- task-023-redesign-studio-ui — the first redesign pass this builds on
- task-024-tui-breakpoint-reserved-space — TUI breakpoint bug (separate)
- task-025-tui-fitcontent-truncation — TUI truncation bug (separate)

<!-- NOTES:END -->
