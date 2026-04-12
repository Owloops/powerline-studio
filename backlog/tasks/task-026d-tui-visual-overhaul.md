---
id: task-026d-tui-visual-overhaul
title: 'TUI layout editor: seamless areas, column labels, condensed actions and templates'
status: 'To Do'
created_date: '2026-04-12 14:35'
updated_date: '2026-04-12 14:35'
parent: task-026-ui-polish-v2
subtasks:
dependencies:
  - task-026a-page-shell
---

## Description

Visually overhaul the TUI layout editor: merge title bar, grid area, and footer into one seamless bordered unit. Add column labels and subtle dashed guidelines. Condense row action buttons from 4 vertical to 2×2. Condense title/footer template string display so long templates fit on screen.

## Specification

1. **Seamless title/grid/footer**: Currently the title bar, grid area, and footer are separate elements with their own borders and a gap between them. Merge them into one connected visual unit:
   - Use a single outer wrapper `div` with `rounded-lg border border-border overflow-hidden` that contains title, grid, and footer as children with no gap
   - Title bar: no own border/radius, separated from grid by `border-b border-border`
   - Grid area: no border, no radius — padding only
   - Footer: no own border/radius, separated from grid by `border-t border-border`
   - The title/footer trigger buttons currently have their own `rounded-t-lg`/`rounded-b-lg` and `border` classes — these must be removed. The `ring-1 ring-primary/30` focus/open styling on title/footer triggers should use `ring-inset` to avoid clipping against the parent's `overflow-hidden`.
   - No gap between them — they should appear as one continuous bordered card

2. **Column labels and guidelines**:
   - Merge column labels into the existing column header buttons (which are already clickable for editing column defs). Each button shows both "Col N" label and the current size value (e.g., "Col 1 · auto", "Col 2 · 1fr"). Do NOT add a separate label row — this preserves the existing column-editing affordance.
   - Column labels must align with actual grid columns (accounting for the row action buttons offset on the right)
   - Add subtle dashed vertical guidelines that span the full grid height. Since each data row is a separate grid container, pseudo-elements on header cells cannot span across them. Instead, use an absolutely positioned overlay `div` behind the rows area with `pointer-events-none` and matching `gridTemplateColumns`. Each overlay column cell renders a right `border-dashed border-border/15`. The overlay must sit below cell content via z-index.
   - Multi-column-span cells naturally cross these guidelines (guidelines are behind everything)

3. **Condensed row actions**: Currently 4 buttons stacked vertically (move up, move down, insert, remove). Change to a 2×2 grid layout:
   - Top row: move up, insert (add)
   - Bottom row: move down, remove (delete)
   - This halves the vertical space taken by row actions
   - Use a fixed-size `grid grid-cols-2 grid-rows-2` container so the layout never shifts. When move-up is hidden (first row) or move-down is hidden (last row), render an invisible placeholder (`visibility: hidden` or empty `div`) to keep the grid stable.

4. **Condensed template strings**: Title and footer template strings can be very long (e.g., `{activity.durationIcon} {activity.durationVal}  {activity.messagesIcon} {activity.messagesVal}`). Make them fit:
   - Use smaller font (`text-[11px]` or `text-xs`)
   - Split the preview into two independently truncating zones (left template and right template) separated by a fixed "..." divider, instead of one combined truncated string. This ensures both sides remain partially visible even when one is long.
   - Each zone gets `truncate min-w-0` within a `flex` container
   - Show full template in a tooltip on hover (tooltip shows both left and right values)
   - The clickable strip should show as much as possible without breaking layout

### Acceptance Criteria

- Title, grid, and footer form one seamless bordered unit (no gaps, shared border radius)
- Column labels (Col 1, Col 2, etc.) visible and aligned with grid columns
- Subtle dashed vertical guidelines visible behind grid cells
- Row actions in 2×2 layout (half the height)
- Long template strings truncated with tooltip showing full text
- All existing TUI editing functionality preserved

## Design

### Key Files

- `src/components/studio/editor/TuiLayoutEditor.vue` — restructure title/grid/footer layout, condense template display
- `src/components/studio/editor/TuiGridVisual.vue` — add column labels, dashed guidelines, condense row actions to 2×2

### Approach

- **Seamless unit**: Remove the gap between title, grid, and footer. Structure as one `rounded-lg border border-border overflow-hidden` container. Title gets `border-b` separator, footer gets `border-t` separator, grid sits between them borderless. Remove `rounded-t-lg border border-b-0` from title trigger and `rounded-b-lg border border-t-0` from footer trigger. Use `ring-inset` on focus/open ring styles to prevent clipping against the parent's `overflow-hidden`.
- **Column labels**: Merge into the existing column header buttons in TuiGridVisual. Each button currently shows just the size value (e.g., "auto", "1fr"). Prepend "Col {n} ·" so it reads "Col 1 · auto". Keep existing click-to-edit behavior. The row actions column offset needs an empty spacer on the right.
- **Dashed guidelines**: Use an absolutely positioned overlay `div` behind the rows area (inside TuiGridVisual). The overlay uses the same `gridTemplateColumns` as data rows. Each column cell renders a right `border-dashed border-border/15`. The overlay needs `pointer-events-none`, `absolute inset-0`, and a lower z-index than cell content. The rows area needs `relative` positioning to contain the overlay.
- **Row actions 2×2**: Change the actions container from `flex-col gap-0.5` to `grid grid-cols-2 grid-rows-2 gap-0.5`. Reorder: [up, insert] top row, [down, remove] bottom row. When move-up (first row) or move-down (last row) is hidden, use an invisible placeholder `div` to maintain the fixed 2×2 grid size and prevent layout shift.
- **Template condensing**: On the title/footer clickable strips, split the preview into two independently truncating zones (left and right) within a `flex min-w-0` layout, separated by a fixed "..." divider span. Each zone gets `truncate min-w-0`. Reduce font to `text-xs`. Wrap the entire strip in `Tooltip` showing both full template values on hover. Update the `titlePreview`/`footerPreview` computed values to return `{ left, right }` objects instead of concatenated strings.

## TODO

- [ ] Restructure TuiLayoutEditor: wrap title + grid + footer in one `rounded-lg border border-border overflow-hidden` container
- [ ] Remove individual borders/gaps/radii from title trigger and footer trigger buttons
- [ ] Use `ring-inset` on title/footer focus/open ring styles to prevent clipping
- [ ] Merge "Col N" labels into existing column header buttons in TuiGridVisual (e.g., "Col 1 · auto")
- [ ] Add absolutely positioned guideline overlay behind grid rows (`pointer-events-none`, matching `gridTemplateColumns`)
- [ ] Change row actions from `flex-col` to `grid grid-cols-2 grid-rows-2`; add invisible placeholders for missing move buttons
- [ ] Split title/footer preview into two independently truncating left/right zones with fixed "..." divider
- [ ] Update `titlePreview`/`footerPreview` computeds to return `{ left, right }` objects
- [ ] Wrap title/footer strips in Tooltip showing full template values
- [ ] Verify all TUI editing functionality preserved (popovers, column editing, add/remove rows/columns, first/last row actions)
