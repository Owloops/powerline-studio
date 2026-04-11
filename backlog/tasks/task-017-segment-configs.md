---
id: task-017-segment-configs
title: Build per-segment configuration panels for all 13 segments
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
  - task-016
---

## Description

<!-- DESCRIPTION:BEGIN -->

When a user clicks on a segment in the segment list (task-016), it expands to reveal a configuration form specific to that segment type. This task creates 13 individual config form components (one per segment type) plus a reusable budget sub-component. Each form lets users adjust the segment's options using selects, toggles, text inputs, and number inputs. Changes are written back to `useConfigStore` and reflected immediately in the live terminal preview.

**Segment config forms:**

- **directory** -- Style select: full | fish | basename
- **git** -- 9 boolean toggles: showSha, showAheadBehind, showWorkingTree, showOperation, showTag, showTimeSinceCommit, showStashCount, showUpstream, showRepoName
- **model** -- No config options beyond enable/disable (handled by task-016). Empty state component with descriptive text.
- **session** -- Type select: cost | tokens | both | breakdown. CostSource select: calculated | official. Budget sub-component.
- **context** -- DisplayStyle select (11 bar styles): text | ball | bar | blocks | blocks-line | capped | dots | filled | geometric | line | squares. ShowPercentageOnly toggle. PercentageMode select: remaining | used. AutocompactBuffer number input (integer >= 0, default 33000 -- token count for auto-compact trigger zone, 0 to disable).
- **block** -- Type select: cost | tokens | both | time | weighted. BurnType select: cost | tokens | both | none. DisplayStyle select (same 11 bar styles). Budget sub-component.
- **metrics** -- 6 boolean toggles: showResponseTime, showLastResponseTime, showDuration, showMessageCount, showLinesAdded, showLinesRemoved
- **today** -- Type select: cost | tokens | both | breakdown. Budget sub-component.
- **env** -- Variable text input (required, env var name). Prefix text input (optional display prefix).
- **weekly** -- DisplayStyle select (same 11 bar styles).
- **version** -- No config options beyond enable/disable. Empty state component.
- **tmux** -- No config options beyond enable/disable. Empty state component.
- **sessionId** -- ShowIdLabel toggle.

**Budget config sub-component** (used by session, today, block):

- Amount number input (min 0, step 0.01 for cost / 1 for tokens)
- WarningThreshold number input (0-100, percentage)
- Type select: cost | tokens (determines what the budget tracks)

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Functional Requirements

1. **13 config components** -- One Vue component per segment type, rendered inside the expanded row from task-016's `SegmentRow.vue`. The segment list passes the segment name; a dynamic component resolver maps it to the correct config form.
2. **Reusable BudgetConfig component** -- Shared by session, today, and block config forms. Displays amount, warningThreshold, and budget type fields. Reads/writes to `useConfigStore.config.budget[segment]`.
3. **Two-way store binding** -- Every form control reads its current value from `useConfigStore` and writes changes back immediately (no save button). The store's reactive state drives the live preview.
4. **Dynamic component resolution** -- A `segmentConfigMap` maps segment names to their config components. The parent (SegmentRow or SegmentsPanel from task-016) uses `<component :is="segmentConfigMap[segmentName]" />` to render the correct form.
5. **Empty state** -- Segments with no options (model, version, tmux) render a short descriptive message ("No additional configuration options").

### Form Controls

The project already has FormWerk-wrapped field components that should be reused:

| Control         | Existing Component                                         | Used For                                                                     |
| --------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Select dropdown | `FormSelectField.vue` (FormWerk + `components/Select/`)    | style, type, costSource, displayStyle, burnType, percentageMode, budget type |
| Toggle switch   | `FormSwitchField.vue` (FormWerk + `components/ui/switch/`) | All boolean options (showSha, showWorkingTree, etc.)                         |
| Text input      | `FormTextField.vue` (FormWerk)                             | env variable, env prefix                                                     |
| Number input    | `FormNumberField.vue` (FormWerk)                           | autocompactBuffer, budget amount, budget warningThreshold                    |

No new shadcn-vue components need to be installed. All form primitives already exist.

### Validation

- **Zod schemas** per segment config type for type safety and constraint enforcement.
- **Number fields:** autocompactBuffer (integer >= 0, default 33000 -- this is a token count, not a percentage), budget amount (number >= 0), warningThreshold (integer, 0-100).
- **Text fields:** env variable (required, non-empty), env prefix (optional).
- **Selects:** constrained to valid option sets from upstream type definitions.
- Validation runs on change (not submit) since there is no form submission -- all changes are live.

