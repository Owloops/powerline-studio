---
id: task-016-segment-list
title: Build segment list with enable/disable toggles and drag-to-reorder
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
  - task-009
  - task-011
  - task-013
---

## Description

<!-- DESCRIPTION:BEGIN -->

Build the Segments configuration panel — the central UI for managing which segments appear in the powerline and in what order. This panel lives in the sidebar config area and displays all 13 segments (directory, git, model, session, today, block, weekly, version, tmux, sessionId, context, metrics, env) as a vertical list of compact rows.

Each row shows: a drag handle (grip icon), a Lucide icon representing the segment type, the segment's display name, and an enable/disable toggle (shadcn-vue Switch). Users drag rows to reorder segments within the current line. Clicking a row (not the toggle or drag handle) expands it to reveal a slot where per-segment config options (built in task-017) will render.

The selected segment syncs bidirectionally with `useEditorStore` — clicking a segment in the preview hitbox highlights the corresponding row in the list and vice versa. Disabled segments appear visually dimmed (reduced opacity) but remain in the list so users can re-enable them. Segment order in the list maps directly to the `lines[n].segments` object key order in the PowerlineConfig, and reordering triggers a live preview update.

All 13 segments are always shown, even when the upstream config omits keys (e.g., `env` is missing from defaults). The config store normalizes sparse configs into a full 13-key object on load, using the canonical segment order and default configs from a shared module.

Drag-to-reorder uses motion-v's `Reorder.Group` / `Reorder.Item` components for smooth layout animations during drag. The expand/collapse of segment config uses shadcn-vue Collapsible (wrapping reka-ui) for accessibility (keyboard support, ARIA states). `@formkit/auto-animate` via `useAutoAnimate()` composable is applied to the expanded content area for smooth enter/exit transitions of the config form.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Functional Requirements

- **Segment list:** Always render all 13 segments as rows, even when the upstream config omits keys. The config store normalizes sparse configs into a full 13-key segments object on every load/reset/line-add path.
- **Row content:** Each row displays: drag handle (GripVertical icon), segment icon (Lucide), segment display name, enabled toggle (shadcn-vue Switch)
- **Drag-to-reorder:** Vertical drag reordering via motion-v `Reorder.Group` / `Reorder.Item` with `axis="y"`; drag handle as the drag trigger using `useDragControls` + `dragListener={false}`
- **Enable/disable toggle:** shadcn-vue `Switch` component bound to `segment.enabled`; toggling updates `useConfigStore` and triggers preview re-render
- **Click-to-expand:** Clicking a segment row (excluding the toggle and drag handle) expands/collapses it using shadcn-vue `Collapsible`; expanded area provides a `<slot>` for per-segment config (task-017 renders here)
- **Multi-open expansion:** Multiple rows can be expanded simultaneously (expansion is independent per row, not accordion-style). Selection (highlight) is single; expansion is multi.
- **Selection sync:** `useEditorStore.selectedSegment` is set on row click; if the hitbox system selects a segment externally, the corresponding row scrolls into view and highlights; only one segment selected at a time. If `selectedSegment` points to an unknown key, the panel does nothing (no-op).
- **Disabled state:** Disabled segments render at `opacity-50` with the toggle in the off position; they remain in the list and are still draggable/expandable
- **Segment order → config:** Reordering updates the `lines[n].segments` object key order in `useConfigStore`; the config store must rebuild the segments object with keys in the new order
- **Live preview:** Any change (enable/disable, reorder) triggers an immediate preview re-render via the reactive store pipeline

### Interaction Contract

Explicit behavior for nested interactive controls within each row:

| Action                          | Behavior                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| **Click row body**              | Selects segment + toggles expand/collapse                                                   |
| **Click Switch**                | Toggles enabled state only; does NOT select or expand (`@click.stop`)                       |
| **Pointerdown on drag handle**  | Starts drag only; does NOT select or expand. Drag end does NOT trigger selection or expand. |
| **Keyboard Enter/Space on row** | Same as click row body (select + toggle expand)                                             |
| **Reorder (drag complete)**     | Preserves expanded state and selected highlight of all rows                                 |

### Visual Requirements

- Rows: compact height (~48px collapsed), subtle border or divider between rows
- Selected row: highlighted with `bg-accent` or ring indicator
- Drag handle: `GripVertical` Lucide icon, `cursor-grab` / `cursor-grabbing` states
- Dragging row: slightly elevated (`shadow-md`), `z-10` stacking, `scale(1.02)` via motion-v
- Expand/collapse: smooth height animation via `useAutoAnimate()` composable on the collapsible content container
- Reduced motion: respect `prefers-reduced-motion` — disable drag animations, use instant expand/collapse, degrade `scrollIntoView` to `behavior: 'auto'` instead of `'smooth'`

