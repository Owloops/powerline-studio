---
id: task-018-multiline-support
title: Add multi-line segment support with line management
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
  - task-009
  - task-016
---

## Description

<!-- DESCRIPTION:BEGIN -->

claude-powerline supports multiple statusline lines — each line is an entry in the `display.lines[]` array, and each line has its own independent set of segments with its own ordering. Currently the segment editor (task-016) only shows segments for a single line. This task adds a line selector above the segment list so users can manage multiple lines visually.

The line selector appears as a horizontal tab bar above the segment list in the SegmentsPanel. Each line gets a numbered tab ("Line 1", "Line 2", etc.). Clicking a tab switches the segment list below to show that line's segments. An "Add Line" button at the end of the tab row creates a new line with a default segment set. Each line tab (except the first) shows a small "x" close button that triggers a confirmation dialog before removing the line.

When a new line is added, it starts with a minimal default segment set (directory + model enabled). When a line is removed, the selected line index adjusts — if the removed line was selected, selection moves to the previous line. The config store's `display.lines[]` array stays in sync with all line additions, removals, and the segment changes within each line.

The segment list (from task-016), drag-to-reorder, enable/disable toggles, and per-segment config panels (task-017) all operate on whichever line is currently selected. Task-016's segment list must always show all 13 segment rows regardless of how many keys are present in the line's `segments` object — it uses a canonical segment registry (the full list of 13 segment names) and synthesizes missing segment configs as `{ enabled: false }` for display purposes. This way sparse lines (like newly added ones) still show all segments in the editor with proper enable/disable toggles.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

**Line Selector UI:**

- Horizontal tab bar rendered above the segment list inside SegmentsPanel
- Each line tab displays "Line N" (1-indexed) with active state styling
- Active tab uses shadcn-vue Tabs component (already installed: `src/components/ui/tabs/`)
- "+" icon button at the end of the tab row to add a new line
- Each tab except the first has a sibling "x" close icon button next to it (NOT nested inside TabsTrigger — nesting interactive elements is invalid HTML)
- Maximum 5 lines enforced in both UI ("+" button disabled) and store (`addLine()` no-ops at limit)

**Add Line Behavior:**

- Creates a new `LineConfig` entry appended to `display.lines[]` in useConfigStore
- New line starts with a minimal default segment set: `{ directory: { enabled: true, style: 'basename' }, model: { enabled: true } }`
- Newly added line is auto-selected (activeLineIndex updates)
- Preview re-renders immediately with the new line

**Remove Line Behavior:**

- First line (index 0) cannot be removed — no "x" button shown
- Clicking "x" opens a confirmation Dialog (using the already-installed `src/components/ui/dialog/` components) with message: "Remove Line N? This will delete all segments configured for this line."
- On confirm: splices the line from `display.lines[]` in useConfigStore
- If removed line was selected, activeLineIndex decrements to the previous line (or stays at 0)
- If removed line was before the selected line, activeLineIndex decrements to maintain correct selection
- Preview re-renders immediately

**Store Integration:**

- `useEditorStore` already has `activeLineIndex: Ref<number>` (default 0) from task-009. This task uses it, no new state needed.
- `useConfigStore` already has `addLine()` and `removeLine(lineIndex)` from task-009. This task uses them.
- `addLine()` must enforce the 5-line maximum (no-op if `lines.length >= 5`), not just the UI button
- `removeLine()` must no-op if `index === 0` (first line protected) or out of bounds
- Existing segment mutations in useConfigStore already accept a `lineIndex` parameter (task-009 spec). No API changes needed.
- **Index clamping**: `activeLineIndex` must be clamped to valid bounds (`0` to `lines.length - 1`) whenever `display.lines` changes — not just on `removeLine()`, but also on `loadConfig()` and `$reset()`. Add a `watch` on `config.display.lines.length` in useEditorStore that clamps `activeLineIndex`.
- **Segment selection on line switch**: `selectedSegment` should be cleared when `activeLineIndex` changes, to prevent stale cross-line selection. Add a `watch` on `activeLineIndex` that calls `clearSelection()`.

**Segment List Integration:**

- SegmentsPanel reads `activeLineIndex` from useEditorStore
- Passes `lineIndex` to segment list, drag-to-reorder, and per-segment config
- All segment operations (enable/disable, reorder, expand) operate on `display.lines[activeLineIndex]`
- SegmentRow.vue and per-segment config components (task-017) must use `activeLineIndex` from useEditorStore when calling store mutations directly (e.g. `updateSegmentConfig(activeLineIndex, ...)`). If they already read it from the store centrally, no changes needed; but if they hardcode `lineIndex: 0`, they need updating.

**Live Preview:**

