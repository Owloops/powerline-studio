---
id: task-021-mock-data
title: Create mock data system with defaults, presets, and editor form
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
  - task-009 # store must exist for form bindings; store imports DEFAULT_MOCK_DATA from this task's mockPresets.ts
  - task-011 # preview must exist for visual verification (panel can be built independently)
---

## Description

<!-- DESCRIPTION:BEGIN -->

Build the Mock Data config panel that lets users control the fake data driving the terminal preview. The preview needs realistic data for all segments (git branch, session cost, context usage, etc.) to show what the statusline looks like in practice. This task creates three things:

1. **Default mock data** -- A realistic baseline dataset sourced from claude-powerline's preview.sh sample data. This populates `useMockDataStore` so the preview works out of the box with sensible values (e.g., Sonnet 4 model, $2.85 session cost, 42% context, a dirty git branch with staged/unstaged files).

2. **Preset selector** -- A dropdown that instantly swaps all mock data to one of 7 preset options. Each preset tells a different story about a Claude Code session:
   - **Default** -- Normal active session (the baseline)
   - **Minimal Session** -- Fresh start, almost no usage, clean git
   - **Heavy Session** -- Deep into work, high cost, high context, many messages
   - **Rate Limited** -- Approaching or hitting 5-hour and 7-day rate limits
   - **Large Context** -- Near context window capacity, triggering warning states
   - **Git Merge Conflict** -- Mid-merge with conflicts, staged/unstaged files
   - **Long Running** -- Hours-long session with accumulated cost and metrics

3. **Data editor form** -- Expandable accordion sections for each data type so users can fine-tune individual fields:
   - **ClaudeHookData**: model display name, model ID, cwd, version, session_id, tmuxSessionId
   - **GitInfo**: branch, status (clean/dirty/conflicts), ahead/behind, staged/unstaged/untracked counts, operation (MERGE/REBASE/etc.), tag, sha, timeSinceCommit, stashCount, upstream, repoName
   - **UsageInfo (Session)**: cost, calculatedCost, officialCost, tokens, tokenBreakdown (input/output/cacheCreation/cacheRead)
   - **ContextInfo**: totalTokens, percentage, usablePercentage, contextLeftPercentage, maxTokens, usableTokens
   - **MetricsInfo**: responseTime, lastResponseTime, sessionDuration, messageCount, linesAdded, linesRemoved
   - **BlockInfo**: nativeUtilization percentage, timeRemaining (minutes)
   - **TodayInfo**: cost, tokens, tokenBreakdown, date
   - **Rate Limits**: five_hour (used_percentage, resets_at), seven_day (used_percentage, resets_at)

All changes update `useMockDataStore` reactively and trigger a live preview re-render.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Functional Requirements

- **FR-1**: `MockDataPanel.vue` renders as a sidebar config panel with a preset selector at top and accordion sections below
- **FR-2**: Preset selector is a `Select` component with 7 options (Default, Minimal Session, Heavy Session, Rate Limited, Large Context, Git Merge Conflict, Long Running)
- **FR-3**: Selecting a preset replaces ALL mock data values in `useMockDataStore` (multiple reactive updates are acceptable; no need for single-render atomicity)
- **FR-4**: 8 collapsible accordion sections, one per data type: ClaudeHookData, GitInfo, UsageInfo, ContextInfo, MetricsInfo, BlockInfo, TodayInfo, RateLimits
- **FR-5**: Each section contains form fields for its data type properties, using appropriate input types:
  - Text inputs for strings (branch name, model name, cwd, version, session_id, sha, tag, operation, upstream, repoName, date)
  - Number inputs for numeric values (cost, tokens, percentages, counts, times) with unit labels (seconds, minutes, tokens, USD, etc.)
  - Select/dropdown for closed enums (git status: clean/dirty/conflicts)
  - Text inputs for open-ended string fields (git operation -- placeholder shows common values like MERGE/REBASE)
  - Switch toggles for boolean fields (isWorktree)