### Acceptance Criteria

- [ ] All 13 segment types render their correct config form when expanded
- [ ] Config changes are immediately reflected in `useConfigStore` state
- [ ] Budget config appears correctly in session, today, and block forms
- [ ] Select dropdowns show all valid options matching upstream TypeScript types
- [ ] Number inputs enforce min/max constraints
- [ ] Env variable field shows validation error when empty
- [ ] Segments with no options show empty state message
- [ ] Config components do not re-render unnecessarily (use shallowRef/computed where appropriate)

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

### Architecture

Each segment config is an independent SFC that receives its segment config object as a prop and emits updates via `useConfigStore`. A `segmentConfigMap` record maps segment names to components for dynamic resolution by the parent row.

```
SegmentRow.vue (task-016)
  └─ <component :is="segmentConfigMap[segment.name]" />
       ├─ DirectoryConfig.vue
       ├─ GitConfig.vue
       ├─ SessionConfig.vue
       │    └─ BudgetConfig.vue
       ├─ ContextConfig.vue
       ├─ BlockConfig.vue
       │    └─ BudgetConfig.vue
       ├─ MetricsConfig.vue
       ├─ TodayConfig.vue
       │    └─ BudgetConfig.vue
       ├─ EnvConfig.vue
       ├─ WeeklyConfig.vue
       ├─ SessionIdConfig.vue
       ├─ ModelConfig.vue      (empty state)
       ├─ VersionConfig.vue    (empty state)
       └─ TmuxConfig.vue       (empty state)
```

### Data Flow Pattern

Each config component:

1. Receives `segmentName` prop (e.g. `'directory'`)
2. Uses `useForm({ schema, initialValues })` from FormWerk to create a form context initialized from `useConfigStore`
3. Child `Form*Field` components register via their `name` prop and render with FormWerk validation
4. A `watch` on the form's `values` syncs changes back to the store via `updateSegmentConfig()`
5. For budget: BudgetConfig receives a `budgetKey` prop (`'session'` | `'today'` | `'block'`) and uses its own `useForm` context to read/write `config.budget[budgetKey]`

### Component Design Per Segment

**DirectoryConfig** -- 1 Select (style: full/fish/basename)
**GitConfig** -- 9 Switch toggles in a grid layout (2 columns)
**ModelConfig** -- Empty state text
**SessionConfig** -- 2 Selects (type, costSource) + BudgetConfig
**ContextConfig** -- 1 Select (displayStyle), 1 Switch (showPercentageOnly), 1 Select (percentageMode), 1 NumberField (autocompactBuffer)
**BlockConfig** -- 2 Selects (type, burnType), 1 Select (displayStyle) + BudgetConfig
**MetricsConfig** -- 6 Switch toggles in a grid layout (2 columns)
**TodayConfig** -- 1 Select (type) + BudgetConfig
**EnvConfig** -- 2 Input fields (variable required, prefix optional)
**WeeklyConfig** -- 1 Select (displayStyle)
**VersionConfig** -- Empty state text
**TmuxConfig** -- Empty state text
**SessionIdConfig** -- 1 Switch (showIdLabel)

**BudgetConfig** -- 1 NumberField (amount), 1 NumberField (warningThreshold, 0-100), 1 Select (type: cost/tokens)

### Shared Utilities

**Select option constants** (`src/components/studio/segments/options.ts`):

- `DIRECTORY_STYLES`: `['full', 'fish', 'basename']`
- `USAGE_TYPES`: `['cost', 'tokens', 'both', 'breakdown']`
- `COST_SOURCES`: `['calculated', 'official']`
- `BAR_DISPLAY_STYLES`: `['text', 'ball', 'bar', 'blocks', 'blocks-line', 'capped', 'dots', 'filled', 'geometric', 'line', 'squares']`
- `BLOCK_TYPES`: `['cost', 'tokens', 'both', 'time', 'weighted']`
- `BURN_TYPES`: `['cost', 'tokens', 'both', 'none']`
- `PERCENTAGE_MODES`: `['remaining', 'used']`
- `BUDGET_TYPES`: `['cost', 'tokens']`

**Config map** (`src/components/studio/segments/index.ts`):

- Exports `segmentConfigMap: Record<string, Component>` mapping all 13 segment names to their config components

**Zod schemas** (`src/components/studio/segments/schemas.ts`):

- One schema per segment config type
- One schema for BudgetItemConfig
- Used for validation on number/text fields

### Upstream Default Parity