### Segment Metadata

Each segment needs a display name and Lucide icon mapping:

| Segment Key | Display Name | Lucide Icon     |
| ----------- | ------------ | --------------- |
| directory   | Directory    | `FolderOpen`    |
| git         | Git          | `GitBranch`     |
| model       | Model        | `Bot`           |
| session     | Session      | `DollarSign`    |
| today       | Today        | `CalendarDays`  |
| block       | Block        | `Gauge`         |
| weekly      | Weekly       | `CalendarRange` |
| version     | Version      | `Tag`           |
| tmux        | Tmux         | `Terminal`      |
| sessionId   | Session ID   | `Hash`          |
| context     | Context      | `Brain`         |
| metrics     | Metrics      | `Activity`      |
| env         | Environment  | `Variable`      |

This metadata lives in a shared module (`segmentMeta.ts`) alongside the canonical segment order constant and default per-segment configs. This module is the single source of truth for segment keys, ordering, display names, icons, and defaults — used by task-009 (store normalization), task-016 (list), and task-017 (config forms).

### Store API Contract (required from task-009)

This task depends on the following store API from `useConfigStore` and `useEditorStore`:

**useConfigStore:**

- `currentLineSegments: ComputedRef<Record<string, AnySegmentConfig>>` — the segments object for the active line, always normalized to 13 keys
- `activeLineIndex: Ref<number>` — which line is being edited (default 0)
- `setSegmentEnabled(key: string, enabled: boolean): void` — toggle a segment
- `reorderSegments(lineIndex: number, newKeyOrder: string[]): void` — rebuild segments object with keys in new order

**useEditorStore:**

- `selectedSegment: Ref<string | null>` — currently selected segment key

### Scope Boundaries

- **In scope:** List rendering, drag-to-reorder, enable/disable, expand/collapse shell, selection sync, segment order → config mapping, shared segment metadata module
- **Out of scope:** Per-segment config forms (task-017), multi-line segment management (task-018), adding/removing segments from a line (task-018)

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

### Architecture

The panel is composed of two components: `SegmentsPanel.vue` (container with the reorder group) and `SegmentRow.vue` (individual draggable, expandable row). A shared module `segmentMeta.ts` defines the canonical segment order, display metadata, and default configs — serving as the single source of truth across task-009, task-016, and task-017.

The panel derives its row order from `Object.keys(configStore.currentLineSegments)` which is always a normalized 13-key object. Each row manages its own expand/collapse state independently (multi-open, not accordion).

### Key Files

- `src/components/studio/segments/segmentMeta.ts` — Canonical segment order, display names, Lucide icon components, and default per-segment configs. Single source of truth shared by stores and UI.
- `src/components/studio/panels/SegmentsPanel.vue` — Container panel with `Reorder.Group`, segment order state, and reorder handler
- `src/components/studio/SegmentRow.vue` — Individual row with drag handle, icon, name, Switch toggle, Collapsible expand/collapse, and config slot

### Shared Segment Metadata Module

```ts
// src/components/studio/segments/segmentMeta.ts
import type { Component } from 'vue'
import type { AnySegmentConfig } from '@owloops/claude-powerline/browser'

export const SEGMENT_KEYS = [
	'directory',
	'git',
	'model',
	'session',
	'today',
	'block',
	'weekly',
	'version',
	'tmux',
	'sessionId',
	'context',
	'metrics',
	'env',
] as const

export type SegmentKey = (typeof SEGMENT_KEYS)[number]

export interface SegmentMeta {
	name: string
	icon: Component
}

export const SEGMENT_META: Record<SegmentKey, SegmentMeta> = {
	/* ... */
}

export const SEGMENT_DEFAULTS: Record<SegmentKey, AnySegmentConfig> = {
	/* ... */
}

// Normalizes a sparse segments object to always have all 13 keys
export function normalizeSegments(
	sparse: Record<string, AnySegmentConfig>,
): Record<SegmentKey, AnySegmentConfig> {
	/* ... */
}
```

The `normalizeSegments()` function is called by the config store on every path that creates or replaces `lines[*].segments` (init, loadConfig, resetConfig, addLine). It preserves existing key order for keys present in the sparse object and appends missing keys in canonical order with defaults.

### Component Structure

