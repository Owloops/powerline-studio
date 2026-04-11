---
id: task-013-segment-hitboxes
title: Implement segment overlay hitbox system for clickable preview
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
  - task-010
  - task-011
---

## Description

<!-- DESCRIPTION:BEGIN -->

The terminal preview (task-011) renders the powerline statusline as styled HTML inside a monospace `<pre>`. Users need to click on individual segments in this preview to select them for editing. This task creates an invisible overlay system that maps pixel regions of the rendered output back to segment names.

The overlay works differently for the two rendering modes:

**Powerline/capsule/minimal mode:** The rendering service (task-010) produces a flat ANSI string per line. Before converting to HTML, we walk the rendered `RenderedSegment[]` array and compute each segment's character start position and width (including padding, separator arrows, capsule caps, and inter-capsule spaces). These positions become invisible `<div>` hitboxes layered over the preview using CSS `ch` units for pixel-perfect alignment on the monospace grid.

**TUI mode:** The TUI renderer produces a grid-based box layout. The grid system already tracks which segment name occupies each cell via the `GridCell` matrix and `resolvedData` map. We extract this mapping (row index, column start, column span, segment name) from the grid result and position hitbox overlays over the corresponding rows and columns of the rendered output.

When a user hovers a hitbox, a subtle highlight fades in over the segment. When they click, the corresponding segment is selected in `useEditorStore` and the sidebar navigates to the Segments panel.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Segment Position Calculation

- **Non-TUI styles:** After rendering the `RenderedSegment[]` array via `buildLineFromSegments`, compute each segment's character offset and visible width. The width calculation must account for:
  - Padding: `config.display.padding ?? 1` spaces on each side of the segment text
  - Powerline style: 1-char right arrow separator per segment = `padding*2 + textWidth + 1`
  - Capsule style: 1-char left cap + padding + text + padding + 1-char right cap + 1-char space between capsules (except first) = `(isFirst ? 0 : 1) + 2 + padding*2 + textWidth`
  - Minimal style: padding + text + padding only — NO separator. The `right` symbol is `""` for minimal. Width = `padding*2 + textWidth`
  - **Important:** Do NOT use `PowerlineRenderer.calculateSegmentWidth()` as the sole reference — it adds `1 + paddingWidth` for all non-capsule styles, which is wrong for minimal (where the right arrow is empty string). Compute widths from the actual `formatSegment` output behavior per style.
  - The ANSI reset prefix at the start of each line (invisible, but shifts nothing in visible space)
- **Multi-line layouts:** Each line is an independent row of segments. Position data includes both the output line index (0-based row in the rendered output) and the source line index (index into `config.display.lines[]`).
- **Auto-wrap:** When `autoWrap` is enabled, whole segments are moved to new output lines when they would exceed `terminalWidth`. Segments are never split mid-content. The auto-wrap logic pushes the entire next segment onto a new line. Track which output line each segment lands on.
- **TUI style:** Extract segment positions from the grid rendering result:
  - **Prerequisite:** An upstream PR to `claude-powerline` is needed. Rather than exporting the raw grid math helpers, modify `renderGrid` to return layout metadata in its result:
    ```ts
    export interface GridResult {
    	lines: string[]
    	panelWidth: number
    	matrix: GridCell[][] // final culled matrix (after lateResolve + re-cull)
    	colWidths: number[] // computed column widths
    }
    ```
    Also export the `GridCell` type from `browser.ts`. This avoids duplicating the complex two-phase orchestration (lateResolve pass + post-lateResolve re-cull) that happens inside `renderGrid`.
  - Read the returned `matrix` and `colWidths` directly from the TUI render result
  - Map content rows to output line indices (skip title bar row, divider rows)
  - Compute `charStart` and `charWidth` from column widths, separator width, and box border/padding offsets (1 box char + 1 space padding = 2 chars from left edge)
  - Handle column spans (`spanSize > 1`) using `spanCellWidth` calculation
  - **Segment name normalization:** TUI uses different names than the config segment types. Map `dir` → `directory`, strip part suffixes (`context.bar` → `context`, `block.bar` → `block`, `weekly.bar` → `weekly`), and handle user-defined template keys. Define an explicit `TUI_NAME_TO_SEGMENT_TYPE` mapping table.
  - TUI template areas and title/footer tokens are non-interactive (not clickable) — only segment content cells get hitboxes