Several upstream fields have non-obvious runtime defaults that differ from naive `false`. Config components must use the correct defaults in computed getters to match upstream behavior:

| Field                          | Default                            | Notes                                     |
| ------------------------------ | ---------------------------------- | ----------------------------------------- |
| `git.showAheadBehind`          | `true` (unless explicitly `false`) | Checked as `!== false` in renderer        |
| `sessionId.showIdLabel`        | `true` (unless explicitly `false`) | Checked as `!== false` in renderer        |
| `metrics.showResponseTime`     | `true` (unless explicitly `false`) | Checked as `!== false` in renderer        |
| `metrics.showDuration`         | `true` (unless explicitly `false`) | Checked as `!== false` in renderer        |
| `metrics.showMessageCount`     | `true` (unless explicitly `false`) | Checked as `!== false` in renderer        |
| `metrics.showLinesAdded`       | `true` (unless explicitly `false`) | Checked as `!== false` in renderer        |
| `metrics.showLinesRemoved`     | `true` (unless explicitly `false`) | Checked as `!== false` in renderer        |
| `metrics.showLastResponseTime` | `false` (opt-in)                   | Checked as truthy                         |
| `context.percentageMode`       | depends on `displayStyle`          | `'remaining'` if text, `'used'` otherwise |
| `context.autocompactBuffer`    | `33000`                            | Token count, not percentage               |
| `directory.style`              | `'full'`                           | Falls back from legacy `showBasename`     |

### Validation / Writeback Strategy

Since these are live config forms (no submit button), use this pattern:

- **Selects and Switches:** Write to store immediately on change. No intermediate state needed -- values are always valid (constrained by options list or boolean).
- **Number fields:** Write to store on change. The computed setter must guard against `NaN`/empty values -- only write valid numbers to the store. FormWerk's `useNumberField` handles min/max constraints; invalid intermediate states (empty field while typing) stay in FormWerk's local field state and do not propagate to the store.
- **Text fields (env):** Debounce writes to store (~300ms via `refDebounced` from VueUse) to avoid re-rendering the terminal preview on every keystroke. An empty `variable` field shows a validation error but the store still holds the empty string -- the upstream renderer handles missing env vars gracefully (returns `null`).

### FormWerk Integration Pattern

The existing `Form*Field` components use FormWerk's `useCustomField`/`useNumberField` with `name` prop registration, designed for FormWerk form context. They do **not** support `v-model` directly. Use the FormWerk `useForm` approach:

1. Each config component calls `useForm({ schema, initialValues })` to create a form context.
2. Child `Form*Field` components register automatically via their `name` prop.
3. Watch the form's reactive `values` for changes and sync valid values to `useConfigStore` via `updateSegmentConfig()`.
4. This gives form-level Zod validation for free and keeps the store free of invalid intermediate states.

Example pattern:

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'

const configStore = useConfigStore()

const { values } = useForm({
	schema: directoryConfigSchema,
	initialValues: configStore.getSegmentConfig('directory'),
})

// Sync valid changes to store (debounced for text-heavy forms)
watch(
	values,
	(newValues) => {
		configStore.updateSegmentConfig('directory', newValues)
	},
	{ deep: true },
)
</script>

<template>
	<FormSelectField name="style" label="Directory Style" :options="DIRECTORY_STYLE_OPTIONS" />
