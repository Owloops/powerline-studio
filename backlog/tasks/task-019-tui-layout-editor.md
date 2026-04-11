---
id: task-019-tui-layout-editor
title: Build TUI layout editor for breakpoints, grid areas, and columns
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
  - task-009
  - task-011
---

## Description

<!-- DESCRIPTION:BEGIN -->

The TUI style in claude-powerline uses a responsive CSS Grid-like layout system where segments are placed into named grid areas across breakpoints. Users currently hand-edit JSON arrays of space-separated area strings, column definitions, and alignment arrays -- error-prone and hard to visualize.

This task builds a visual TUI Layout editor panel (shown only when `style=tui` is selected) that lets users:

1. **Manage breakpoints** -- A list of responsive breakpoints, each with a `minWidth` threshold (terminal character width). Users can add, remove, and switch between breakpoints. The narrowest breakpoint (minWidth=0) is the base layout; wider breakpoints override it at larger terminal widths.

2. **Edit grid areas visually** -- For the selected breakpoint, a 2D grid of clickable cells where each cell shows a segment name. Users click a cell to pick a segment from a dropdown. Special values: `"."` for empty cells and `"---"` for horizontal divider rows. When adjacent cells in a row share the same segment name, they visually span into one merged cell (like CSS `grid-template-areas`).

3. **Configure columns** -- Each breakpoint has a list of column definitions: `"auto"` (size to content), `"1fr"` (flexible fill), or a fixed integer (character count). Adding/removing columns updates the grid width, and cells in each row must match the column count.

4. **Set per-column alignment** -- Optional left/center/right alignment per column, defaulting to left.

5. **Adjust global TUI options** -- `fitContent` toggle (shrink panel to content width), `minWidth`/`maxWidth` number inputs (character bounds), and `widthReserve` (characters reserved for the box border).

All changes flow through `useConfigStore` to update `config.display.tui` and trigger live terminal preview updates.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Visibility & Conditional Rendering

- Panel only rendered when `useConfigStore().config.display.style === 'tui'`
- Panel appears in the sidebar navigation and main panel area alongside other config sections

### Breakpoint Management

- Display a scrollable list of breakpoints sorted by `minWidth` ascending
- Each breakpoint shows its `minWidth` value as a Badge (e.g., "≥80 chars")
- "Add breakpoint" button creates a new breakpoint with a default `minWidth` (next 20-char increment above the highest existing breakpoint)
- Remove button on each breakpoint (disabled if only one breakpoint remains -- at least one is required per `validateGridConfig`)
- Clicking a breakpoint selects it and shows its grid/columns/alignment editors below
- Editing a breakpoint's `minWidth` validates: must be non-negative integer, must be unique across breakpoints
- Selected breakpoint tracked by stable ID (not array index) in component local state. Breakpoints get ephemeral `_id` fields assigned by the editor, stripped before export. This prevents selection drift when breakpoints re-sort after minWidth edits.

### Grid Area Editor (per breakpoint)

- Renders a 2D grid matching the breakpoint's `areas[]` rows x `columns[]` count
- Each cell displays its segment name (or "." for empty, "---" for divider)
- Clicking a cell opens a Select dropdown with options:
  - All 13 segment names derived from `SEGMENT_PARTS` keys (since `SEGMENT_NAME_LIST` is not exported from the browser entry; use `Object.keys(SEGMENT_PARTS)` instead): context, block, session, today, weekly, git, dir, model, version, tmux, metrics, activity, env
  - Segment part references (e.g., `session.cost`, `git.branch`) from `SEGMENT_PARTS`
  - `"."` (empty cell)
  - Custom segment template names from `config.display.tui.segments` keys