- Any change to lines (add, remove, segment changes within a line) triggers re-render via the existing reactive pipeline (useConfigStore → rendering service → usePreviewStore)

**Acceptance Criteria:**

- [ ] Tab bar shows one tab per line, first line always present
- [ ] Clicking a tab switches the segment list to show that line's segments
- [ ] All 13 segment rows shown for every line, even sparse ones (missing configs synthesized as disabled)
- [ ] "+" button adds a new line with default segments, auto-selects it
- [ ] "+" button disabled when 5 lines exist; `addLine()` also no-ops at 5
- [ ] "x" button on non-first tabs (as sibling, not nested) opens confirmation dialog, removes line on confirm
- [ ] Removing the selected line adjusts selection correctly (clamps to valid index)
- [ ] Removing a line before the selected line adjusts index to maintain correct selection
- [ ] `activeLineIndex` clamped on `loadConfig()` and `$reset()` (not just removeLine)
- [ ] `selectedSegment` cleared when switching lines
- [ ] Segment enable/disable, reorder, and config changes apply to the selected line only
- [ ] Preview updates live on all line operations
- [ ] Tab row handles narrow sidebar gracefully (horizontal scroll or truncation)

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**

The feature is split into two concerns: (1) a `LineSelector` component for the tab UI, and (2) store-level watchers for index clamping and selection clearing. The LineSelector is a focused component that sits inside SegmentsPanel above the segment list. It uses the shadcn-vue Tabs component for tab rendering and the existing Dialog component for delete confirmation.

The key architectural decision is how the segment list connects to lines. Rather than passing segments as props through multiple layers, the segment list reads `activeLineIndex` from useEditorStore and uses it to index into `useConfigStore().config.display.lines[activeLineIndex]`. This keeps the data flow simple — the LineSelector only manages line selection and line-level CRUD; the segment list already knows how to render segments, it just needs to read from the right line index.

**Component Design:**

```
SegmentsPanel.vue
├── LineSelector.vue          ← NEW: tab bar + add/remove line actions
│   ├── Tabs / TabsList / TabsTrigger  (shadcn-vue, already installed)
│   ├── Button (+ icon, x icon)        (shadcn-vue, already installed)
│   └── Dialog                          (shadcn-vue, already installed)
└── [segment list from task-016]       (reads activeLineIndex)
```

`LineSelector.vue` renders:

- A `<Tabs>` with `v-model` bound to `activeLineIndex` (converted to string for Tabs value)
- Inside `<TabsList>`, for each line: a wrapper `<div>` containing a `<TabsTrigger>` and (for non-first lines) a sibling close `<Button size="icon" variant="ghost">` with the X icon. The trigger and close button are siblings inside the wrapper — NOT nested — to avoid invalid HTML (interactive element inside interactive element).
- After the TabsList, a `<Button size="icon" variant="ghost">` with a Plus icon for adding lines (disabled when `lines.length >= 5`)
- A `<Dialog>` for removal confirmation, controlled by a local `lineToRemove: Ref<number | null>` state. When `lineToRemove` is non-null, the dialog opens showing "Remove Line N?" with Cancel and Remove buttons.

**Store Changes:**

Task-009 already defines `activeLineIndex` in useEditorStore and `addLine()`/`removeLine()` in useConfigStore. This task adds behavioral logic:

`useEditorStore` additions (watchers):

```ts
// Clamp activeLineIndex when lines array shrinks (removeLine, loadConfig, $reset)
const configStore = useConfigStore()
watch(
	() => configStore.config.display.lines.length,
	(len) => {
		if (activeLineIndex.value >= len) {
			activeLineIndex.value = Math.max(0, len - 1)
		}
	},
)

// Clear segment selection when switching lines
watch(activeLineIndex, () => {
	clearSelection()
})
```

`useConfigStore` updates — ensure `addLine()` enforces the 5-line max:

```ts
function addLine() {
	if (config.value.display.lines.length >= 5) return
	config.value.display.lines.push({
		segments: {
			directory: { enabled: true, style: 'basename' },
			model: { enabled: true },
		},
	})
}
```

Segment mutations (`toggleSegment`, `reorderSegments`, `updateSegmentConfig`) already accept `lineIndex` from task-009. No API changes needed — just verify task-016 and task-017 pass the correct `activeLineIndex` value.

**Tabs Value Mapping:**
shadcn-vue/reka-ui Tabs use string values. Map line indices to string values: `"line-0"`, `"line-1"`, etc. The `v-model` on Tabs converts between the string value and the numeric `activeLineIndex` via a computed getter/setter.

**Key Files:**

