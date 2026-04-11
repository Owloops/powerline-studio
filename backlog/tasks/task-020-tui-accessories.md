---
id: task-020-tui-accessories
title: Build TUI accessories panel (box style, title/footer, separators, segment templates)
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
  - task-019
---

## Description

<!-- DESCRIPTION:BEGIN -->

When the user selects the TUI style, the TUI Layout panel (task-019) shows grid/breakpoint editing. This task adds the remaining TUI configuration controls below the grid editor in that same panel, organized as collapsible sections:

1. **Box Style Picker** — A visual grid of 9 box-drawing presets (rounded, square, heavy, double, dashed, heavy-dashed, mixed, ascii, invisible). Each preset card renders a small 3-line box preview using its actual border characters in a monospace font, so users can see exactly what the borders look like. Clicking a card selects that preset.

2. **Title Bar Editor** — Two text inputs (left template, right template) for configuring the title bar content. The right template can be disabled via a toggle (sets `right: false`). Both inputs support `{token}` placeholders — a chip picker popover shows all available tokens (any key from the resolved segment data: `model`, `session.cost`, `context.pct`, `git.branch`, etc.) that can be inserted at the cursor position.

3. **Footer Editor** — Identical to the title bar editor but for the footer. Uses `TuiFooterConfig` (left/right strings, no `false` disable option for right).

