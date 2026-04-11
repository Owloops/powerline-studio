---
id: task-009-pinia-stores
title: Create Pinia stores for config, preview, mock data, and editor state
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
---

## Description

<!-- DESCRIPTION:BEGIN -->

Create the 4 Pinia stores that form the reactive data layer for Powerline Studio. These stores hold all application state and are consumed by every UI component and the rendering pipeline (task-010).

- **useConfigStore** — the user's powerline configuration (`PowerlineConfig`). Holds theme selection, display style/charset/padding/autoWrap, per-segment configs organized by line, budget settings, model context limits, and custom color overrides. Provides granular mutations so UI controls can update individual fields without replacing the entire config. Initializes from `DEFAULT_CONFIG` and supports `$reset()` back to defaults. Exposes a `configJson` computed that serializes the current config for export (task-022).

- **usePreviewStore** — terminal emulation settings that control how the preview renders but are NOT part of the exported config. Holds terminal width (default 120, range 30–200), color mode for rendering (default `truecolor`), dark/light terminal background toggle, and the rendered output (raw ANSI string + converted HTML string). The rendering service (task-010) writes to `ansiOutput` and `htmlOutput`; the preview component (task-011) reads `htmlOutput`.

- **useMockDataStore** — fake data objects that feed the rendering pipeline in place of real CLI data. Holds `ClaudeHookData`, `GitInfo`, `UsageInfo`, `ContextInfo`, `MetricsInfo`, `BlockInfo`, `TodayInfo`, and `tmuxSessionId`. Ships sensible defaults (matching the sample data in claude-powerline's preview.sh). Provides named presets (`default`, `minimal`, `heavy`, `rate-limited`) that swap all mock data at once. Individual fields are also editable for fine-grained preview control (task-021).

- **useEditorStore** — pure UI state that tracks which part of the editor the user is interacting with. Holds selected segment name (nullable), active sidebar panel (`theme | style | segments | tui | mockData | export`), expanded accordion sections in the sidebar, and the currently edited line index for multi-line configs.

All data types are imported from `@owloops/claude-powerline/browser`. Stores are auto-imported via unplugin-auto-import from `src/stores/`.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### useConfigStore (`src/stores/config.ts`)

- State: a deep-reactive `PowerlineConfig` object initialized from `DEFAULT_CONFIG` (imported from `@owloops/claude-powerline/browser`)
- Mutations:
  - `setTheme(theme)` — set `config.theme` (union: `'dark' | 'light' | 'nord' | 'tokyo-night' | 'rose-pine' | 'gruvbox' | 'custom'`)
  - `setStyle(style)` — set `config.display.style` (union: `'minimal' | 'powerline' | 'capsule' | 'tui'`)
  - `setCharset(charset)` — set `config.display.charset` (union: `'unicode' | 'text'`)
  - `setColorCompatibility(mode)` — set `config.display.colorCompatibility`
  - `setPadding(n)` — set `config.display.padding` (0–3)
  - `setAutoWrap(enabled)` — set `config.display.autoWrap`
  - `setTuiConfig(tui)` — set `config.display.tui` (full `TuiGridConfig` or `undefined`)
  - `updateSegmentConfig(lineIndex, segmentName, patch)` — deep-merge patch into `config.display.lines[lineIndex].segments[segmentName]`
  - `toggleSegment(lineIndex, segmentName, enabled)` — set `enabled` flag on a segment
  - `reorderSegments(lineIndex, orderedNames)` — rebuild `lines[lineIndex].segments` in the given key order, preserving all existing configs. Keys present in the line but missing from `orderedNames` are appended at the end. Unknown keys in `orderedNames` are ignored. No data loss.
  - `addLine()` — push a new `LineConfig` using `SEGMENT_DEFAULTS` (see Design) with all `enabled: false`. Includes all 13 segment types with their required fields.
  - `removeLine(lineIndex)` — splice line at index. Guards: minimum 1 line always (no-op if only 1 line remains). After removal, clamps `useEditorStore().activeLineIndex` to valid range (`Math.min(activeLineIndex, lines.length - 1)`).
  - `setBudget(path, value)` — update a budget field (e.g. `'session.warningThreshold'`, `80`)
  - `setModelContextLimit(model, limit)` — set `config.modelContextLimits[model]`
  - `setCustomColors(colors)` — set `config.colors.custom` (type `ColorTheme`)
  - `loadConfig(partial)` — deep-merge partial `PowerlineConfig` onto `structuredClone(DEFAULT_CONFIG)`, matching upstream CLI loader behavior. Arrays (e.g. `display.lines`) are replaced wholesale, not merged element-by-element.
  - `$reset()` — restore `DEFAULT_CONFIG`
- Computed:
  - `configJson` — `JSON.stringify(config, null, 2)` for export display
  - `activeStyle` — shorthand for `config.display.style`
  - `isTuiStyle` — `config.display.style === 'tui'`
  - `enabledSegments(lineIndex)` — returns a getter function: ordered list of enabled segment names for a given line

### usePreviewStore (`src/stores/preview.ts`)

- State:
  - `terminalWidth: number` — default `120`, range 30–200
  - `colorMode: 'truecolor' | 'ansi256' | 'ansi' | 'none'` — default `'truecolor'`
  - `darkBackground: boolean` — default `true`
  - `ansiOutput: string` — raw ANSI string from renderer (written by rendering service)
  - `htmlOutput: string` — HTML from ansi_up conversion (written by rendering service)
- Mutations:
  - `setTerminalWidth(width)` — clamp to 30–200
  - `setColorMode(mode)`
  - `toggleBackground()` — flip `darkBackground`
  - `setRenderedOutput(ansi, html)` — update both output strings
  - `clearOutput()` — reset both to empty
- Computed:
  - `charset` — derived from config store's `config.display.charset` (read cross-store)

### useMockDataStore (`src/stores/mockData.ts`)

- State (each a separate ref):
  - `hookData: ClaudeHookData`
  - `gitInfo: GitInfo | null`
  - `usageInfo: UsageInfo | null`
  - `contextInfo: ContextInfo | null`
  - `metricsInfo: MetricsInfo | null`
  - `blockInfo: BlockInfo | null`
  - `todayInfo: TodayInfo | null`
  - `tmuxSessionId: string | null`
  - `activePreset: string` — name of the currently active preset (default `'default'`)
- Defaults: sensible mock values matching claude-powerline's preview.sh sample data:
  - hookData: model Sonnet 4, cwd `~/my-project`, session cost $2.85, context 42% used, 200k window
  - gitInfo: branch `feat/my-feature`, status `dirty`, 1 staged, 1 unstaged, 1 untracked
  - usageInfo: session cost $2.85, 84000 total tokens
  - contextInfo: 42% used, 84000 tokens, 200000 max
  - metricsInfo: 13s response time, 270min duration, 24 messages, 342 lines added, 87 removed
  - blockInfo: 35% utilization, 258min remaining
  - todayInfo: $12.40 cost, 450000 tokens, today's date
  - tmuxSessionId: `'studio-preview'`
- Presets (named collections that swap all mock data — keys are stable identifiers, display labels are a UI concern for task-021):
  - `'default'` — standard working session (values above), tmuxSessionId `'studio-preview'`
  - `'minimal'` — fresh session, low usage, clean git, tmuxSessionId `null`
  - `'heavy'` — high cost, high context usage, many git changes, tmuxSessionId `'prod-session'`
  - `'rate-limited'` — high block utilization (>80%), low time remaining, tmuxSessionId `'rate-check'`
- Mutations:
  - `applyPreset(name)` — replace all mock data refs with preset values, update `activePreset`
  - `updateHookData(patch)` — deep-merge patch into `hookData`
  - `updateGitInfo(patch)` — deep-merge patch into `gitInfo`
  - `updateUsageInfo(patch)` / `updateContextInfo(patch)` / `updateMetricsInfo(patch)` / `updateBlockInfo(patch)` / `updateTodayInfo(patch)` — same pattern
  - `setTmuxSessionId(id)` — set `tmuxSessionId`
  - `$reset()` — apply `'default'` preset

### useEditorStore (`src/stores/editor.ts`)

- State:
  - `selectedSegment: string | null` — name of the segment currently selected in the editor (e.g. `'git'`, `'context'`)
  - `activePanel: SidebarPanel` — which sidebar section is active; type `'theme' | 'style' | 'segments' | 'tui' | 'mockData' | 'export'`; default `'segments'`
  - `expandedSections: Set<string>` — which accordion sections in the main panel are expanded
  - `activeLineIndex: number` — which line is being edited in multi-line configs; default `0`
- Mutations:
  - `selectSegment(name)` — set `selectedSegment`, auto-switch `activePanel` to `'segments'`
  - `clearSelection()` — set `selectedSegment` to `null`
  - `setActivePanel(panel)` — set `activePanel`
  - `toggleSection(sectionId)` — add/remove from `expandedSections`
  - `setActiveLineIndex(index)` — set `activeLineIndex`
- Computed:
  - `hasSelection` — `selectedSegment !== null`

### Cross-cutting requirements

- All stores use Pinia setup store syntax (`defineStore('name', () => { ... })`)
- All types imported from `@owloops/claude-powerline/browser`
- `DEFAULT_CONFIG` imported from `@owloops/claude-powerline/browser`
- Stores are auto-imported (no manual import needed in components) via existing unplugin-auto-import config scanning `src/stores/`
- Delete the existing placeholder `src/stores/counter.ts`
- No localStorage persistence in this task (task-022 handles that)
- No rendering logic in stores (task-010 handles the rendering service that reads from these stores)

### Acceptance criteria

- All 4 store files exist and export named setup stores
- Each store's state initializes to documented defaults
- All mutations listed above exist and modify state correctly
- Computed properties derive correct values
- Types compile without errors (`vp check` passes)
- `counter.ts` is deleted
- Run `vp dev` to regenerate `src/auto-imports.d.ts` — verify new store exports (`useConfigStore`, `usePreviewStore`, `useMockDataStore`, `useEditorStore`) appear in the generated file
- `removeLine()` guards against removing the last line
- `loadConfig()` deep-merges partial input onto defaults (arrays replaced wholesale)
- `SEGMENT_DEFAULTS` covers all 13 segment types including `env`
- Mock data store includes `tmuxSessionId` ref, completing the `TuiData` contract
- `removeLine()` clamps `useEditorStore().activeLineIndex` after removal
- `applyPreset()` uses `structuredClone()` — preset constants are not mutated

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**

Pinia setup stores (composition style) in `src/stores/`. Each store uses `defineStore` with a setup function returning `ref`s (state), `computed`s (getters), and named functions (actions). Types imported from `@owloops/claude-powerline/browser`. Follows the existing pattern established by `src/stores/counter.ts`.

**Key Files:**

| File                     | Store              | Purpose                                       |
| ------------------------ | ------------------ | --------------------------------------------- |
| `src/stores/config.ts`   | `useConfigStore`   | PowerlineConfig state + mutations             |
| `src/stores/preview.ts`  | `usePreviewStore`  | Terminal emulation settings + rendered output |
| `src/stores/mockData.ts` | `useMockDataStore` | Mock data objects + presets                   |
| `src/stores/editor.ts`   | `useEditorStore`   | UI interaction state                          |

**Files to delete:**

- `src/stores/counter.ts` — placeholder from template

**Type imports from `@owloops/claude-powerline/browser`:**

```ts
// Config types
import type {
	PowerlineConfig,
	DisplayConfig,
	LineConfig,
	BudgetConfig,
	BudgetItemConfig,
} from '@owloops/claude-powerline/browser'
import type { ColorTheme, SegmentColor } from '@owloops/claude-powerline/browser'
import type { TuiGridConfig } from '@owloops/claude-powerline/browser'

// Segment config types (for updateSegmentConfig)
import type { AnySegmentConfig } from '@owloops/claude-powerline/browser'

// Data types (for mock data)
import type { ClaudeHookData } from '@owloops/claude-powerline/browser'
import type { GitInfo } from '@owloops/claude-powerline/browser'
import type { UsageInfo, SessionInfo, TokenBreakdown } from '@owloops/claude-powerline/browser'
import type { ContextInfo } from '@owloops/claude-powerline/browser'
import type { MetricsInfo } from '@owloops/claude-powerline/browser'
import type { BlockInfo } from '@owloops/claude-powerline/browser'
import type { TodayInfo } from '@owloops/claude-powerline/browser'

// Config defaults
import { DEFAULT_CONFIG } from '@owloops/claude-powerline/browser'
```

**Patterns:**

- **Deep reactivity for config**: Use `ref<PowerlineConfig>(structuredClone(DEFAULT_CONFIG))` so nested mutations (e.g. `config.value.display.style = 'tui'`) trigger reactivity. `structuredClone` ensures the default is not mutated.
- **SEGMENT_DEFAULTS constant**: Typed as `Required<LineConfig['segments']>` for strict per-segment type safety (ensures `git` key contains `GitSegmentConfig`, not `BlockSegmentConfig`). Covers all 13 segment types with canonical disabled defaults (including required fields like `session.type`, `block.type`, `env.variable`). Used by `addLine()` and `toggleSegment()` when creating segments that don't exist in a line. Includes `env` (which is absent from upstream `DEFAULT_CONFIG`).
- **Separate refs for mock data**: Each mock data object is its own `ref` (not one giant reactive object) so individual updates don't trigger unnecessary re-renders of unrelated watchers. Includes `tmuxSessionId` as a separate `ref<string | null>` to complete the `TuiData` contract.
- **Color capability: two stores, two purposes**: `config.display.colorCompatibility` (in config store) is the exported config field and supports `'auto'`. `preview.colorMode` (in preview store) is the _resolved_ rendering mode for browser preview — no `'auto'` since browsers lack terminal color detection. The rendering service (task-010) uses `preview.colorMode` to drive ANSI rendering. These are intentionally separate: one is export data, the other is preview-time resolution.
- **Cross-store reads**: `usePreviewStore` reads charset from `useConfigStore` via a computed. This is the only cross-store dependency — call `useConfigStore()` inside the setup function per Pinia composing-stores pattern.
- **Deep merge utility**: A `deepMerge` helper for `updateSegmentConfig`, `loadConfig`, and mock data patch mutations. Must match upstream behavior: merges plain objects recursively, replaces arrays wholesale, handles `null` correctly (`typeof null === 'object'` — check for `sourceValue !== null` before recursing). Keep it local to the stores module (`src/stores/utils.ts`).
- **Type-safe segment key**: Define a local `SegmentName` type as `keyof LineConfig['segments']` for segment mutation APIs.
- **Preset data**: Define preset objects as plain const records in `mockData.ts`. Each preset is a frozen object containing all 8 data fields (7 data types + tmuxSessionId). `applyPreset` uses `structuredClone()` when assigning preset values to refs — never assign object references directly, as subsequent `updateXxx(patch)` mutations would mutate the shared preset constant.
- **Reactive Set for expandedSections**: Use `reactive(new Set<string>())` — Vue 3 natively supports reactive `Set` and `Map`. Standard `.add()`, `.delete()`, `.has()` methods trigger reactivity automatically. No need for `shallowRef` + cloning.

**Dependencies:**

- `@owloops/claude-powerline/browser` (already linked as local dependency)
- `pinia` (already installed)
- `vue` (already installed)

**Skills consulted:** pinia (setup stores, storeToRefs, composing stores), vue (ref, shallowRef, computed, reactive), vue-best-practices (keep state minimal, derive with computed), zod (not needed for stores — validation is a UI concern in task-017/021)

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Delete `src/stores/counter.ts`
- [ ] Create `src/stores/config.ts` — define `useConfigStore` with:
  - [ ] `PowerlineConfig` ref initialized from `structuredClone(DEFAULT_CONFIG)`
  - [ ] `SEGMENT_DEFAULTS` constant covering all 13 segment types (including `env`) with canonical disabled defaults
  - [ ] All config mutations: `setTheme`, `setStyle`, `setCharset`, `setColorCompatibility`, `setPadding`, `setAutoWrap`, `setTuiConfig`, `updateSegmentConfig`, `toggleSegment`, `reorderSegments`, `addLine` (uses SEGMENT_DEFAULTS), `removeLine` (guards last line), `setBudget`, `setModelContextLimit`, `setCustomColors`, `loadConfig` (merge-on-defaults, arrays replaced wholesale), `$reset`
  - [ ] Computed properties: `configJson`, `activeStyle`, `isTuiStyle`, `enabledSegments`
- [ ] Create `src/stores/preview.ts` — define `usePreviewStore` with:
  - [ ] Terminal settings refs: `terminalWidth`, `colorMode`, `darkBackground`
  - [ ] Output refs: `ansiOutput`, `htmlOutput`
  - [ ] Mutations: `setTerminalWidth`, `setColorMode`, `toggleBackground`, `setRenderedOutput`, `clearOutput`
  - [ ] Cross-store computed `charset` reading from config store
- [ ] Create `src/stores/mockData.ts` — define `useMockDataStore` with:
  - [ ] Default mock data constants matching preview.sh sample values
  - [ ] 4 named presets: `default`, `minimal`, `heavy`, `rate-limited` (each includes all 8 data fields)
  - [ ] Individual refs for each data type: `hookData`, `gitInfo`, `usageInfo`, `contextInfo`, `metricsInfo`, `blockInfo`, `todayInfo`, `tmuxSessionId`, `activePreset`
  - [ ] Mutations: `applyPreset`, `updateHookData`, `updateGitInfo`, `updateUsageInfo`, `updateContextInfo`, `updateMetricsInfo`, `updateBlockInfo`, `updateTodayInfo`, `setTmuxSessionId`, `$reset`
- [ ] Create `src/stores/editor.ts` — define `useEditorStore` with:
  - [ ] State refs: `selectedSegment`, `activePanel`, `expandedSections`, `activeLineIndex`
  - [ ] Mutations: `selectSegment`, `clearSelection`, `setActivePanel`, `toggleSection`, `setActiveLineIndex`
  - [ ] Computed: `hasSelection`
- [ ] Create `src/stores/utils.ts` — `deepMerge` helper matching upstream behavior (recursive object merge, array replacement)
- [ ] Verify `vp check` passes (types compile, lint clean)
- [ ] Run `vp dev` briefly to regenerate `src/auto-imports.d.ts` and verify new stores appear

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Plan review (2026-04-11, codex):**

Reviewed via `/review-plan 009`. Key changes from review:

1. Added `tmuxSessionId` to mock data store — completes the `TuiData` contract needed by the TUI renderer
2. Changed `loadConfig` from full replacement to merge-on-defaults, matching upstream CLI loader behavior (arrays replaced wholesale per upstream `deepMerge`)
3. Added `SEGMENT_DEFAULTS` constant covering all 13 segment types (upstream `DEFAULT_CONFIG` omits `env`), used by `addLine()` and `toggleSegment()`
4. Added `removeLine()` guard to prevent removing the last line
5. Clarified `colorCompatibility` vs `colorMode` dual ownership is intentional (export config vs preview rendering)
6. Specified `reorderSegments` preserves all existing configs (missing keys appended, unknown keys ignored)
7. Standardized preset keys in spec/description (stable string keys, display labels are task-021 concern)
8. Added auto-imports.d.ts regeneration to acceptance criteria

**Plan review (2026-04-11, gemini):**

Second review via `/review-plan 009 gemini`. Additional refinements:

1. Added `activeLineIndex` clamping in `removeLine()` — cross-store call to editor store to prevent out-of-bounds index
2. Changed `expandedSections` from `shallowRef<Set>` + cloning to `reactive(new Set())` — Vue 3 natively supports reactive Set/Map
3. Strengthened `SEGMENT_DEFAULTS` typing from `Record<SegmentName, AnySegmentConfig>` to `Required<LineConfig['segments']>` for per-segment type safety
4. Made explicit that `applyPreset` must use `structuredClone()` to avoid mutating shared preset constants

<!-- NOTES:END -->