```
SegmentsPanel.vue
├── Reorder.Group (axis="y", v-model:values="segmentOrder")
│   └── Reorder.Item (v-for="key in segmentOrder", :key="key", :value="key")
│       └── SegmentRow (:segment-key="key", :config="segments[key]", :drag-controls="controls[key]")
│           ├── drag handle (GripVertical, @pointerdown.stop → dragControls.start)
│           ├── segment icon + name
│           ├── Switch (@click.stop, v-model="config.enabled")
│           └── Collapsible (v-model:open="expandedRows[key]")
│               └── CollapsibleContent (ref from useAutoAnimate)
│                   └── <slot name="config" /> ← task-017 renders here
```

### Drag-to-Reorder (motion-v Reorder)

```vue
<script setup lang="ts">
import { Reorder, useDragControls } from 'motion-v'

const configStore = useConfigStore()
const segmentOrder = computed(() => Object.keys(configStore.currentLineSegments))

// Create a drag controls instance per segment key
const dragControlsMap = Object.fromEntries(SEGMENT_KEYS.map((key) => [key, useDragControls()]))

function handleReorder(newOrder: string[]) {
	configStore.reorderSegments(configStore.activeLineIndex, newOrder)
}
</script>

<template>
	<Reorder.Group
		axis="y"
		:values="segmentOrder"
		as="div"
		class="space-y-1"
		@update:values="handleReorder"
	>
		<Reorder.Item
			v-for="key in segmentOrder"
			:key="key"
			:value="key"
			:drag-listener="false"
			:drag-controls="dragControlsMap[key]"
			as="div"
		>
			<SegmentRow :segment-key="key" :drag-controls="dragControlsMap[key]" />
		</Reorder.Item>
	</Reorder.Group>
</template>
```

Each `Reorder.Item` has `dragListener={false}` so only the handle triggers drag. The drag handle in `SegmentRow` calls `dragControls.start(event)` on `@pointerdown.stop` — the `.stop` prevents the pointerdown from bubbling into the collapsible trigger or selection handler.

When values update, `handleReorder` calls `configStore.reorderSegments()` to rebuild the segments object with keys in the new insertion order.

### Expand/Collapse (shadcn-vue Collapsible)

Each `SegmentRow` uses shadcn-vue Collapsible (which wraps reka-ui Collapsible with project styling). Expansion state is managed per-row in the parent `SegmentsPanel` as a reactive `Map<string, boolean>` so it persists across reorders.

```vue
<Collapsible v-model:open="isExpanded">
  <CollapsibleTrigger as-child>
    <div class="segment-row-header" @click="selectSegment">
      <!-- drag handle (@pointerdown.stop), icon, name, switch (@click.stop) -->
    </div>
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div ref="autoAnimateRef">
      <slot name="config" />
    </div>
  </CollapsibleContent>
</Collapsible>
```

The `useAutoAnimate()` composable (already established in the codebase) is applied to the content container div, not the CollapsibleContent itself, to avoid interfering with the Collapsible's own enter/exit mechanism.

### Selection Sync

- **List → Store:** Clicking a row body (not handle, not switch) sets `editorStore.selectedSegment = segmentKey`
- **Store → List:** A `watch` on `editorStore.selectedSegment` applies highlight styling to the matching row. If the row is off-screen, calls `el.scrollIntoView({ behavior, block: 'nearest' })` where `behavior` is `'auto'` when `prefers-reduced-motion` matches, otherwise `'smooth'`
- **Expand on select:** When a segment is selected (from either list click or hitbox click), auto-expand its Collapsible if not already expanded
- **No-op guard:** If `selectedSegment` points to an unknown key (not in `SEGMENT_KEYS`), the panel does nothing

### Config Store Integration

The config store needs a `reorderSegments(lineIndex: number, newKeyOrder: string[])` action that:

1. Takes the current `lines[lineIndex].segments` object
2. Creates a new object with keys in `newKeyOrder` order, preserving all values
3. Replaces `lines[lineIndex].segments` with the reordered object

This is necessary because JavaScript object key order is insertion order, and the renderer iterates segments by key order via `Object.entries(lineConfig.segments)`.

The normalizeSegments() helper ensures every code path that creates/replaces segments (init, loadConfig, $reset, addLine) always produces a full 13-key object.

### Expansion State Persistence

- **Reorder:** Expanded state is preserved (keyed by segment key, not array index)
- **External selection (hitbox):** Expands the selected row, does not collapse others
- **Line switch (task-018, future):** Should collapse all rows on line change. This task uses stable `:key="segmentKey"` on rows to support this future behavior.

### Dependencies

**Tasks:**