### Rendering Service Integration (task-010 contract)

- `useRenderer` (task-010) must expose segment position metadata alongside the HTML output. Define a `SegmentHitbox` type:
  ```ts
  interface SegmentHitbox {
  	segmentType: string // config-level name: 'directory', 'git', 'session', etc. (normalized from TUI names)
  	line: number // 0-based output line index (row in the rendered HTML)
  	charStart: number // character offset from left edge of text content
  	charWidth: number // visible width in characters
  	sourceLineIndex: number // index into config.display.lines[] (for multi-line click context; 0 for TUI)
  }
  ```
- `usePreviewStore` stores `segmentHitboxes: SegmentHitbox[]` updated on every re-render.

### Segment Name Normalization

- TUI grid cells use short names (`dir`, `model`, `session`, etc.) while config segment types use full names (`directory`, `model`, `session`, etc.). Define a mapping:
  ```ts
  const TUI_NAME_TO_SEGMENT_TYPE: Record<string, string> = {
  	dir: 'directory',
  	// All others map 1:1: model, git, session, block, today, context, metrics, tmux, version, env, weekly
  }
  ```
- Part suffixes (e.g. `context.bar`, `block.bar`, `weekly.bar`, `session.icon`) map to their parent segment by stripping everything after the first `.`
- User-defined template keys (from `gridConfig.segments`) are non-interactive — skip hitboxes for them. Use `VALID_SEGMENT_NAMES` (already exported from `browser.ts`) to filter: after stripping suffixes, check `VALID_SEGMENT_NAMES.has(baseName)` to distinguish real segments from user-defined template keys
- The `SegmentHitbox.segmentType` must always use the config-level name (e.g. `directory`, not `dir`) so `editorStore.selectSegment()` works correctly

### Overlay Component

- `SegmentOverlay.vue` renders inside the `TerminalPreview.vue` component, positioned over the text content area.
- **Coordinate anchoring:** The overlay container must share the same coordinate origin as the text content inside the `<pre>`. Do NOT position relative to the outer `<pre>` element (which has `px-4 py-3` padding from task-011). Instead, wrap the `<pre>` text content and the overlay in a shared inner container with `position: relative`, so `ch` units align to the text origin.
- For each `SegmentHitbox`, render an invisible `<div>` with:
  - `position: absolute`
  - `left` set using `ch` units: `${hitbox.charStart}ch`
  - `width` set using `ch` units: `${hitbox.charWidth}ch`
  - `top` using `em` units: `${hitbox.line}em` (task-011 sets `leading-none` / line-height: 1)
  - `height: 1em`
  - `cursor: pointer`
  - `z-index` above the `<pre>` content
- **DOM structure:** The overlay must be a sibling of the `v-html` output, not a child. `v-html` replaces innerHTML, so a child component would be destroyed. Both the `v-html` div and `SegmentOverlay` share a `position: relative` parent inside the `<pre>` padding.
- The overlay must live inside the scroll container so it scrolls with the preview content horizontally

### Hover Effect

- On hover, show a semi-transparent highlight (e.g. `bg-white/10` or `bg-primary/10`) with a subtle border or outline.
- Use CSS transitions: instant on hover (0ms), 150ms fade-out on leave.
- Respect `prefers-reduced-motion`: use opacity-only fallback (no transform).
- Animate using `opacity` and optionally `background-color` — no layout-triggering properties.

### Click Behavior

- On click, call `editorStore.selectSegment(segmentType, sourceLineIndex)` which:
  - Sets `selectedSegment` to the clicked segment's config-level type name
  - Sets `activePanel` to `'segments'`
  - Sets `activeLineIndex` to the source line index (index into `config.display.lines[]`) so the segment list shows the correct line's segments
- For TUI segment parts (e.g. `context.bar`, `block.bar`), map to the parent segment name (e.g. `context`, `block`) using the normalization table.
- For TUI mode, `activeLineIndex` is not applicable (TUI uses a single grid, not multi-line) — set to `0` or leave unchanged.

### Synchronization

- Hitbox positions are derived reactively from the same render pass that produces the HTML. They update automatically when config or mock data changes.
- No separate recalculation needed — positions are computed during the render pipeline and stored in the preview store.

### Acceptance Criteria