- `src/components/studio/LineSelector.vue` — NEW: line tab bar with add/remove
- `src/components/studio/panels/SegmentsPanel.vue` — MODIFY: add LineSelector above segment list
- `src/stores/editor.ts` — MODIFY: add watchers for index clamping and selection clearing
- `src/stores/config.ts` — MODIFY: ensure `addLine()` enforces 5-line max

**Patterns to Follow:**

- shadcn-vue Tabs for tab rendering (reka-ui TabsRoot with string values)
- Dialog for destructive action confirmation (already installed, standard shadcn-vue pattern)
- Pinia setup store with `ref` + `watch` for reactive index clamping
- Tab trigger and close button as siblings in a wrapper div (not nested interactive elements)
- `computed` getter/setter for Tabs v-model ↔ numeric index mapping
- Lucide icons: `Plus` for add, `X` for close (auto-imported as `<IconLucide-plus />`, `<IconLucide-x />`)
- `overflow-x-auto` on TabsList for narrow sidebar handling

**Dependencies:**

- Tasks: task-009 (Pinia stores — provides `activeLineIndex`, `addLine()`, `removeLine()`)
- Tasks: task-016 (segment list — must exist before this task adds the line selector above it)
- Skills: vue, shadcn-vue, vue-best-practices

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Add `watch` on `config.display.lines.length` in useEditorStore to clamp `activeLineIndex` to valid bounds (handles removeLine, loadConfig, $reset)
- [ ] Add `watch` on `activeLineIndex` in useEditorStore to call `clearSelection()` on line switch
- [ ] Ensure `addLine()` in useConfigStore enforces 5-line maximum (no-op guard)
- [ ] Create `LineSelector.vue` component with:
  - shadcn-vue Tabs bound to activeLineIndex via computed getter/setter (string ↔ number mapping)
  - Wrapper div per tab containing TabsTrigger + sibling close Button (not nested)
  - TabsTrigger per line showing "Line N" label
  - Close Button (X icon, variant="ghost", size="icon") on non-first tabs
  - "+" Button after TabsList to add a line (disabled when lines.length >= 5)
  - `overflow-x-auto` on TabsList for narrow sidebar
- [ ] Add confirmation Dialog to LineSelector for remove-line (using existing Dialog component)
- [ ] Integrate LineSelector into SegmentsPanel.vue above the segment list
- [ ] Ensure SegmentsPanel reads activeLineIndex and passes it to segment list operations
- [ ] Verify task-016 segment list shows all 13 segment rows for sparse lines (synthesize missing configs as disabled)
- [ ] Verify task-017 config panels pass activeLineIndex to store mutations
- [ ] Verify live preview updates on add/remove/switch line
- [ ] Test edge cases: remove first line (blocked), remove selected line (index adjusts), remove line before selected (index adjusts), add 5th line (button disabled + store no-op), loadConfig with fewer lines (index clamps), line switch clears selectedSegment

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Implementation Notes:**

- The upstream `LineConfig` interface (claude-powerline `src/config/loader.ts:26-41`) defines exactly which segment types are allowed in `segments`. The default config (`defaults.ts`) ships with a single line containing all 13 segments with various enabled states.
- New lines should start minimal (directory + model only) rather than copying all 13 segments — keeps the UI clean and lets users add segments intentionally.
- The 5-line maximum is a practical limit — more lines would create an unwieldy terminal statusline. This can be adjusted if upstream changes.
- Dialog component is already installed at `src/components/ui/dialog/`; no new component install needed.
- **Sparse segment model**: The upstream `LineConfig.segments` object is sparse (all keys optional). The segment list in task-016 must use a canonical segment registry (the 13 known segment names from `LineConfig`) and synthesize `{ enabled: false }` for any missing keys. This ensures all lines show all 13 segments in the editor, even newly created minimal lines.
- **Naming alignment**: task-009 uses `activeLineIndex` in useEditorStore. This task uses the same name consistently.

**Review Feedback (codex, 2026-04-11):**

- Fixed: nested button inside TabsTrigger → sibling layout in wrapper div
- Fixed: AlertDialog dependency → use existing Dialog component
- Fixed: naming inconsistency (`selectedLineIndex` → `activeLineIndex`)
- Added: index clamping on loadConfig/$reset via watch
- Added: selectedSegment clearing on line switch
- Added: store-level 5-line max enforcement (not just UI)
- Added: sparse segment handling requirement for task-016 integration
- Added: tab overflow handling for narrow sidebar

**Related Tasks:**

- task-009-pinia-stores — Store definitions providing `activeLineIndex`, `addLine()`, `removeLine()`
- task-016-segment-list — Segment list that this task wraps with line selection (must handle sparse segments)
- task-017-segment-configs — Per-segment config panels that must pass `activeLineIndex` to store mutations

<!-- NOTES:END -->
