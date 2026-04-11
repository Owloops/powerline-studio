---
id: task-025-tui-fitcontent-truncation
title: 'Bug: TUI segments truncated with ellipsis when fit-content is off'
status: 'To Do'
created_date: '2026-04-11 23:10'
updated_date: '2026-04-11 23:10'
parent: null
subtasks:
dependencies:
---

## Description

<!-- DESCRIPTION:BEGIN -->

In TUI mode with fitContent set to false, segments in the right/later columns don't get enough space and show truncated with ellipsis. For example, right-aligned items like token counts, time remaining, and percentages get cut off (e.g. "84.0K/200.…", "4h 18m le…"). The panel should allocate enough width for these segments to render fully, or the column sizing/auto logic should distribute space more fairly.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

- When `fitContent` is false, segments should not be truncated with ellipsis unless the total available width genuinely cannot fit all content
- Column width distribution should fairly allocate space across all columns, not starve right/later columns
- Right-aligned content like token counts, time remaining, and percentages must render fully when sufficient total width exists
- Auto-sized columns alongside fixed/fr columns should receive adequate minimum widths
<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**
Needs investigation into the TUI column width calculation logic. When `fitContent` is false, the renderer likely uses a different sizing strategy that doesn't properly distribute remaining space to auto-sized columns. The fix may involve adjusting how auto columns calculate their minimum width or how remaining space is distributed among columns.

**Key Files:**

- `src/composables/useRenderer.ts` - Studio rendering pipeline, check if column sizing is handled here
- `@owloops/claude-powerline` - Upstream TUI renderer, check column width calculation when fitContent is false

**Patterns to Follow:**
Follow existing column sizing patterns; the fix should ensure auto-sized columns get at least the width needed to render their content without truncation.

**Dependencies:**

- `@owloops/claude-powerline` - May require upstream fix if column width calculation is in the rendering engine

**Context Manifest:**
[Added by context-gathering agent]

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Investigate TUI column width calculation when fitContent is false
- [ ] Determine if the issue is in studio or upstream renderer
- [ ] Identify how auto-sized columns interact with fixed/fr columns in width distribution
- [ ] Apply fix to ensure fair space allocation
- [ ] Test with various column configurations (auto, fixed, fr combinations)
- [ ] Verify right-aligned segments render fully without ellipsis truncation
<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

This may be an upstream bug in the claude-powerline renderer. The TUI renderer may not be calculating column widths correctly when fitContent is false and there are auto-sized columns alongside fixed/fr columns. Needs investigation to determine if fix belongs in studio or upstream.

<!-- NOTES:END -->