- Hovering any segment in the preview shows a visible highlight over exactly that segment's area
- Clicking any segment in the preview selects it in the editor store and opens the Segments sidebar panel
- Overlay positions are accurate within 1 character for all 4 styles (powerline, capsule, minimal, tui)
- Overlay stays in sync when terminal width, config, or mock data changes
- Works correctly with multi-line layouts (multiple `display.lines`)
- Works correctly with auto-wrap enabled
- Works correctly with TUI grid layouts including multi-column spans
- No visual artifacts when scrolling the preview horizontally
- Hover animation respects `prefers-reduced-motion`

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**

The overlay system has three layers:

1. **Hitbox generation inside the render pipeline** — Non-TUI hitboxes are computed directly inside `useRenderer.ts` during the segment assembly loop. The renderer already iterates segments, calculates widths, and handles auto-wrap — generating `SegmentHitbox[]` is a natural byproduct with zero duplication. For TUI, hitboxes are derived from the `matrix` and `colWidths` returned by `renderGrid` (after the upstream PR). A small helper module (`segmentHitboxes.ts`) contains the width formulas and TUI mapping logic, called from `useRenderer`.

2. **Overlay component** (`SegmentOverlay.vue`) — reads `segmentHitboxes` from `usePreviewStore` and renders positioned `<div>` elements as siblings to the `v-html` output (not children — `v-html` replaces innerHTML).

3. **Store integration** — `useEditorStore` already has `selectedSegment`, `activePanel`, and `activeLineIndex` state (from task-009). The overlay dispatches actions to these.

**Position Calculation Strategy:**

For non-TUI styles, compute widths per style during the `useRenderer` assembly loop:

```
powerline:  [padding][text][padding][arrow]  = padding*2 + textWidth + 1
capsule:    [space?][leftCap][padding][text][padding][rightCap] = (isFirst ? 0 : 1) + 2 + padding*2 + textWidth
minimal:    [padding][text][padding]  = padding*2 + textWidth
```

As the renderer walks the `RenderedSegment[]` array for each line, it accumulates `charStart` from prior segment widths and pushes a `SegmentHitbox` per segment. When auto-wrap triggers, the output line index increments and `charStart` resets to 0.

For TUI style, the upstream `renderGrid` will return the final culled `GridCell[][]` matrix and `colWidths[]`. Map each content row to its output line index (offset by title bar row, divider rows). For each span-start cell, compute `charStart = 2 (border + padding) + sum(colWidths[0..col-1]) + col * separatorWidth` and `charWidth` from the span cell width calculation.

**DOM Structure (critical for v-html compatibility):**

`v-html` replaces the innerHTML of its host element, so the overlay component CANNOT be a child of the element with `v-html`. Use a sibling structure:

```html
<pre class="px-4 py-3 ...">
  <div class="relative">
    <div v-html="previewStore.htmlOutput" />
    <SegmentOverlay class="absolute inset-0" />
  </div>
</pre>
```

Both the `v-html` div and `SegmentOverlay` share the same `position: relative` parent, ensuring `ch` units align to the text origin (inside the `<pre>` padding).

**Vertical Positioning:**

Task-011 sets `leading-none` (line-height: 1) on the `<pre>`. Use `em` units for vertical positioning:

- `top: ${hitbox.line}em`
- `height: 1em`

This is more reliable than computing pixel heights and stays correct if font-size changes.

**Hover Animation:**

Use CSS transitions per the animations skill guidance:

- `transition: background-color 0ms, opacity 0ms` on hover-in (instant)
- `transition: background-color 150ms ease-out, opacity 150ms ease-out` on hover-out
- Background: `rgba(255, 255, 255, 0.08)` with `border-radius: 2px`
- No transforms, no layout properties

Alternatively, use Motion for Vue `<motion.div>` with opacity-based hover:

- `initial={{ opacity: 0 }}`
- Bind opacity to hover state via `useElementHover` from VueUse

Decision: prefer CSS transitions for this case (simpler, no spring needed, better perf with many hitbox elements).

**Key Files:**

- `src/lib/segmentHitboxes.ts` — width formulas, TUI mapping, `normalizeSegmentName()`, `SegmentHitbox` type
- `src/components/studio/SegmentOverlay.vue` — overlay hitbox component
- `src/stores/preview.ts` — (modify) add `segmentHitboxes` state
- `src/stores/editor.ts` — (modify) add `selectSegment()` action
- `src/composables/useRenderer.ts` — (modify) generate hitboxes during render assembly loop
- `src/components/studio/TerminalPreview.vue` — (modify) restructure DOM for v-html + overlay siblings