- Divider rows: a full-width row showing "---" with a distinct visual treatment (dashed border)
- Add row button (appends a new row of `"."` cells matching column count)
- Add divider row button (appends a `"---"` row)
- Remove row button per row
- **Column spanning**: When adjacent cells in a row have the same segment name, they render as a single merged cell spanning those columns. The merged cell shows the segment name once, centered.
- **Span editing semantics**: Clicking a merged (spanned) cell opens the segment picker and replaces ALL cells in the span. To split a span, the user assigns a different segment to an individual column position -- the editor provides small column-position indicators on hover over a spanned cell. This avoids needing a separate "split" action.
- **Extending a span**: Assigning the same segment name to an adjacent cell automatically merges it into the existing span (visual feedback: the cell "joins" the neighbor).
- Validation: segment names must be contiguous within a row (no gaps -- matches `validateGridConfig` rule). Show inline error if user creates non-contiguous spans.
- Validation: a segment name cannot appear on multiple rows (matches `validateGridConfig` rule). Disable already-used segments in other rows' dropdowns or show warning.

### Column Definition Editor (per breakpoint)

- Horizontal list of column definitions matching `columns[]`
- Each column shows a Select with options: `"auto"`, `"Nfr"` (reveals a number Input for the fr multiplier, defaulting to 1), or `"fixed"` (reveals a number Input for character count)
- "Add column" button: appends `"auto"` to columns array, adds `"."` cell to each area row, and if `align` array exists on this breakpoint, appends `"left"` to it (does NOT create `align` if absent -- upstream defaults to left when align is omitted)
- "Remove column" button per column (disabled if only one column): removes column definition, removes corresponding cell from each area row, and if `align` exists, removes corresponding entry
- Minimum 1 column (cannot remove the last one)
- Column definitions validated against pattern: `/^(\d+fr|\d+|auto)$/` (matches upstream validation -- supports any Nfr, not just 1fr)

### Per-Column Alignment (per breakpoint)

- Horizontal list of alignment selects, one per column
- Options: left (default), center, right
- Only shown when breakpoint has an `align` array defined
- Toggle to enable/disable alignment overrides (removes `align` array entirely when disabled)

### Global TUI Options

- `fitContent`: Switch toggle (boolean, default false)
- `minWidth`: NumberField input (positive integer, optional)
- `maxWidth`: NumberField input (positive integer, optional, must be ≥ minWidth if both set)
- `widthReserve`: NumberField input (non-negative integer, upstream default 45 when omitted -- show placeholder "45" when empty)
- Labels with tooltips explaining each option's effect on the TUI panel
- When `fitContent` is enabled, `widthReserve` is ignored by upstream rendering -- visually disable (gray out) the widthReserve input and show a tooltip explaining why

### Store Integration

- All mutations go through `useConfigStore` actions that update `config.display.tui`
- TUI config initialization: `ensureTuiConfig()` called by `setStyle('tui')` in the store, not by the panel component. This ensures `config.display.tui` is always defined before any panel or renderer accesses it.
- Breakpoint mutations: `addBreakpoint()`, `removeBreakpoint(bpIndex)`, `updateBreakpointMinWidth(bpIndex, minWidth)`
- Grid area mutations: `setAreaCell(bpIndex, rowIndex, colIndex, value)`, `setAreaSpan(bpIndex, rowIndex, startCol, endCol, value)`, `addAreaRow(bpIndex, type: 'cells' | 'divider')`, `removeAreaRow(bpIndex, rowIndex)`
- Column mutations: `addColumn(bpIndex)`, `removeColumn(bpIndex, colIndex)`, `setColumnDef(bpIndex, colIndex, value)`
- Alignment mutations: `setColumnAlign(bpIndex, colIndex, value)`, `toggleAlignOverrides(bpIndex, enabled)`
- Global TUI mutations: `setTuiOption(key, value)`

### Acceptance Criteria

- [ ] Panel only visible when style is "tui"
- [ ] Can add/remove/switch breakpoints with unique minWidth values
- [ ] Grid area editor renders correct rows x columns for selected breakpoint
- [ ] Clicking a cell opens segment picker; selection updates the grid
- [ ] Adjacent same-name cells render as merged/spanned cells
- [ ] Adding/removing columns updates both column defs and area rows in sync
- [ ] Per-column alignment can be toggled on/off and configured
- [ ] Global TUI options (fitContent, minWidth, maxWidth, widthReserve) are editable
- [ ] All changes trigger live preview re-render
- [ ] Validation prevents: duplicate minWidth, non-contiguous spans, multi-row segment reuse, invalid column defs
- [ ] Keyboard accessible: Tab through cells, Enter to open picker, Escape to close
- [ ] For merged spans: Tab focuses the span, Enter opens picker for whole span, Shift+Enter enters per-column selection mode (arrow keys navigate column positions within the span, Enter opens picker for that single column)
- [ ] Produced `config.display.tui` passes upstream `validateGridConfig()` at all times (round-trip validity)

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

