---
id: task-024-tui-breakpoint-reserved-space
title: "Bug: TUI breakpoints don't account for reserved space"
status: 'To Do'
created_date: '2026-04-11 23:10'
updated_date: '2026-04-11 23:10'
parent: null
subtasks:
dependencies:
---

## Description

<!-- DESCRIPTION:BEGIN -->

TUI breakpoints currently trigger based on total terminal width (cols) without subtracting reserved space. This means if you have 120 cols with 45 reserved, a breakpoint set at minWidth 80 should hit when the available space is 75 cols, but instead it checks against 120. The breakpoint logic needs to compare against the effective available width (total cols minus reserved space), not the raw terminal width.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

- Breakpoint `minWidth` checks must subtract reserved space from total cols before comparison
- A breakpoint with `minWidth: 80` should activate when `(cols - reservedSpace) >= 80`, not when `cols >= 80`
- Existing breakpoint configurations should continue to work correctly after the fix
- Edge case: if reserved space exceeds total cols, breakpoints should behave as if available width is 0
<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**
Needs investigation to determine where the breakpoint evaluation occurs -- whether in the studio's rendering pipeline (`useRenderer.ts`) or in the upstream `@owloops/claude-powerline` renderer.

**Key Files:**

- `src/composables/useRenderer.ts` - Studio rendering pipeline, check if breakpoint logic lives here
- `@owloops/claude-powerline` - Upstream renderer, check TUI breakpoint evaluation

**Patterns to Follow:**
Follow existing breakpoint evaluation patterns; the fix should be a minimal change to the width value passed into or used during breakpoint comparison.

**Dependencies:**

- `@owloops/claude-powerline` - May require upstream fix if breakpoint logic is in the rendering engine

**Context Manifest:**
[Added by context-gathering agent]

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Investigate where TUI breakpoint evaluation occurs (studio vs upstream)
- [ ] Determine correct calculation: effective width = total cols - reserved space
- [ ] Apply fix in the appropriate location
- [ ] Test with various reserved space values and breakpoint thresholds
- [ ] Verify edge case when reserved space exceeds total cols
<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

This may be an upstream bug in the claude-powerline renderer, not in Powerline Studio itself. Needs investigation to determine if the fix belongs in the studio's rendering pipeline or in the @owloops/claude-powerline package.

<!-- NOTES:END -->