**SegmentHitbox Type:**

```ts
interface SegmentHitbox {
	segmentType: string // config-level name, normalized from TUI names
	line: number // 0-based output line index
	charStart: number // character offset from left edge of text content
	charWidth: number // visible width in characters
	sourceLineIndex: number // index into config.display.lines[] (0 for TUI)
}
```

**TUI Name Normalization:**

```ts
import { VALID_SEGMENT_NAMES } from '@owloops/claude-powerline/browser'

const TUI_TO_CONFIG_SEGMENT: Record<string, string> = { dir: 'directory' }
// All other TUI names match config names 1:1

function normalizeSegmentName(tuiName: string): string | null {
	// Skip non-segment cells
	if (tuiName === '.' || tuiName === '---') return null
	// Strip part suffixes: 'context.bar' → 'context'
	const base = tuiName.includes('.') ? tuiName.split('.')[0] : tuiName
	// Filter out user-defined template keys — only real segments get hitboxes
	if (!VALID_SEGMENT_NAMES.has(base)) return null
	// Map TUI short names to config names
	return TUI_TO_CONFIG_SEGMENT[base] ?? base
}
```

**Patterns to Follow:**

- Vue `<script setup lang="ts">` with Composition API
- `useElementHover` from VueUse for hover state per hitbox element
- `shallowRef` for the hitboxes array (replaced wholesale on re-render, no deep reactivity needed)
- `computed` to derive hitbox positions from render output (no separate watchers)
- CSS `ch` units for monospace-precise positioning
- Tailwind CSS 4 for all styling (hover highlight classes)
- No `will-change` left permanently — only during active transitions if needed
- `@media (prefers-reduced-motion: reduce)` to disable transition timing

**Dependencies:**

- Tasks: task-010 (rendering service — provides RenderedSegment data and render pipeline), task-011 (terminal preview — provides the `<pre>` container to overlay)
- Libraries: VueUse (`useElementHover`), claude-powerline/browser (`visibleLength`, `SegmentData` type, TUI grid types)
- Skills: vue, animations, motion, vueuse-functions, vue-best-practices

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Create `src/lib/segmentHitboxes.ts` with:
  - [ ] `SegmentHitbox` type (with `sourceLineIndex` field)
  - [ ] `normalizeSegmentName()` helper using `VALID_SEGMENT_NAMES` and `TUI_TO_CONFIG_SEGMENT` mapping
  - [ ] Non-TUI width calculation functions per style:
    - [ ] Powerline: `padding*2 + textWidth + 1`
    - [ ] Capsule: `(isFirst ? 0 : 1) + 2 + padding*2 + textWidth`
    - [ ] Minimal: `padding*2 + textWidth` (no separator)
  - [ ] TUI hitbox extraction from `GridResult.matrix` and `GridResult.colWidths`
- [ ] Modify `useRenderer.ts` to generate hitboxes during the render assembly loop
  - [ ] Non-TUI: accumulate `charStart` as segments are assembled, push `SegmentHitbox` per segment
  - [ ] Track both output line index and source line index (`config.display.lines[]` index)
  - [ ] Handle auto-wrap: increment output line, reset `charStart` when a segment wraps
  - [ ] TUI: extract hitboxes from returned `matrix`/`colWidths` after `renderGrid` call
    - [ ] **Prerequisite:** upstream PR to add `matrix`/`colWidths` to `GridResult` and export `GridCell` type
    - [ ] Map content rows to output line indices (skip title bar, dividers)
    - [ ] Compute `charStart` = 2 (border + padding) + sum of prior column widths + prior separators
    - [ ] Handle column spans (`spanSize > 1`)
    - [ ] Apply `normalizeSegmentName()` — skip non-segment and user-defined template cells
  - [ ] Store resulting `SegmentHitbox[]` in `usePreviewStore`