### Architecture Overview

The TUI Layout editor is a composition of 5 focused components orchestrated by a root panel. The root panel manages which breakpoint is selected and delegates editing to specialized child components. All state mutations flow through `useConfigStore` actions -- children emit events or call store actions directly.

```
TuiLayoutPanel.vue (root -- conditional on style=tui)
├── TuiGlobalOptions.vue (fitContent, minWidth, maxWidth, widthReserve)
├── BreakpointManager.vue (list, add, remove, select breakpoints)
└── BreakpointEditor.vue (per-breakpoint, shown for selected breakpoint)
    ├── GridAreaEditor.vue (2D grid of clickable cells)
    │   └── GridCell.vue (individual cell with segment picker)
    ├── ColumnEditor.vue (column definitions list)
    └── AlignmentEditor.vue (per-column alignment selects)
```

### Component Responsibilities

**TuiLayoutPanel.vue** (`src/components/studio/panels/TuiLayoutPanel.vue`)

- Root orchestrator. Only rendered when `style === 'tui'`.
- Holds `selectedBreakpointId` as local `shallowRef<string>` tracking a stable ID assigned to each breakpoint (not array index, since breakpoints re-sort by minWidth). Each breakpoint gets an ephemeral `_id` field (crypto.randomUUID()) added by the editor layer, stripped on export.
- Reads `config.display.tui` from `useConfigStore()`.
- Relies on store-level `ensureTuiConfig()` (called by `setStyle('tui')`) to guarantee `config.display.tui` is defined before this panel renders. Default: one breakpoint at minWidth=0, 2 columns `["auto", "1fr"]`, one area row `[". ."]` (two empty cells matching column count). This satisfies upstream validation and avoids fragile panel-level initialization.
- Layout: Global options at top in a collapsible Card, then BreakpointManager as horizontal tabs, then BreakpointEditor below.

**TuiGlobalOptions.vue** (`src/components/studio/tui/TuiGlobalOptions.vue`)

- Props: none (reads from store directly via `useConfigStore`)
- Renders: Switch for `fitContent`, NumberField inputs for `minWidth`, `maxWidth`, `widthReserve`
- Each input calls store action `setTuiOption(key, value)` on change
- Uses shadcn-vue `Switch`, `Input` (with type=number), `Label`, `Tooltip`
- Compact horizontal layout with 2-column grid

**BreakpointManager.vue** (`src/components/studio/tui/BreakpointManager.vue`)

- Props: `breakpoints: TuiGridBreakpoint[]`, `selectedIndex: number`
- Emits: `select(index)`, `add()`, `remove(index)`
- Renders: Horizontal scrollable list of breakpoint tabs using shadcn-vue `Tabs`/`TabsList`/`TabsTrigger`
- Each tab shows `≥{minWidth}` with an inline editable minWidth (click-to-edit with Input)
- "+" button at end to add a breakpoint
- "×" remove button per tab (hidden when only 1 breakpoint)
- MinWidth editing: inline Input appears on double-click, validates on blur/Enter, reverts on Escape
- Sort order: tabs always sorted by minWidth ascending; after editing minWidth, re-sort and maintain selection

**BreakpointEditor.vue** (`src/components/studio/tui/BreakpointEditor.vue`)

- Props: `breakpointIndex: number`, `breakpoint: TuiGridBreakpoint`
- Composition surface: renders GridAreaEditor, ColumnEditor, AlignmentEditor vertically
- Passes the breakpoint data and index down to children

**GridAreaEditor.vue** (`src/components/studio/tui/GridAreaEditor.vue`)