- task-009 (Pinia stores) — `useConfigStore` for segment config, `useEditorStore` for selection state
- task-011 (terminal preview) — preview re-renders on config changes
- task-013 (segment hitboxes) — bidirectional selection sync

**Libraries (already installed):**

- `motion-v` ^2.2 — `Reorder.Group`, `Reorder.Item`, `useDragControls`
- `@formkit/auto-animate` ^0.9 — `useAutoAnimate()` composable for expand/collapse content animation
- `reka-ui` — Collapsible primitives (used via shadcn-vue wrapper)
- `lucide-vue-next` — segment icons (auto-imported via unplugin-icons)

**shadcn-vue components (already installed):**

- `Switch` — enable/disable toggle

**shadcn-vue components (need to install):**

- `Collapsible` — `pnpm dlx shadcn-vue@latest add collapsible`

**Skills:** shadcn-vue, reka-ui, animations, motion, vueuse-functions, vue-best-practices

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Install shadcn-vue Collapsible component (`pnpm dlx shadcn-vue@latest add collapsible`)
- [ ] Create `src/components/studio/segments/segmentMeta.ts`:
  - [ ] Define `SEGMENT_KEYS` constant array (canonical order for all 13 segments)
  - [ ] Define `SegmentKey` type from `SEGMENT_KEYS`
  - [ ] Define `SEGMENT_META` map: key → `{ name, icon }` for all 13 segments
  - [ ] Define `SEGMENT_DEFAULTS` map: key → default `AnySegmentConfig` for each segment type
  - [ ] Implement `normalizeSegments(sparse)` — ensures all 13 keys present, preserves existing order, appends missing in canonical order
- [ ] Add store actions to `useConfigStore` (or verify task-009 provides them):
  - [ ] `reorderSegments(lineIndex, newKeyOrder)` — rebuild segments object with keys in new insertion order
  - [ ] `setSegmentEnabled(key, enabled)` — toggle a segment's enabled state
  - [ ] Ensure `currentLineSegments` getter returns normalized 13-key object
- [ ] Create `src/components/studio/SegmentRow.vue`:
  - [ ] Drag handle: GripVertical icon with `@pointerdown.stop` → `dragControls.start(event)`, `cursor-grab`/`cursor-grabbing`
  - [ ] Segment Lucide icon + display name from `SEGMENT_META`
  - [ ] shadcn-vue Switch for enable/disable with `@click.stop` to prevent row selection/expansion
  - [ ] shadcn-vue Collapsible wrapping the row: header as trigger, content as expandable area
  - [ ] `useAutoAnimate()` composable on content container div inside CollapsibleContent
  - [ ] Named slot `config` inside CollapsibleContent for per-segment config (task-017)
  - [ ] Selected state styling (`bg-accent` ring) driven by `editorStore.selectedSegment`
  - [ ] Disabled state styling (`opacity-50` + `transition-opacity`) when `!config.enabled`
  - [ ] Props: `segmentKey`, `dragControls`, `expanded` (v-model), `selected`
- [ ] Create `src/components/studio/panels/SegmentsPanel.vue`:
  - [ ] motion-v `Reorder.Group` with `axis="y"` and `:values` bound to segment key order
  - [ ] `Reorder.Item` per segment with `dragListener={false}` and per-item `useDragControls()`
  - [ ] `@update:values` handler calling `configStore.reorderSegments()`
  - [ ] Dragging item style: `shadow-md`, slight scale, `z-10` via motion-v `whileDrag` prop
  - [ ] Reactive `expandedRows: Map<string, boolean>` for multi-open expansion state (keyed by segment key, persists across reorder)
- [ ] Implement selection sync:
  - [ ] Row click (body only) sets `editorStore.selectedSegment = segmentKey`
  - [ ] Watch `editorStore.selectedSegment`: highlight matching row, auto-expand if not expanded
  - [ ] ScrollIntoView with `behavior: 'auto'` when `prefers-reduced-motion` matches, `'smooth'` otherwise
  - [ ] No-op guard: ignore if `selectedSegment` is not in `SEGMENT_KEYS`
- [ ] Verify interaction contract:
  - [ ] Switch click toggles enabled without selecting or expanding
  - [ ] Drag handle pointerdown starts drag without selecting or expanding
  - [ ] Drag end does not trigger selection or expand
  - [ ] Reorder preserves expanded state and selected highlight
- [ ] Verify live preview updates on enable/disable toggle and reorder
- [ ] Verify `prefers-reduced-motion` is respected (motion-v drag animations, auto-animate transitions, scrollIntoView behavior)

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

[Implementation decisions, issues encountered, important discoveries during implementation]

<!-- NOTES:END -->