</template>
```

### Store Method Requirements

`useConfigStore` (task-009) must handle deep initialization for optional nested objects:

- `updateBudgetConfig(key, partial)` must initialize `config.budget` and `config.budget[key]` if undefined before merging
- `updateSegmentConfig(name, partial)` must initialize `config.display.lines[0].segments[name]` if undefined before merging
- This prevents `Cannot set properties of undefined` errors when budget/segment objects don't exist in the user's config

### Styling

- Compact form layout: Label + control on same row for simple fields (Switch, Select)
- Grid layout (2 columns) for toggle-heavy segments (git, metrics)
- Vertical stack for multi-field segments (context, block, session)
- BudgetConfig rendered with a subtle separator (border-t) and "Budget" sub-heading
- Empty state: muted text, centered, italic
- Consistent spacing: `space-y-3` between fields, `gap-x-4 gap-y-2` in toggle grids

### Existing Form Primitives (No Installation Needed)

The project already has FormWerk-wrapped form components that should be reused:

- `src/components/FormSelectField.vue` -- FormWerk `useCustomField` + `components/Select/` (reka-ui Select)
- `src/components/FormNumberField.vue` -- FormWerk `useNumberField` with styled input
- `src/components/FormSwitchField.vue` -- FormWerk `useCustomField` + `components/ui/switch/Switch`
- `src/components/FormTextField.vue` -- FormWerk `useTextField` with styled input

These wrap reka-ui/shadcn-vue primitives with FormWerk validation. Use them directly in config components.

### Key Files

| File                                                 | Purpose                                                |
| ---------------------------------------------------- | ------------------------------------------------------ |
| `src/components/studio/segments/DirectoryConfig.vue` | Directory segment config form                          |
| `src/components/studio/segments/GitConfig.vue`       | Git segment config form (9 toggles)                    |
| `src/components/studio/segments/ModelConfig.vue`     | Model empty state                                      |
| `src/components/studio/segments/SessionConfig.vue`   | Session config + budget                                |
| `src/components/studio/segments/ContextConfig.vue`   | Context config (displayStyle, percentage, autocompact) |
| `src/components/studio/segments/BlockConfig.vue`     | Block config + budget                                  |
| `src/components/studio/segments/MetricsConfig.vue`   | Metrics config (6 toggles)                             |
| `src/components/studio/segments/TodayConfig.vue`     | Today config + budget                                  |
| `src/components/studio/segments/EnvConfig.vue`       | Env config (variable, prefix)                          |
| `src/components/studio/segments/WeeklyConfig.vue`    | Weekly config (displayStyle)                           |
| `src/components/studio/segments/VersionConfig.vue`   | Version empty state                                    |
| `src/components/studio/segments/TmuxConfig.vue`      | Tmux empty state                                       |
| `src/components/studio/segments/SessionIdConfig.vue` | SessionId config (showIdLabel)                         |
| `src/components/studio/segments/BudgetConfig.vue`    | Reusable budget sub-component                          |
| `src/components/studio/segments/options.ts`          | Select option constants                                |
| `src/components/studio/segments/schemas.ts`          | Zod validation schemas                                 |
| `src/components/studio/segments/index.ts`            | segmentConfigMap + re-exports                          |

### Dependencies

**Tasks:** task-016 (provides SegmentRow with expandable area where these forms render)
**Store dependency:** `useConfigStore` must expose `getSegmentConfig(name)` and `updateSegmentConfig(name, partial)` methods, plus `getBudgetConfig(key)` and `updateBudgetConfig(key, partial)` (from task-009)
**Skills:** shadcn-vue, reka-ui, formwerk, zod, vue-best-practices

### Context Manifest

| Source                      | Path                                           | Relevance                                                   |
| --------------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| Upstream segment interfaces | `claude-powerline/src/segments/renderer.ts`    | All segment config interfaces + BarDisplayStyle type        |
| Upstream config types       | `claude-powerline/src/config/loader.ts`        | BudgetConfig, BudgetItemConfig, PowerlineConfig, LineConfig |
| Upstream defaults           | `claude-powerline/src/config/defaults.ts`      | Default values (autocompactBuffer: 33000, etc.)             |
| Project conventions         | `CLAUDE.md`                                    | Tech stack, code conventions, file organization             |
| Design brief                | `backlog/designs/dsgn-001-powerline-studio.md` | UI layout, segment editor spec, feature details             |
| Parent task                 | `backlog/tasks/task-016-segment-list.md`       | SegmentRow expansion behavior, integration point            |
| FormSelectField             | `src/components/FormSelectField.vue`           | Existing FormWerk select wrapper -- reuse                   |
| FormNumberField             | `src/components/FormNumberField.vue`           | Existing FormWerk number input -- reuse                     |
| FormSwitchField             | `src/components/FormSwitchField.vue`           | Existing FormWerk switch wrapper -- reuse                   |
| FormTextField               | `src/components/FormTextField.vue`             | Existing FormWerk text input -- reuse                       |
| Select primitives           | `src/components/Select/`                       | reka-ui Select used by FormSelectField                      |
| shadcn-vue Switch           | `src/components/ui/switch/Switch.vue`          | Used by FormSwitchField                                     |

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

### Shared Infrastructure

- [ ] Create `src/components/studio/segments/options.ts` with select option constants (DIRECTORY_STYLES, USAGE_TYPES, COST_SOURCES, BAR_DISPLAY_STYLES, BLOCK_TYPES, BURN_TYPES, PERCENTAGE_MODES, BUDGET_TYPES)
- [ ] Create `src/components/studio/segments/schemas.ts` with Zod schemas for each segment config type and BudgetItemConfig
- [ ] Create `BudgetConfig.vue` reusable component (amount NumberField, warningThreshold NumberField, type Select). Receives `budgetKey` prop, reads/writes `useConfigStore.config.budget[budgetKey]`

### Simple Config Components (1-2 controls)

- [ ] Create `DirectoryConfig.vue` -- 1 Select (style: full/fish/basename)
- [ ] Create `SessionIdConfig.vue` -- 1 Switch (showIdLabel)
- [ ] Create `WeeklyConfig.vue` -- 1 Select (displayStyle: 11 bar styles)
- [ ] Create `EnvConfig.vue` -- 2 Input fields (variable required, prefix optional) with Zod validation

### Empty State Components (no controls)

- [ ] Create `ModelConfig.vue` -- empty state message
- [ ] Create `VersionConfig.vue` -- empty state message
- [ ] Create `TmuxConfig.vue` -- empty state message

### Toggle-Heavy Components (multiple switches)

- [ ] Create `GitConfig.vue` -- 9 Switch toggles (showSha, showAheadBehind, showWorkingTree, showOperation, showTag, showTimeSinceCommit, showStashCount, showUpstream, showRepoName) in 2-column grid
- [ ] Create `MetricsConfig.vue` -- 6 Switch toggles (showResponseTime, showLastResponseTime, showDuration, showMessageCount, showLinesAdded, showLinesRemoved) in 2-column grid

### Complex Config Components (selects + budget)

- [ ] Create `SessionConfig.vue` -- 2 Selects (type, costSource) + BudgetConfig
- [ ] Create `TodayConfig.vue` -- 1 Select (type) + BudgetConfig
- [ ] Create `BlockConfig.vue` -- 3 Selects (type, burnType, displayStyle) + BudgetConfig
- [ ] Create `ContextConfig.vue` -- 1 Select (displayStyle), 1 Switch (showPercentageOnly), 1 Select (percentageMode), 1 NumberField (autocompactBuffer, integer >= 0, default 33000)

### Integration

- [ ] Create `src/components/studio/segments/index.ts` exporting `segmentConfigMap` mapping all 13 segment names to their config components
- [ ] Verify useConfigStore has `getSegmentConfig()`, `updateSegmentConfig()`, `getBudgetConfig()`, `updateBudgetConfig()` methods (or add them if task-009 hasn't)
- [ ] Test: expand each segment type in the segment list and verify correct form renders
- [ ] Test: change values in each form and verify useConfigStore updates reactively

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Upstream Interface Discovery:**

- GitSegmentConfig has `showAheadBehind` (not listed in original description) -- include it as a toggle
- BarDisplayStyle is shared across context, block, and weekly segments (11 options total including "text" as the non-bar default)
- BudgetItemConfig has an optional `type` field (`'cost' | 'tokens'`) that determines whether budget tracks cost or token amounts
- Block segment's displayStyle uses the same BarDisplayStyle as context/weekly
- The `showBasename` field on DirectorySegmentConfig is legacy -- the `style` field supersedes it
- `autocompactBuffer` default is 33000 (token count), NOT a percentage -- corrected from original 0-100 constraint
- Many boolean fields default to `true` via `!== false` checks in renderer -- must use correct defaults in UI

**Existing Form Components:**

- Project already has FormWerk-wrapped field components: `FormSelectField`, `FormNumberField`, `FormSwitchField`, `FormTextField`
- Select component already exists at `src/components/Select/` (reka-ui based) -- no need to install shadcn Select
- No NumberField shadcn component needed -- `FormNumberField` uses native input with FormWerk

**Review Finding -- block.burnType:**

- `burnType` is defined in the type interface and config defaults but does not appear to be consumed by the renderer. Include the control anyway for forward compatibility since it's part of the upstream config schema and users may already have it set.

**Review Finding -- FormWerk integration (gemini):**

- Existing `Form*Field` components do not support `v-model` -- they use FormWerk `name` prop registration
- Use `useForm({ schema, initialValues })` pattern instead of computed getters/setters
- Watch form `values` to sync to store, keeping invalid intermediate states in FormWerk's local state
- Store `updateBudgetConfig`/`updateSegmentConfig` must handle deep initialization of undefined nested objects

**Review Finding -- text input debouncing (gemini):**

- EnvConfig text inputs should debounce store writes (~300ms) to avoid excessive preview re-renders while typing

**Related Tasks:**

- task-016-segment-list -- Provides the expandable SegmentRow where these forms render
- task-009-pinia-stores -- Must expose segment config and budget config getter/setter methods

<!-- NOTES:END -->