- Props: `breakpointIndex: number`, `areas: string[]`, `columns: string[]`, `segments?: Record<string, SegmentTemplate>`
- Core visual component: renders areas as a CSS Grid matching the column count
- Parses each area row string into cells using space-splitting (same as `parseAreas` in upstream `grid.ts`)
- Detects column spans: adjacent cells with the same name merge into one visual cell using `grid-column: span N`
- Divider rows (`"---"`) render as a full-width cell with dashed border styling
- Each non-divider cell renders a `GridCell` sub-component
- Row controls: add row, add divider row, remove row (buttons in a toolbar below the grid)
- CSS Grid layout with `gap-1` between cells, monospace font for segment names
- Visual feedback: cells have `bg-muted` default, `bg-primary/10` when a segment is assigned, `border-dashed` for dividers
- Uses `computed` to derive the parsed cell matrix from `areas` prop

**GridCell.vue** (`src/components/studio/tui/GridCell.vue`)

- Props: `value: string`, `span: number`, `startCol: number`, `availableSegments: string[]`, `usedSegments: Set<string>`
- Emits: `update(newValue: string)`, `updateSingle(colIndex: number, newValue: string)` (for splitting spans)
- Renders: a styled div showing the segment name (or "." icon for empty)
- On click: opens a shadcn-vue `Popover` with a searchable segment picker. For spanned cells (span > 1), clicking replaces the entire span. To split, hover reveals small column-position indicators along the bottom edge; clicking one opens the picker for just that column position. Keyboard: Enter on a focused span opens whole-span picker; Shift+Enter enters per-column mode where arrow keys navigate column positions and Enter opens picker for the focused column.
- Segment picker: uses `Command` (cmdk-style) for fuzzy search across segment names, parts, and special values
- Segments already used in other rows are shown but disabled/grayed with "(used)" label
- Groups in picker: "Segments" (full segments), "Segment Parts" (e.g., session.cost), "Special" (`.` empty), "Templates" (custom segment templates)
- Selected value emits `update` (whole span) or `updateSingle` (single column) and closes popover
- Visual states: empty (dashed border, muted), assigned (solid border, tinted bg), hovered (ring highlight)
- Animation: fade+scale(0.97) on popover open (200ms ease-out), per animation skill rules

**ColumnEditor.vue** (`src/components/studio/tui/ColumnEditor.vue`)

- Props: `breakpointIndex: number`, `columns: string[]`
- Renders: horizontal list of column badges/pills
- Each column is a small card showing the column type with a Select dropdown: options are "auto", "Nfr" (flexible, with editable N defaulting to 1), or "fixed" (fixed char width, with editable number). Supports arbitrary fr multipliers (2fr, 3fr, etc.) for full round-trip compatibility with upstream configs.
- Add column button (+ icon) at end
- Remove column button (× icon) per column, hidden when only 1 column
- Changes call store actions which also sync area rows (add/remove trailing cells)

**AlignmentEditor.vue** (`src/components/studio/tui/AlignmentEditor.vue`)

- Props: `breakpointIndex: number`, `align?: AlignValue[]`, `columnCount: number`
- Renders: toggle to enable alignment overrides, then a row of Select dropdowns per column
- Options per select: left, center, right (using icon indicators: align-left, align-center, align-right from Lucide)
- When toggled off, removes the `align` array from the breakpoint
- When toggled on, initializes with `["left", ...]` for each column

### shadcn-vue Components Required

Already installed: Button, Card, Input, Badge, Switch, Tabs, Label, Separator, Toggle, ToggleGroup

Need to install:

- **Select** -- for column type picker and alignment picker
- **Popover** -- for grid cell segment picker
- **Tooltip** -- for option help text
- **NumberField** -- for minWidth, maxWidth, widthReserve inputs
- **Command** -- for searchable segment picker within popover

Install command: `pnpm dlx shadcn-vue@latest add select popover tooltip number-field command`

### Data Flow

```
useConfigStore.config.display.tui (source of truth)
    │
    ├─→ TuiLayoutPanel reads tui config
    │   ├─→ TuiGlobalOptions reads/writes global tui options
    │   ├─→ BreakpointManager reads breakpoints[], emits select/add/remove
    │   └─→ BreakpointEditor reads selected breakpoint
    │       ├─→ GridAreaEditor reads areas[], columns[]
    │       │   └─→ GridCell reads cell value, emits update
    │       ├─→ ColumnEditor reads/writes columns[]
    │       └─→ AlignmentEditor reads/writes align[]
    │
    └─→ All writes go through useConfigStore actions
        └─→ Triggers usePreviewStore re-render
```