4. **Separator Config** — Two small text inputs: column separator string (runtime default: two spaces) and divider character (runtime default: inherits from box style's horizontal character). These control `TuiGridConfig.separator.column` and `separator.divider`.

5. **Horizontal Padding** — A number input controlling `TuiGridConfig.padding.horizontal` (0-10 range).

6. **Segment Template Editor** — For each segment currently placed in the grid, an expandable section showing its template configuration: an ordered list of items (literal strings or `{part}` tokens from that segment's SEGMENT_PARTS), a gap number input, and a justify select (start/between). Users can add/remove/reorder items in the template.

All controls write to `useConfigStore` and trigger live preview updates.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Box Style Picker

- Display a "Default (auto)" option + all 9 BOX_PRESETS as selectable cards in a responsive grid (3 columns)
- "Default (auto)" card represents `box: undefined` — the renderer inherits charset-specific defaults (rounded for unicode, ascii for text). This is the initial state.
- Each preset card shows: preset name label + a 3-line monospace box preview using the preset's actual `topLeft`, `horizontal`, `topRight`, `vertical`, `bottomLeft`, `bottomRight` characters
- Preview format: `╭──╮` / `│  │` / `╰──╯` (using real chars from each preset)
- Selected card has a highlighted border (ring-2 ring-primary)
- Clicking a preset card sets `config.display.tui.box` to the preset name string; clicking "Default" sets it to `undefined`
- The store holds `TuiGridConfig.box` which accepts `string | Partial<BoxChars> | undefined`; this component sets preset name strings or `undefined`

### Title Bar Editor (TemplateEditor component)

- Two text inputs: "Left template" and "Right template"
- Each input shows a placeholder with the runtime default value (left: `{model}`, right: `claude-powerline`) so users see what the renderer uses when the field is unset
- **Unset vs empty semantics:** The renderer uses `left ?? "{model}"` and checks `right !== undefined` to apply defaults. An empty string `""` is NOT the same as `undefined` — it produces a blank title. Each input must have a "Reset to default" action (small button or clear icon) that removes the field from config (sets to `undefined`), distinct from clearing the text to `""`.
- Right template has a Switch toggle to disable (sets `right: false` in config). When toggling off, preserve the previous string value so toggling back on restores it.
- When disabled, the right input is hidden
- A "Insert token" button/popover next to each input shows available tokens as clickable chips
- Clicking a token chip inserts `{tokenName}` at the current cursor position (or replaces the current selection if text is selected)
- Available title/footer tokens: all `SegmentName` values (`model`, `session`, `context`, `block`, `today`, `weekly`, `git`, `dir`, `version`, `tmux`, `metrics`, `activity`, `env`) plus their part-qualified forms (`session.cost`, `git.branch`, etc.) sourced from SEGMENT_PARTS
- Note: `{...}` brace syntax is always treated as token placeholders by `resolveTitleToken()` — there is no escape syntax for literal braces. This is a known upstream limitation, not something to solve here.
- Writes to `config.display.tui.title.left` and `config.display.tui.title.right`
- Do NOT eagerly create the `title` object if the user hasn't customized it — leave it `undefined` until the user makes a change

### Footer Editor

- Reuses the same TemplateEditor component
- No disable toggle for the right side (TuiFooterConfig.right is `string | undefined`, not `false`)
- **Different semantics from title:** Footer uses truthy checks in the renderer (`footer?.left ? resolve : undefined`), so empty string `""` behaves the same as `undefined` (both produce no footer text). No "Reset to default" distinction needed for footer — just clear the field. There are no default footer strings.
- Do NOT eagerly create the `footer` object
- Writes to `config.display.tui.footer.left` and `config.display.tui.footer.right`

### Separator Config

- Two small text inputs side by side:
  - Column separator (label: "Column", placeholder: two spaces — the actual runtime default from `gridConfig.separator?.column ?? "  "`)
  - Divider character (label: "Divider", placeholder: varies by box style — the runtime default is `box.horizontal`, show this dynamically based on current box selection)
- Same unset semantics: each field has a "Reset to default" action to return to `undefined`
- Do NOT eagerly create the `separator` object
- Writes to `config.display.tui.separator.column` and `config.display.tui.separator.divider`

### Horizontal Padding

- shadcn NumberField, range 0-10, step 1
- Label: "Horizontal padding"
- Writes to `config.display.tui.padding.horizontal`

### Segment Template Editor

- Lists all unique segment refs currently placed in the active breakpoint's grid areas (passed as a prop from TuiLayoutPanel, since breakpoint selection is local UI state in task-019)
- Segment refs can be base names (`git`, `session`) or part-qualified refs (`git.branch`, `session.cost`) — both are valid keys in `tui.segments` and must be supported
- Each ref in a Collapsible section with the ref name as trigger
- Inside each section:
  - **Items list**: ordered list of template items. Each item is either a literal string or a `{part}` token reference. Show as a simple ordered list with remove buttons (no drag — use up/down arrow buttons for reorder to keep it accessible).
  - **Add item**: a button that opens a popover with two options — "Add token" (shows chips for the base segment's SEGMENT_PARTS) or "Add literal" (text input). For part-qualified refs like `git.branch`, scope tokens to the base segment (`git`).
  - **Token format in items**: Items use `{partName}` (e.g., `{icon}`, `{cost}`), NOT `{segment.partName}`. The renderer's `resolveTemplateItems()` automatically prefixes the base segment name when looking up resolved data. A non-`{...}` item is treated as a literal string.
  - **"Customize" initial state**: when creating a template for a base segment, seed items with the segment's default SEGMENT_PARTS tokens wrapped in `{...}` (e.g., `["{icon}", "{cost}", "{tokens}"]` for `session`). For part-qualified refs like `git.branch`, seed with just the referenced part: `["{branch}"]`.
  - **Gap**: NumberField (0-10, step 1, default 1). Store enforces non-negative.
  - **Justify**: Select with two options: "start" and "between"
- Writes to `config.display.tui.segments[segRef]` as `SegmentTemplate` objects
- When a segment has no template defined, show a muted "Default" label and a "Customize" button to create one
- Each template section has a "Reset to default" button that deletes the template entry (removes the key from `segments`)
- **Late-resolved refs excluded**: `context.bar`, `block.bar`, and `weekly.bar` are late-resolved by the renderer with width-dependent rendering — templates for these refs are bypassed. The editor should exclude these three refs from the template list (or show them as read-only "width-dependent, not templateable").
- Note: `tui.segments` is global (not per-breakpoint). The editor filters by active breakpoint for discoverability, but edits affect all breakpoints using that ref. Show a subtle note: "Applies to all breakpoints"

### General

- All sections rendered as collapsible sections within the TUI Layout panel (below the grid editor from task-019)
- Use shadcn-vue **Collapsible** (not Accordion) so multiple sections can be open simultaneously — users may want to see box preview while editing title templates
- All changes are reactive through useConfigStore and trigger immediate preview re-render
- Components use `<script setup lang="ts">` exclusively

### shadcn-vue Components Required

- Card (box style preset cards)
- Input (template text inputs, separator inputs)
- NumberField (padding, gap)
- Select (justify)
- Switch (title right disable toggle)
- Popover (token picker)
- Badge (token chips)
- Collapsible (section expand/collapse)
- Button (actions)
- Label (form labels)

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**

These components are additional sections rendered below the grid editor inside TuiLayoutPanel.vue (created by task-019). They are organized as collapsible sections using shadcn-vue Collapsible (multi-open, not Accordion). Each section is a self-contained component that reads/writes a specific slice of `useConfigStore`'s TUI grid config. Ephemeral UI state (open sections, popover state, remembered disabled-right text, caret/selection, add-literal drafts) stays in local component state, not the store.

The TemplateEditor is reused for both title and footer, parameterized via props for the differences (title supports `right: false`, footer does not).

The token picker pattern is shared between TemplateEditor (title/footer tokens) and SegmentTemplateEditor (per-segment part tokens). Extract a `TokenPicker.vue` component that accepts a list of available tokens and emits the selected token.

**Component Tree:**

```
TuiLayoutPanel.vue (task-019, already exists)
├── [Grid editor sections from task-019]
├── BoxStylePicker.vue          — 9-preset visual grid
├── TemplateEditor.vue          — title config (left/right inputs + token picker)
├── TemplateEditor.vue          — footer config (reuse, different props)
├── SeparatorConfig.vue         — column + divider text inputs
├── PaddingConfig.vue           — horizontal padding NumberField
├── SegmentTemplateEditor.vue   — per-segment template list
│   └── SegmentTemplateItem.vue — single segment's template (items, gap, justify)
└── TokenPicker.vue             — shared popover with clickable token chips
```

**Key Files:**

- `src/components/studio/tui/BoxStylePicker.vue` — Visual grid of 9 box style presets. Each preset rendered as a Card with monospace box preview. Reads BOX_PRESETS from `@owloops/claude-powerline/browser` (or local constant mirroring). Selected state bound to `configStore.tuiConfig.box`.
- `src/components/studio/tui/TemplateEditor.vue` — Reusable component for title/footer editing. Props: `modelValue: { left?: string; right?: string | false }`, `label: string`, `allowDisableRight: boolean`. Emits `update:modelValue`. Contains two Input fields, optional Switch for right disable, and TokenPicker popover for each input.
- `src/components/studio/tui/TokenPicker.vue` — Shared popover component. Props: `tokens: string[]`. Emits `select(token: string)`. Renders tokens as Badge chips in a Popover, grouped by segment name when dot-qualified. Triggered by a small button next to an input.
- `src/components/studio/tui/SeparatorConfig.vue` — Two Input fields for column separator and divider character. Bound to `configStore.tuiConfig.separator`.
- `src/components/studio/tui/PaddingConfig.vue` — Single NumberField for horizontal padding. Bound to `configStore.tuiConfig.padding.horizontal`.
- `src/components/studio/tui/SegmentTemplateEditor.vue` — Container listing all segments in the current breakpoint grid. Each gets a Collapsible section. Inside: SegmentTemplateItem.
- `src/components/studio/tui/SegmentTemplateItem.vue` — Single segment template form: items list (ordered, with add/remove), gap NumberField, justify Select. Uses TokenPicker scoped to that segment's SEGMENT_PARTS.

**Data Flow:**

1. All components read from and write to `useConfigStore` (Pinia) via dedicated store actions — no direct nested property writes, since unset/undefined semantics matter for title, footer, separator, box, and padding fields
2. `useConfigStore` holds the full `PowerlineConfig` including `display.tui` (`TuiGridConfig`)
3. Store actions needed for this task (add to task-009 or as additive mutations): `setTuiBox(value: string | undefined)`, `setTuiTitle(config: Partial<TuiTitleConfig> | undefined)`, `setTuiFooter(config: Partial<TuiFooterConfig> | undefined)`, `setTuiSeparator(config: Partial<{column: string; divider: string}> | undefined)`, `setTuiPadding(horizontal: number | undefined)`, `setTuiSegmentTemplate(segRef: string, template: SegmentTemplate | undefined)`. These actions must handle undefined correctly (delete the key/object rather than setting it to `{}`).
4. The preview pipeline watches the config store and re-renders on any change
5. `SegmentTemplateEditor` receives the list of segment refs from the active breakpoint as a prop (since breakpoint selection is local state in task-019's TuiLayoutPanel)

**Source Data Constants:**

The component needs these constants from claude-powerline:

- `BOX_PRESETS` (9 presets with BoxChars) — import from `@owloops/claude-powerline/browser`, do NOT mirror locally
- `SEGMENT_PARTS` (Record<SegmentName, string[]>) — import from `@owloops/claude-powerline/browser`, do NOT mirror locally
- Title/footer available tokens: all `SegmentName` values + all `segmentName.partName` combinations derived from SEGMENT_PARTS

**Token List Generation (computed):**

```ts
// For title/footer: all possible tokens
const titleTokens = computed(() => {
	const tokens: string[] = []
	for (const [segment, parts] of Object.entries(SEGMENT_PARTS)) {
		tokens.push(segment)
		for (const part of parts) {
			tokens.push(`${segment}.${part}`)
		}
	}
	return tokens
})

// For segment template: only that segment's parts
const segmentTokens = (segment: string) => SEGMENT_PARTS[segment as SegmentName] ?? []
```

**Patterns to Follow:**

- Visual preset selector pattern (similar to theme picker in task-014): grid of Cards with visual previews, selected state via ring highlight
- Token chip insertion: Popover with Badge chips, click inserts `{token}` at cursor position in associated Input
- Collapsible sections for organization within a panel
- Reusable sub-components with props/emits contracts (TemplateEditor, TokenPicker)
- shadcn-vue components for all form controls (no custom inputs)

**Dependencies:**

- Tasks: task-019 (TUI layout panel — provides the parent component these sections slot into)
- Tasks: task-009 (Pinia stores — provides useConfigStore)
- Libraries: shadcn-vue (Card, Input, NumberField, Select, Switch, Popover, Badge, Collapsible, Button, Label)
- Skills: shadcn-vue, reka-ui, vue-best-practices

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Ensure shadcn-vue components are installed: Card, Input, NumberField, Select, Switch, Popover, Badge, Collapsible, Button, Label
- [ ] Add store actions to useConfigStore for TUI accessory fields: `setTuiBox`, `setTuiTitle`, `setTuiFooter`, `setTuiSeparator`, `setTuiPadding`, `setTuiSegmentTemplate` — all must handle `undefined` correctly (delete key, don't set empty object)
- [ ] Create `TokenPicker.vue` — shared popover with clickable token chips (props: `tokens: string[]`, emits: `select(token)`); group dot-qualified tokens by base segment name
- [ ] Create `BoxStylePicker.vue` — "Default (auto)" option + 9 BOX_PRESETS as a 3-column grid of Cards, each showing preset name + 3-line monospace box preview using actual border chars; selected card gets ring highlight; "Default" sets `undefined`, presets set name string
- [ ] Create `TemplateEditor.vue` — reusable title/footer editor with left/right Input fields showing default placeholders, TokenPicker for inserting `{token}` at cursor/replacing selection, "Reset to default" per field (sets `undefined`), optional Switch to disable right side with value preservation (prop: `allowDisableRight`); do not eagerly create config objects
- [ ] Create `SeparatorConfig.vue` — two Input fields for column separator (placeholder: two spaces) and divider character (placeholder: dynamic from current box.horizontal); "Reset to default" per field; do not eagerly create separator object
- [ ] Create `PaddingConfig.vue` — NumberField (0-10) for horizontal padding with tooltip explaining it affects fr-column distribution in fit-content mode; bound to `configStore.tuiConfig.padding.horizontal`
- [ ] Create `SegmentTemplateItem.vue` — single segment template form: ordered items list with add/remove/up/down reorder, TokenPicker scoped to base segment's SEGMENT_PARTS (handles part-qualified refs like `git.branch` → base `git`), gap NumberField (0-10), justify Select (start/between), "Reset to default" button that deletes the template entry
- [ ] Create `SegmentTemplateEditor.vue` — receives `segmentRefs: string[]` prop from TuiLayoutPanel; lists each ref as a Collapsible with SegmentTemplateItem; "Customize" button seeds initial items from SEGMENT_PARTS; shows "Applies to all breakpoints" note; writes to `configStore.tuiConfig.segments`
- [ ] Integrate all sections into TuiLayoutPanel.vue (from task-019) as collapsible sections below the grid editor
- [ ] Verify all controls trigger live preview re-render via configStore reactivity; verify undefined/default states render correctly

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Source Data References (claude-powerline):**

- `src/utils/constants.ts` — BOX_PRESETS (9 presets), BOX_CHARS, BOX_CHARS_TEXT
- `src/tui/types.ts` — BoxChars, TuiGridConfig, TuiTitleConfig, TuiFooterConfig, SegmentTemplate, JustifyValue
- `src/tui/types.ts` — SEGMENT_PARTS (Record<SegmentName, string[]>) — defines available tokens per segment
- `src/tui/sections.ts` — resolveTitleToken() shows how `{token}` placeholders are resolved against resolvedData keys

**Title/Footer Token Resolution:**
The `resolveTitleToken` function resolves `{token}` placeholders by looking up the token in the `resolvedData` record (all segment keys like `model`, `session.cost`, `context.pct`, `git.branch`, etc.) with a hardcoded fallback for `{model}` → formatted model name. Any key from the resolved segment data is valid. There is no escape syntax for literal `{...}` — this is a known upstream limitation.

**Unset vs Empty Semantics (critical):**
The renderer applies defaults only when fields are `undefined`, not when they are empty strings. Specifically:

- `title.left ?? "{model}"` — empty string produces blank title, undefined produces `{model}`
- `title.right !== undefined ? right : "claude-powerline"` — empty string produces blank, undefined produces `claude-powerline`
- `footer.left` / `footer.right` — uses truthy check (`footer?.left ? ...`), so empty string `""` and `undefined` both produce no footer. No default footer strings exist. Simpler than title.
- `separator.column ?? "  "` — default is two spaces, NOT a box vertical character
- `separator.divider` — default is `box.horizontal` (dynamic based on box preset)
- `box: undefined` — inherits charset-specific default (rounded for unicode, ascii for text)
  Title inputs must distinguish between "user set this to empty" and "user wants the default". Footer inputs do not need this distinction.

**Segment Template Token Format:**
Items in `SegmentTemplate.items` use `{partName}` format (e.g., `{icon}`, `{cost}`), NOT `{segment.partName}`. The renderer's `resolveTemplateItems()` extracts the base segment from the `segRef` key and looks up `${baseSegment}.${partName}` in resolved data. Non-brace items are literal strings.

**Late-Resolved Segments:**
`context.bar`, `block.bar`, and `weekly.bar` are special-cased in the renderer's `lateResolve` function — they are rendered with width-dependent logic that bypasses template lookup. Templates defined for these refs have no effect. The editor must exclude them.

**BoxChars Custom Values:**
`TuiGridConfig.box` accepts `string | Partial<BoxChars> | undefined`. This task handles preset name strings (9 presets) and `undefined` (auto/default). Custom per-character box configuration is out of scope.

**Segment Templates are Global:**
`TuiGridConfig.segments` lives at the top level, not per-breakpoint. The editor shows segments from the active breakpoint for discoverability, but edits affect all breakpoints.

**Out of Scope:**

- `TuiGridConfig.terminalWidth` — not exposed here; preview terminal width is managed by `usePreviewStore` (task-012), not the TUI config panel
- Custom per-character BoxChars editing — only preset names are supported
- `TuiGridConfig.widthReserve` — already covered by task-019 global options

**Related Tasks:**

- task-019-tui-layout-editor — Parent panel that these sections integrate into
- task-009-pinia-stores — Provides useConfigStore with TUI grid config

<!-- NOTES:END -->