- [ ] Modify `usePreviewStore` to include `segmentHitboxes: SegmentHitbox[]` (shallowRef)
- [ ] Modify `useEditorStore` to accept `selectSegment(segmentType, sourceLineIndex)` — sets `selectedSegment`, `activePanel = 'segments'`, and `activeLineIndex`
- [ ] Restructure `TerminalPreview.vue` DOM for v-html + overlay coexistence
  - [ ] Inside `<pre>` padding, create a `<div class="relative">` wrapper
  - [ ] Place `<div v-html="...">` as first child (text content)
  - [ ] Place `<SegmentOverlay>` as sibling with `class="absolute inset-0"`
  - [ ] Ensure the wrapper is inside the scroll container
- [ ] Create `SegmentOverlay.vue` component
  - [ ] Read `segmentHitboxes` from `usePreviewStore`
  - [ ] Render positioned `<div>` per hitbox: `left` in `ch`, `width` in `ch`, `top` in `em`, `height: 1em`
  - [ ] Apply `cursor-pointer` and transparent background
- [ ] Implement hover highlight effect with CSS transitions
  - [ ] Instant-on (0ms) background highlight on hover
  - [ ] 150ms ease-out fade on hover-out
  - [ ] Use `bg-white/8 dark:bg-white/10` or similar subtle highlight
  - [ ] Respect `prefers-reduced-motion`
- [ ] Implement click handler
  - [ ] Call `editorStore.selectSegment(segmentType, sourceLineIndex)` on click
  - [ ] Pass normalized segment type and source line index
- [ ] Verify overlay accuracy for all 4 styles with various configs

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Key Rendering Pipeline Insights:**

- `PowerlineRenderer.calculateSegmentWidth()` (powerline.ts:363-379) is a useful reference but **NOT authoritative for minimal style**. It always adds `1 + paddingWidth` for all non-capsule styles, but in minimal mode the `right` symbol is `""` (empty), so the actual visible output from `formatSegment()` is 1 character narrower than `calculateSegmentWidth` reports. The spec formulas in this task are the correct source of truth.
- `buildLineFromSegments()` (powerline.ts:381-409) prepends a reset code and optionally inserts inter-capsule spaces. The reset has zero visible width.
- `visibleLength()` (terminal.ts:9-11) strips ANSI codes then returns `.length`. This is the canonical width measure.
- Auto-wrap (powerline.ts:256-275) moves **whole segments** to new output lines — it never splits a segment mid-content. The hitbox model can therefore assume one hitbox per segment (no multi-box segments).
- For TUI, `renderGrid()` (grid.ts:475-632) produces `GridResult { lines, panelWidth }`. The `GridCell[][]` matrix, `colWidths[]`, and content structure are computed internally.

**Upstream Prerequisite — TUI Grid Metadata:**

The `renderGrid` function currently returns only `{ lines, panelWidth }`. The `GridCell[][]` matrix and `colWidths[]` are computed internally and discarded. An upstream PR to `claude-powerline` is needed to:

1. Extend `GridResult` to include `matrix: GridCell[][]` and `colWidths: number[]` (the final post-lateResolve, post-re-cull versions)
2. Export the `GridCell` type from `browser.ts`

This is preferable to exporting the raw grid helpers (`parseAreas`, `cullMatrix`, etc.) because `renderGrid` has a complex two-phase orchestration — a `lateResolve` pass that re-resolves width-dependent segments, followed by a second `cullMatrix` pass for segments that resolved to empty. Duplicating this logic client-side would be fragile and prone to drift. Non-TUI hitbox implementation can proceed without this upstream change.

**v-html DOM Constraint:**

Vue's `v-html` directive replaces the innerHTML of its host element, which means any child Vue component inside that element would be destroyed. The overlay component MUST be a sibling of the `v-html` output, not a child. Both share a `position: relative` parent container.

**TUI Segment Naming:**

TUI uses `dir` (not `directory`), and segment parts like `context.bar`, `block.bar`, `weekly.bar`, plus user-defined template keys. All these need normalization before passing to `editorStore.selectSegment()`.

**Related Tasks:**

- task-010-rendering-service — must expose `RenderedSegment[]` arrays per line (not just final ANSI string) so position calculation has access to per-segment data
- task-011-terminal-preview — provides the `<pre>` container with padding; overlay must anchor to the inner text content area, not the padded outer element
- task-016-segment-list — depends on this task; clicking a segment in the preview should highlight it in the segment list
- task-018-multiline-support — depends on `activeLineIndex` being set correctly by hitbox clicks

<!-- NOTES:END -->