### Store Actions (added to useConfigStore in task-009)

```ts
// Note: bpIndex refers to the array index in config.display.tui.breakpoints[]
// The editor layer maps stable breakpoint _ids to array indices internally

// TUI global options
setTuiOption(key: 'fitContent' | 'minWidth' | 'maxWidth' | 'widthReserve', value: number | boolean | undefined): void

// Breakpoint management
addBreakpoint(): void                    // adds with next available minWidth, returns new breakpoint
removeBreakpoint(bpIndex: number): void  // removes if >1 breakpoints exist
updateBreakpointMinWidth(bpIndex: number, minWidth: number): void

// Grid area mutations
setAreaCell(bpIndex: number, rowIndex: number, colIndex: number, value: string): void
setAreaSpan(bpIndex: number, rowIndex: number, startCol: number, endCol: number, value: string): void  // set range of cells (for merged cell editing)
addAreaRow(bpIndex: number, type: 'cells' | 'divider'): void
removeAreaRow(bpIndex: number, rowIndex: number): void

// Column mutations
addColumn(bpIndex: number): void         // adds "auto" column + "." to each non-divider row + "left" to align (only if align exists)
removeColumn(bpIndex: number, colIndex: number): void  // removes column + syncs rows + align
setColumnDef(bpIndex: number, colIndex: number, value: string): void

// Alignment mutations
setColumnAlign(bpIndex: number, colIndex: number, value: AlignValue): void
toggleAlignOverrides(bpIndex: number, enabled: boolean): void
```

### Grid Cell Parsing Logic

Reuse the same parsing approach as upstream `parseAreas()` from `grid.ts`:

```ts
// Derive parsed grid from areas strings
const parsedGrid = computed(() => {
	return props.areas.map((row) => {
		const trimmed = row.trim()
		if (trimmed === '---') return [{ segment: '---', span: props.columns.length }]
		const cells = trimmed.split(/\s+/)
		const merged: { segment: string; span: number }[] = []
		let i = 0
		while (i < cells.length) {
			const name = cells[i]!
			let span = 1
			while (i + span < cells.length && cells[i + span] === name) span++
			merged.push({ segment: name, span })
			i += span
		}
		return merged
	})
})
```

When a cell value is updated, reconstruct the area row string from individual cells and write back via store action.

### Validation Strategy

Client-side validation mirrors `validateGridConfig()` from upstream `loader.ts`:

1. **minWidth uniqueness**: Check on edit, show inline error on the breakpoint tab
2. **Column definition format**: Validate against `/^(\d+fr|\d+|auto)$/` on change
3. **Contiguous spans**: After cell update, check that same-name cells are adjacent. Show red border on non-contiguous cells.
4. **Cross-row segment uniqueness**: Track used segments across rows. Disable in picker, warn on violation.
5. **Column-row sync**: Areas row cell count must match columns length. Enforced structurally (add/remove column updates all rows).

Create a composable `useTuiValidation(tuiConfig: TuiGridConfig)` that accepts the full TUI config (not just one breakpoint) and returns computed validation state with per-breakpoint and per-cell error messages. This is necessary because some rules (duplicate minWidth, global minWidth/maxWidth consistency) span across breakpoints.

### Animation & Interaction Details

Following the animation skill rules:

- **Cell hover**: `ring-2 ring-primary/30` with 0ms on (instant), 150ms transition off
- **Cell click (popover open)**: popover enters with `opacity: 0, scale: 0.96` -> `opacity: 1, scale: 1` at 200ms ease-out
- **Popover exit**: 150ms ease-in (faster than entrance per rule #4)
- **Add row**: new row fades in with `opacity: 0, y: 8px` -> `opacity: 1, y: 0` at 200ms ease-out
- **Remove row**: 150ms fade out (no motion, just opacity to avoid layout animation on mobile per rule #40)
- **Breakpoint tab switch**: content area cross-fades with 150ms (AnimatePresence mode="wait" equivalent via Vue `<Transition>`)
- **Reduced motion**: respect `prefers-reduced-motion` -- replace all motion with instant state changes

### Key Files

| File                                              | Purpose                                                        |
| ------------------------------------------------- | -------------------------------------------------------------- |
| `src/components/studio/panels/TuiLayoutPanel.vue` | Root TUI layout panel (conditional on style=tui)               |
| `src/components/studio/tui/TuiGlobalOptions.vue`  | fitContent, minWidth, maxWidth, widthReserve controls          |
| `src/components/studio/tui/BreakpointManager.vue` | Breakpoint tabs with add/remove/edit minWidth                  |
| `src/components/studio/tui/BreakpointEditor.vue`  | Per-breakpoint composition surface                             |
| `src/components/studio/tui/GridAreaEditor.vue`    | 2D visual grid of area cells                                   |
| `src/components/studio/tui/GridCell.vue`          | Individual cell with segment picker popover                    |
| `src/components/studio/tui/ColumnEditor.vue`      | Column definition editor                                       |
| `src/components/studio/tui/AlignmentEditor.vue`   | Per-column alignment editor                                    |
| `src/composables/useTuiValidation.ts`             | Validation composable for grid config rules                    |
| `src/types/tui.ts`                                | Re-exported/adapted types from claude-powerline for the editor |

### Dependencies

**Task dependencies:**

- task-009 (Pinia stores) -- `useConfigStore` must exist with TUI-related actions
- task-011 (preview) -- live preview must work to verify changes

**Package dependencies (already linked):**

- `@owloops/claude-powerline/browser` -- for `VALID_SEGMENT_NAMES`, `SEGMENT_PARTS`, `isValidSegmentRef` type imports (note: `SEGMENT_NAME_LIST` is not exported; derive segment names from `Object.keys(SEGMENT_PARTS)` instead)

**shadcn-vue components to install:**

- select, popover, tooltip, number-field, command

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

### Prerequisites

- [ ] Install shadcn-vue components: `pnpm dlx shadcn-vue@latest add select popover tooltip number-field command`
- [ ] Create `src/types/tui.ts` with re-exported types from claude-powerline (SegmentName, SEGMENT_PARTS, AlignValue, TuiGridBreakpoint, TuiGridConfig) or import directly from `@owloops/claude-powerline/browser`
- [ ] Add TUI store actions to `useConfigStore` (ensureTuiConfig, setTuiOption, addBreakpoint, removeBreakpoint, updateBreakpointMinWidth, setAreaCell, setAreaSpan, addAreaRow, removeAreaRow, addColumn, removeColumn, setColumnDef, setColumnAlign, toggleAlignOverrides). `ensureTuiConfig()` should be called as a side effect of `setStyle('tui')`.

### Core Components (build bottom-up)

- [ ] Create `src/composables/useTuiValidation.ts` -- validation composable accepting full `TuiGridConfig`, returning computed errors for minWidth uniqueness, contiguous spans, cross-row segment uniqueness, column def format, and global minWidth/maxWidth consistency
- [ ] Create `GridCell.vue` -- clickable cell with Popover + Command segment picker, handles segment selection, visual states (empty/assigned/error)
- [ ] Create `GridAreaEditor.vue` -- 2D CSS Grid rendering parsed area rows, column spanning logic, row add/remove/divider controls
- [ ] Create `ColumnEditor.vue` -- horizontal column definition list with Select (auto/1fr/custom) + add/remove buttons
- [ ] Create `AlignmentEditor.vue` -- alignment toggle + per-column Select (left/center/right) with Lucide alignment icons
- [ ] Create `BreakpointEditor.vue` -- composition surface assembling GridAreaEditor + ColumnEditor + AlignmentEditor for a single breakpoint
- [ ] Create `BreakpointManager.vue` -- horizontal Tabs for breakpoint switching, inline minWidth editing, add/remove buttons
- [ ] Create `TuiGlobalOptions.vue` -- Switch for fitContent, NumberField inputs for minWidth/maxWidth/widthReserve with Tooltip help text
- [ ] Create `TuiLayoutPanel.vue` -- root panel composing TuiGlobalOptions + BreakpointManager + BreakpointEditor, initializes default TUI config if undefined

### Integration & Polish

- [ ] Wire panel visibility: only show TuiLayoutPanel when style=tui in sidebar navigation
- [ ] Verify live preview updates when grid config changes
- [ ] Add transition animations: cell hover ring, popover enter/exit, row add/remove fade, breakpoint tab switch cross-fade
- [ ] Add `prefers-reduced-motion` handling (disable motion, keep state changes)
- [ ] Keyboard accessibility: Tab through cells, Enter to open picker, Escape to close, arrow keys in Command list
- [ ] Test edge cases: single column, single row, all empty cells, all divider rows, maximum columns/rows

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

### Scope Decision

This task creates ~10 files but they form a single cohesive panel with tight coupling. Splitting would create artificial boundaries between components that share the same data structures. Keeping as one task allows consistent implementation of the grid parsing/updating logic.

### Key Upstream References

- `claude-powerline/src/tui/types.ts` -- `TuiGridConfig`, `TuiGridBreakpoint`, `SegmentName`, `SEGMENT_PARTS`, `isValidSegmentRef`, `AlignValue`
- `claude-powerline/src/tui/grid.ts` -- `parseAreas()` for grid parsing, `selectBreakpoint()` for breakpoint selection logic
- `claude-powerline/src/config/loader.ts:254-396` -- `validateGridConfig()` for all validation rules to mirror client-side

### Review Feedback Applied (2026-04-11, Codex review)

- Fixed: column editor now supports arbitrary `Nfr` (not just `1fr`) for full round-trip of upstream configs
- Fixed: `addColumn` only appends to `align` if align array already exists (upstream defaults to left when omitted)
- Fixed: breakpoint selection uses stable ephemeral `_id` instead of array index to prevent selection drift on sort
- Fixed: merged cell editing semantics specified -- click replaces whole span, column-position indicators allow splitting
- Fixed: `widthReserve` placeholder shows upstream default of 45 (not 0); disabled when `fitContent` is on
- Fixed: default TUI init creates valid config with `[". ."]` area row matching 2 columns
- Dismissed: reviewer incorrectly claimed local Select/Popover/Tooltip wrappers exist -- verified they don't

### Review Feedback Applied (2026-04-11, copilot:codex review)

- Fixed: store API inconsistency between Spec and Design sections -- aligned to Design's action signatures
- Fixed: `SEGMENT_NAME_LIST` not exported from browser entry -- use `Object.keys(SEGMENT_PARTS)` instead
- Fixed: TUI config initialization moved from panel component to store-level `ensureTuiConfig()` called by `setStyle('tui')`
- Fixed: `useTuiValidation` composable now accepts full `TuiGridConfig` (not just one breakpoint) for cross-breakpoint rules
- Fixed: added keyboard interaction for span splitting (Shift+Enter enters per-column mode)
- Fixed: added round-trip validity acceptance criterion
- Dismissed: dependency chain (#1) -- task-008 and task-010 are transitive deps through task-009/011, already declared
- Dismissed: panel naming inconsistency (#2) -- cross-task issue, not in scope for task-019
- Dismissed: \_id leakage risk (#3) -- plan already says "stripped on export"; editor-layer ephemeral IDs are standard pattern
- Dismissed: sorting ownership (#4) -- already addressed via stable IDs and sort-on-display
- Dismissed: validation ownership ambiguity (#6) -- plan clearly specifies "warnings + disabled options" approach
- Dismissed: local component wrappers (#9) -- verified they don't exist in this repo

### UX Considerations

- The grid editor is the most complex interactive element in Powerline Studio. Use progressive disclosure: global options collapsed by default, alignment editor hidden until toggled on.
- Grid cell picker uses Command (cmdk) pattern for fast fuzzy search rather than a flat Select, since there are 13 segments + 50+ segment parts.
- Breakpoint tabs (not accordion) because users need to quickly compare layouts across breakpoints.

**Relevant Documentation:**

- backlog/designs/dsgn-001-powerline-studio.md -- Section 5: TUI Layout Editor feature spec

**Related Tasks:**

- task-009-pinia-stores -- Must add TUI-related store actions (this task defines the action signatures)
- task-011-terminal-preview -- Preview must work for live feedback during editing
- task-020-tui-accessories -- Depends on this task; covers box style, title/footer, separators, segment templates

<!-- NOTES:END -->