- **FR-5a**: Sections for nullable data types (GitInfo, UsageInfo, ContextInfo, MetricsInfo, BlockInfo, TodayInfo, RateLimits) have an enable/disable Switch at the top. When disabled, the store value is set to `null`/`undefined` and the form fields are hidden, allowing users to preview "no git repo", "no metrics", etc.
- **FR-5b**: Individually nullable fields (e.g., MetricsInfo.responseTime, UsageInfo.session.tokenBreakdown) use empty/blank input to represent `null`. Clearing a number input sets the value to `null`, not `0`
- **FR-6**: All form field changes write directly to `useMockDataStore` state (two-way binding via store refs or setter actions)
- **FR-7**: Changes trigger live preview re-render (via store reactivity chain: mockDataStore -> rendering service -> previewStore)
- **FR-8**: Default mock data uses preview-inspired realistic values based on claude-powerline's `make_tui_sample_json()`:
  - Model: `claude-sonnet-4-20250514` / `Sonnet 4`
  - Cost: `total_cost_usd: 2.85` (USD)
  - Duration: `total_duration_ms: 16200000` (ms), `total_api_duration_ms: 480000` (ms)
  - Lines: `total_lines_added: 342`, `total_lines_removed: 87`
  - Context: 200k window, 42% used, 72k input + 12k output + 15k cache_creation + 8k cache_read (tokens)
  - Git: `feat/my-feature` branch, dirty, 1 staged, 1 untracked (preview-inspired, not exact match)
  - Rate limits: 35% five_hour, 28% seven_day (resets_at generated dynamically relative to current time)
  - Metrics: responseTime 480s, sessionDuration 16200s (seconds), 342 lines added, 87 removed
  - Block: nativeUtilization 35 (%), timeRemaining in minutes
  - Today: date generated dynamically as current date (YYYY-MM-DD)
  - tmuxSessionId: `'studio-preview'`
- **FR-9**: Preset selector tracks active preset state. Selecting a named preset sets `activePreset` in the store. Any manual field edit via the form sets `activePreset` to `'custom'`. Preset-driven updates (from `applyPreset()`) must NOT trigger the "manual edit -> custom" logic.
- **FR-10**: When a nullable section is re-enabled (toggled back on), it restores values from the active preset. If `activePreset` is `'custom'`, fall back to `DEFAULT_MOCK_DATA` values for that section. If the active preset has that section set to `null`, also fall back to `DEFAULT_MOCK_DATA`.

### Non-Functional Requirements

- **NFR-1**: Preset data defined as typed const objects in a dedicated `src/data/mockPresets.ts` module (not inline in components)
- **NFR-2**: All preset data objects conform to the types exported from `@owloops/claude-powerline/browser` (ClaudeHookData, GitInfo, UsageInfo, ContextInfo, MetricsInfo, BlockInfo, TodayInfo)
- **NFR-3**: Form sections are individual SFC components (one per data type) for maintainability
- **NFR-4**: No validation on form fields -- this is a preview tool, users should be able to enter any value to see how the statusline handles it
- **NFR-5**: Missing shadcn-vue component Accordion must be installed before implementation (Select already exists at `src/components/Select/`, Slider at `src/components/Slider/`)

### Acceptance Criteria

- Selecting "Heavy Session" preset populates all fields with heavy-session values and the preview updates
- Editing a single field (e.g., git branch name) updates only that field and the preview re-renders
- All 8 accordion sections expand/collapse independently
- Each section exposes the user-facing properties of its data type (curated subset for ClaudeHookData; full properties for provider types)
- Disabling a nullable section (e.g., GitInfo) sets it to null in the store and the preview renders without that segment
- Clearing a nullable number field sets it to null, not 0
- Default state on first load shows realistic preview data
- After applying a preset and editing a field, the preset selector shows "Custom"
- Re-enabling a disabled nullable section restores values from the active preset (or defaults)

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

### Architecture Approach

The mock data system has two distinct layers:

1. **Data layer** (`src/data/mockPresets.ts`) -- Preset factory functions that generate typed mock data objects. Each preset produces all data structures with fresh dynamic timestamps (e.g., `resets_at` relative to current time, `TodayInfo.date` as today's date). Time-based fields are generated once per `applyPreset()` call so related timestamps stay internally consistent. Non-time fields use static values.

2. **UI layer** (`src/components/studio/`) -- A panel component with a preset selector and accordion of form sub-components. Each form sub-component is a thin wrapper that reads/writes a specific slice of `useMockDataStore` state.

### Data Flow

```
mockPresets.ts (constants)
    │
    ├── applyPreset('heavy-session')
    │   └── deep-copies preset into store state
    │
    ▼
useMockDataStore (Pinia setup store from task-009)
    │
    ├── hookData: ref<ClaudeHookData>
    ├── gitInfo: ref<GitInfo | null>
    ├── usageInfo: ref<UsageInfo | null>
    ├── contextInfo: ref<ContextInfo | null>
    ├── metricsInfo: ref<MetricsInfo | null>
    ├── blockInfo: ref<BlockInfo | null>
    ├── todayInfo: ref<TodayInfo | null>
    ├── tmuxSessionId: ref<string | null>
    └── activePreset: ref<string>  ('default' | 'minimal' | ... | 'custom')
    (rate_limits lives inside hookData.rate_limits, no separate ref)
    │
    ▼
Form components (two-way bind via computed get/set or direct ref mutation)
    │
    ▼
Rendering service (watches store, re-renders) -> TerminalPreview
```

### Form Binding Strategy

Each form sub-component receives the store slice as a reactive reference and mutates it directly. Since this is a config editor (not a submission form), there is no submit/validate cycle -- changes are immediate.

Pattern for each form component:

```vue
<script setup lang="ts">
const mockData = useMockDataStore()
// Direct mutation of store refs for simple fields:
// mockData.gitInfo.branch = 'new-value'
// For nested fields, use computed get/set wrappers
</script>
```

**Important**: The project has existing FormWerk-based wrappers (`FormTextField.vue`, `FormNumberField.vue`, `FormSelectField.vue`, `FormSwitchField.vue`) but these are NOT used here because:

- They wrap FormWerk composables with validation/touched/error state
- This panel has no form submission or validation workflow (NFR-4)
- Fields directly mutate store state, not a form model

Instead, use plain shadcn-vue `Input`, `Select`, `Switch`, `Accordion` components with direct `v-model` or `@update:model-value` bindings to store refs.

### Null Handling Strategy

- **Section-level null**: Each nullable section (GitInfo, UsageInfo, etc.) has a Switch at the top. When off, the store ref is set to `null` and the form fields are hidden.
- **Field-level null**: Individually nullable fields (e.g., `MetricsInfo.responseTime`) use empty input to represent `null`. A computed get/set wrapper converts between `null` and empty string/undefined for the input binding.
- **Rate limits**: `hookData.rate_limits` is optional. The RateLimitsForm section toggle sets `hookData.rate_limits = undefined` when disabled.
- **Sub-object null**: `UsageInfo.session.tokenBreakdown` and `TodayInfo.tokenBreakdown` are nullable. A nested toggle within the section controls whether the breakdown sub-object is `null` or populated.

### Preset Data Design

Each preset is a complete `MockDataPreset` type containing all data structures. Presets are designed to exercise different rendering paths:

| Preset             | Key Characteristics                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| Default            | Normal session, moderate values, dirty git -- the "happy path"                                 |
| Minimal Session    | Near-zero cost/tokens, clean git, no metrics, tmuxSessionId null -- tests empty/minimal states |
| Heavy Session      | $15+ cost, 180k+ context, 50+ messages -- tests large number formatting                        |
| Rate Limited       | 95%+ five_hour, 80%+ seven_day -- tests rate limit warning states                              |
| Large Context      | 95%+ context usage -- tests context warning/critical states                                    |
| Git Merge Conflict | status=conflicts, operation=MERGE, conflicts count > 0 -- tests conflict display               |
| Long Running       | 4+ hour duration, high cumulative cost, many lines changed -- tests time formatting            |

### Key Files

| File                                                 | Purpose                                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/data/mockPresets.ts`                            | Default mock data + 6 preset constant objects, `MockDataPreset` type, preset metadata (name, description, id) |
| `src/components/studio/panels/MockDataPanel.vue`     | Panel shell: preset selector (Select) + Accordion container for 8 form sections                               |
| `src/components/studio/mockdata/HookDataForm.vue`    | Form fields for ClaudeHookData (model, cwd, version, session_id)                                              |
| `src/components/studio/mockdata/GitInfoForm.vue`     | Form fields for GitInfo (branch, status, ahead/behind, working tree, operation, tag, sha, etc.)               |
| `src/components/studio/mockdata/UsageInfoForm.vue`   | Form fields for UsageInfo/SessionInfo (cost, tokens, tokenBreakdown)                                          |
| `src/components/studio/mockdata/ContextInfoForm.vue` | Form fields for ContextInfo (totalTokens, percentage, maxTokens, usableTokens, etc.)                          |
| `src/components/studio/mockdata/MetricsInfoForm.vue` | Form fields for MetricsInfo (responseTime, duration, messageCount, lines)                                     |
| `src/components/studio/mockdata/BlockInfoForm.vue`   | Form fields for BlockInfo (nativeUtilization, timeRemaining)                                                  |
| `src/components/studio/mockdata/TodayInfoForm.vue`   | Form fields for TodayInfo (cost, tokens, tokenBreakdown, date)                                                |
| `src/components/studio/mockdata/RateLimitsForm.vue`  | Form fields for rate_limits (five_hour/seven_day used_percentage and resets_at)                               |

### shadcn-vue Components Needed

Components NOT yet installed that this task requires:

- **Accordion** -- for expandable form sections (8 collapsible items). May pull in Collapsible as a dependency.

Components already available:

- Select (`src/components/Select/`), Slider (`src/components/Slider/`), Input, Switch, Label, Card, Separator, Badge, Tabs, Checkbox, Radio Group
- FormWerk-based wrappers (`src/components/Form*.vue`) exist but are NOT used in this panel (see Design section)

### Scope Boundary

This task does NOT:

- Create the `useMockDataStore` itself (that is task-009)
- Modify the rendering service or preview component (task-010, task-011)
- Add localStorage persistence for mock data (could be a follow-up)

This task DOES:

- Create `src/data/mockPresets.ts` with all preset constants and the `DEFAULT_MOCK_DATA` export
- Build the UI panel and form components
- Wire form fields to store state

### Data Ownership Between task-009 and task-021

- **task-021** creates `src/data/mockPresets.ts` (the data constants file)
- **task-009** creates `src/stores/mockData.ts` (the Pinia store) which imports `DEFAULT_MOCK_DATA` from `mockPresets.ts`
- Implementation order: task-009 ships first with inline temporary defaults, then task-021 creates the full presets file and the store is updated to import from it. Alternatively, both can be built together since the data file has no framework dependencies.

### Dependencies

- **task-009** (Pinia stores) -- Must exist first since forms read/write `useMockDataStore`. The store should import `DEFAULT_MOCK_DATA` from this task's `src/data/mockPresets.ts` as initial state.
- **task-011** (Terminal preview) -- Must exist to visually verify live preview updates, though the panel and data layer can be built independently.
- **task-008** (Page layout) -- Provides the studio shell where `MockDataPanel` is rendered in the sidebar. Not a code dependency but needed for integration.

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

### Setup

- [ ] Install missing shadcn-vue component: `pnpm dlx shadcn-vue@latest add accordion`

### Data Layer

- [ ] Create `src/data/mockPresets.ts` with `MockDataPreset` type definition (all 8 data structures bundled)
- [ ] Define `DEFAULT_MOCK_DATA` constant matching preview.sh `make_tui_sample_json()` values
- [ ] Define `MINIMAL_SESSION_PRESET` -- fresh session, clean git, near-zero usage
- [ ] Define `HEAVY_SESSION_PRESET` -- deep session, $15+ cost, 180k+ context, 50+ messages
- [ ] Define `RATE_LIMITED_PRESET` -- 95% five_hour, 80% seven_day rate limits
- [ ] Define `LARGE_CONTEXT_PRESET` -- 95%+ context usage, warning state
- [ ] Define `GIT_MERGE_CONFLICT_PRESET` -- status=conflicts, operation=MERGE, conflict count
- [ ] Define `LONG_RUNNING_PRESET` -- 4+ hour duration, high cumulative cost/lines
- [ ] Export `MOCK_DATA_PRESETS` array with id, name, description, and factory function for each preset
- [ ] Use factory functions for dynamic time fields (resets_at relative to now, TodayInfo.date as today). Generate all time fields once per call for internal consistency.
- [ ] Include `tmuxSessionId` in all presets (e.g., `'studio-preview'` for default, `null` for minimal)

### Form Components (one per data type)

- [ ] Create `src/components/studio/mockdata/HookDataForm.vue` -- model display_name, model id, cwd, version, session_id, tmuxSessionId (6 text inputs, tmuxSessionId nullable). Always enabled (not nullable as a section).
- [ ] Create `src/components/studio/mockdata/GitInfoForm.vue` -- enable/disable Switch (null toggle), branch, status (Select: clean/dirty/conflicts), ahead, behind, staged, unstaged, untracked, conflicts (number), operation (text Input with placeholder "MERGE, REBASE, CHERRY-PICK..."), tag, sha, timeSinceCommit (seconds), stashCount, upstream, repoName (text/number), isWorktree (Switch)
- [ ] Create `src/components/studio/mockdata/UsageInfoForm.vue` -- enable/disable Switch (null toggle), cost (USD), calculatedCost (USD), officialCost (USD, nullable), tokens, tokenBreakdown toggle + sub-fields: input, output, cacheCreation, cacheRead (tokens, nullable sub-object)
- [ ] Create `src/components/studio/mockdata/ContextInfoForm.vue` -- enable/disable Switch (null toggle), totalTokens, percentage (%), usablePercentage (%), contextLeftPercentage (%), maxTokens, usableTokens
- [ ] Create `src/components/studio/mockdata/MetricsInfoForm.vue` -- enable/disable Switch (null toggle), responseTime (seconds, nullable), lastResponseTime (seconds, nullable), sessionDuration (seconds, nullable), messageCount (nullable), linesAdded (nullable), linesRemoved (nullable). Empty input = null.
- [ ] Create `src/components/studio/mockdata/BlockInfoForm.vue` -- enable/disable Switch (null toggle), nativeUtilization (%, 0-100), timeRemaining (minutes)
- [ ] Create `src/components/studio/mockdata/TodayInfoForm.vue` -- enable/disable Switch (null toggle), cost (USD, nullable), tokens (nullable), tokenBreakdown toggle + sub-fields: input, output, cacheCreation, cacheRead (tokens), date (YYYY-MM-DD string)
- [ ] Create `src/components/studio/mockdata/RateLimitsForm.vue` -- enable/disable Switch (sets hookData.rate_limits to undefined), five_hour: used_percentage (%, 0-100), resets_at (Unix seconds); seven_day: same

### Panel Assembly

- [ ] Create `src/components/studio/panels/MockDataPanel.vue` with:
  - Preset selector (Select component) at top, bound to `useMockDataStore.applyPreset()`, showing `activePreset` value (includes "Custom" option when applicable)
  - Accordion with 8 items, one per form component
  - Each accordion item: icon + label in trigger, form component in content
- [ ] Wire preset selection to replace all store mock data values (preset-driven updates must NOT trigger "manual edit -> custom" logic)
- [ ] Wire manual field edits to set `activePreset` to `'custom'` in the store
- [ ] Implement section re-enable logic: restore from active preset, fallback to DEFAULT_MOCK_DATA if preset has null for that section
- [ ] Ensure accordion sections can expand/collapse independently (multiple open allowed)

### Integration Verification

- [ ] Verify form field changes propagate to store and trigger preview re-render
- [ ] Verify preset switching replaces all values and updates preview
- [ ] Verify default state shows realistic data on first load

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

### Key Source Data

The default mock data should match `make_tui_sample_json()` from `claude-powerline/plugin/bin/preview.sh`:

- Model: `claude-sonnet-4-20250514` / `Sonnet 4`
- Cost: `total_cost_usd: 2.85`, `message_cost_usd: 0.12`
- Duration: `total_duration_ms: 16200000` (4.5h), `total_api_duration_ms: 480000` (8min)
- Lines: `total_lines_added: 342`, `total_lines_removed: 87`
- Context window: `context_window_size: 200000`, `used_percentage: 42`
- Context current_usage: `input_tokens: 72000`, `output_tokens: 12000`, `cache_creation_input_tokens: 15000`, `cache_read_input_tokens: 8000`
- Rate limits: five_hour `used_percentage: 35`, seven_day `used_percentage: 28`
- Git: branch `feat/my-feature`, dirty (1 staged README.md, 1 untracked newfile.txt)
- CWD: `/home/user/my-project`, version: `1.0.47`, session_id: `preview-123`

### Implementation Decisions

- FormWerk is not used for this panel (no form submission/validation needed -- this is a direct store editor). The existing `FormTextField.vue` etc. wrappers are for validated forms, not config editors.
- Zod is not used for validation (NFR-4: users should enter any value to test edge cases)
- Rate limits `resets_at` field uses Unix timestamp (seconds since epoch) -- the form shows this as a number input, not a date picker, since the rendering code operates on timestamps
- `BlockInfo` is derived from `rate_limits.five_hour` in the real plugin but stored separately in mock data for independent control. Editing rate limits does NOT auto-update blockInfo.
- `UsageInfo` wraps `SessionInfo` -- the form exposes `SessionInfo` fields directly under the "Session Usage" section
- `message_cost_usd` from preview.sh is NOT included as a form field -- it does not exist in the exported `ClaudeHookData.cost` type (which only has `total_cost_usd`, `total_duration_ms`, `total_api_duration_ms`, `total_lines_added`, `total_lines_removed`)
- `ClaudeHookData` form is a curated subset -- required fields like `hook_event_name`, `transcript_path`, `workspace.current_dir`, `workspace.project_dir` are set to sensible defaults in presets but not exposed in the UI
- `GitInfo.operation` uses a plain text Input (not a Select) since the upstream type is `string`, matching the no-validation rule. Placeholder text suggests common values.
- Derived/computed fields (e.g., ContextInfo percentages) are intentionally editable independently -- users can create inconsistent states to test edge cases
- `tmuxSessionId` included in presets and editable in HookDataForm (task-009 store includes it for TuiData contract)
- Preset selector shows "Custom" after any manual edit; preset-driven updates bypass the custom-detection logic
- Section re-enable restores from active preset, falls back to DEFAULT_MOCK_DATA
- Time-based fields (`resets_at`, `TodayInfo.date`) use factory functions for dynamic generation relative to current time
- Select component already exists at `src/components/Select/` (not in `ui/`); only Accordion needs installation

### Unit Reference

| Field                                     | Unit                 |
| ----------------------------------------- | -------------------- |
| MetricsInfo.responseTime                  | seconds              |
| MetricsInfo.lastResponseTime              | seconds              |
| MetricsInfo.sessionDuration               | seconds              |
| BlockInfo.timeRemaining                   | minutes              |
| ClaudeHookData.cost.total_duration_ms     | milliseconds         |
| ClaudeHookData.cost.total_api_duration_ms | milliseconds         |
| rate_limits.\*.resets_at                  | Unix seconds (epoch) |
| TodayInfo.date                            | YYYY-MM-DD string    |
| All cost fields                           | USD                  |
| All token fields                          | token count          |
| All percentage fields                     | 0-100                |
| GitInfo.timeSinceCommit                   | seconds              |

**Related Tasks:**

- task-009-pinia-stores -- Creates `useMockDataStore` that imports `DEFAULT_MOCK_DATA` from this task's `mockPresets.ts` and exposes refs for form binding
- task-011-terminal-preview -- Consumes mock data via store reactivity for live preview

<!-- NOTES:END -->
