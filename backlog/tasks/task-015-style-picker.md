---
id: task-015-style-picker
title: Build style picker with visual comparison, padding, and auto-wrap
status: 'Done'
created_date: '2026-04-11 09:15'
updated_date: '2026-04-11 10:25'
parent: null
subtasks:
dependencies:
  - task-008
  - task-009
  - task-011
---

## Description

<!-- DESCRIPTION:BEGIN -->

The Style panel is a sidebar configuration section in Powerline Studio that lets users choose how their statusline looks structurally. claude-powerline supports 4 distinct rendering styles, and each produces visually different output:

- **Minimal** — colored segments sit side-by-side with no separator arrows; clean and simple
- **Powerline** — classic arrow separators (`` ) between segments; the iconic vim-statusline look
- **Capsule** — each segment is wrapped in rounded caps (`left,` right) with spacing between them; pill-shaped segments
- **TUI** — a completely different rendering mode using box-drawing characters to create a panel/grid layout; requires its own dedicated layout editor

The panel shows these 4 styles as visual cards, each containing a small ASCII/styled preview of what that style looks like with sample segments. Users click a card to select it. Below the style cards, two additional controls adjust rendering behavior:

1. **Padding stepper** (0–3) — controls the number of space characters inside each segment on both sides of the text content. This directly maps to `config.display.padding` used in `formatSegment()`.
2. **Auto-wrap toggle** — when enabled, segments automatically wrap to a new line when they exceed the terminal width, rather than truncating. Maps to `config.display.autoWrap`.

When TUI is selected, an info note appears directing users to the dedicated "TUI Layout" sidebar panel for grid/breakpoint/box configuration (tasks 019–020).

All changes update `useConfigStore` reactively and the live terminal preview re-renders immediately.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

### Components

- **`StylePanel.vue`** — top-level panel rendered when sidebar "Style" section is active. Contains the style card grid, padding control, and auto-wrap toggle. Reads/writes `useConfigStore`.
- **`StyleCard.vue`** — individual selectable card showing a style name, description, and a mini ASCII preview. Highlights when selected. Presentational only — selection is handled by the parent `RadioGroupItem` via `as-child`.

### Style Cards

- 4 cards in a 2×2 grid layout: minimal, powerline, capsule, tui
- Each card contains:
  - Style name (title)
  - One-line description (subtitle)
  - Mini-preview: a small monospace rendering showing 2–3 sample segments in that style's format using static colored spans (not the real renderer — pure HTML/CSS approximation for performance and simplicity)
- Selected card has a distinct visual state (primary border/ring, subtle background tint)
- Cards use shadcn-vue `Card` component for structure
- Selection implemented via reka-ui `RadioGroupRoot`/`RadioGroupItem` primitives directly (NOT the shadcn-vue `RadioGroupItem` wrapper, which has `size-4 rounded-full aspect-square` classes that would break card layout when used with `as-child`)
- RadioGroup uses `orientation="horizontal"` since it's a 2×2 grid — arrow keys provide linear roving focus through cards in DOM order (left/right and up/down both cycle through the 4 options). No custom 2D grid keyboard mapping needed.
- Value bound to `configStore.display.style` — use `configStore.setStyle(value)` mutation for changes, not direct assignment, to keep clamping/validation centralized in the store

### Mini-Preview Design

Each card's preview is a small `<div>` with `font-mono text-xs` showing 2–3 fake segments:

| Style     | Preview Representation                                                         |
| --------- | ------------------------------------------------------------------------------ |
| minimal   | `[dir] [git] [model]` — colored spans side by side, no separators              |
| powerline | `[dir][git][model]` — colored spans with `` arrow chars between them           |
| capsule   | `[dir] [git] [model]` — each segment wrapped in ` ` rounded caps, spaced apart |
| tui       | Box-drawing characters forming a mini panel with segment names inside cells    |

Colors for the preview segments use fixed hardcoded dark-theme hex values (e.g. `#3b82f6` directory blue, `#22c55e` git green, `#a855f7` model purple). They do NOT reactively update with the user's selected theme — the live terminal preview at the top serves that purpose. Fixed colors keep the card implementation simple and independent of the theme store.

### Padding Control

- shadcn-vue `NumberField` component (must be installed: `pnpm dlx shadcn-vue@latest add number-field`)
- Label: "Padding"
- Min: 0, Max: 3, Step: 1
- Bound to `configStore.display.padding` — use `configStore.setPadding(n)` mutation for changes (validates 0–3 range in store)
- Shows increment/decrement buttons (stepper style)
- Displays description text: "Spaces inside each segment"
- **Hidden (`v-if`) when TUI style is selected** — TUI uses its own grid-level padding (`gridConfig.padding.horizontal`), not `display.padding`

### Auto-Wrap Toggle

- shadcn-vue `Switch` component + `Label`
- Label: "Auto-wrap"
- Binding: use `v-model:checked` (reka-ui Switch uses `:checked` / `@update:checked` model) — call `configStore.setAutoWrap(value)` on change
- Description text: "Wrap segments to new lines when they exceed terminal width"
- **Hidden (`v-if`) when TUI style is selected** — TUI rendering uses a completely separate layout engine (`renderTuiPanel`) that does not use `autoWrap`

### TUI Info Note

- When `configStore.display.style === 'tui'`, show an `Alert` component (shadcn-vue, variant info/default) below the style cards
- Text: "TUI style uses a grid layout. Configure breakpoints, columns, and box styles in the TUI Layout panel."
- Include a button/link to navigate to the TUI Layout sidebar panel (calls `editorStore.setActivePanel('tui')`)
- NOTE: task-009 defines panel IDs as `'tui'` (not `'tui-layout'`). If task-008 is implemented first with `'tui-layout'`, this will need reconciliation. Follow whatever task-009 canonicalizes.

### Store Integration

- Reads: `configStore.display.style`, `configStore.display.padding`, `configStore.display.autoWrap`, `configStore.isTuiStyle` (computed)
- Writes: via store mutations only — `configStore.setStyle()`, `configStore.setPadding()`, `configStore.setAutoWrap()`. Do NOT write directly to `configStore.config.display.*` — mutations centralize validation (e.g. padding clamping).
- Navigation: `editorStore.setActivePanel('tui')` for TUI info note link
- On any change, the preview auto-updates via the reactive rendering pipeline (task-010/011)

### Acceptance Criteria

- [ ] All 4 styles render as selectable cards with visually distinct mini-previews
- [ ] Clicking a card updates `configStore.display.style` and the terminal preview re-renders
- [ ] Keyboard navigation works between style cards (arrow keys, space/enter to select)
- [ ] Padding stepper constrains input to 0–3 integer range
- [ ] Auto-wrap toggle updates `configStore.display.autoWrap`
- [ ] TUI info note appears only when TUI style is selected
- [ ] TUI info note links to TUI Layout panel
- [ ] All controls are labeled and accessible (proper ARIA)
- [ ] Panel uses consistent styling with other sidebar panels (Theme, Segments, etc.)

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

### Architecture Approach

StylePanel is a sidebar panel component, similar in structure to the ThemePanel (task-014). It is rendered conditionally when `editorStore.activePanel === 'style'`. The panel composes a RadioGroup of StyleCard components for style selection, plus standalone form controls for padding and auto-wrap.

The mini-previews inside each StyleCard are pure HTML/CSS — they do NOT use the real claude-powerline renderer. This avoids importing the rendering pipeline into a small UI component and keeps the cards fast. The previews use colored `<span>` elements inside a `font-mono` container, with appropriate separator characters (Unicode powerline glyphs, box-drawing chars) rendered inline.

### Component Hierarchy

```
StylePanel.vue
├── RadioGroupRoot (reka-ui direct import — NOT shadcn-vue wrapper)
│   ├── RadioGroupItem as-child → StyleCard.vue (minimal)
│   ├── RadioGroupItem as-child → StyleCard.vue (powerline)
│   ├── RadioGroupItem as-child → StyleCard.vue (capsule)
│   └── RadioGroupItem as-child → StyleCard.vue (tui)
├── NumberField (shadcn-vue) — padding stepper (hidden when TUI)
├── Switch + Label (shadcn-vue) — auto-wrap toggle (hidden when TUI)
└── Alert (shadcn-vue) — TUI info note (shown only when TUI)
```

### Key Files

| File                                          | Purpose                                                                                |
| --------------------------------------------- | -------------------------------------------------------------------------------------- |
| `src/components/studio/panels/StylePanel.vue` | Panel component with style grid, padding, auto-wrap                                    |
| `src/components/studio/StyleCard.vue`         | Individual style card with mini-preview                                                |
| `src/components/ui/number-field/*.vue`        | NumberField component (needs shadcn-vue install)                                       |
| `src/stores/config.ts`                        | `useConfigStore` — reads/writes `display.style`, `display.padding`, `display.autoWrap` |
| `src/stores/editor.ts`                        | `useEditorStore` — `activePanel` for TUI Layout navigation                             |

### StyleCard Props

```ts
interface StyleCardProps {
	value: 'minimal' | 'powerline' | 'capsule' | 'tui'
	title: string
	description: string
}
```

The mini-preview content is determined by the `value` prop — each style renders its own preview variant inside the card. The preview is a slot-free internal rendering, not a passed-in slot.

### Style Preview Data

Static preview data defined in StylePanel (not imported from stores):

```ts
const styles = [
	{
		value: 'minimal',
		title: 'Minimal',
		description: 'Clean, no separators',
	},
	{
		value: 'powerline',
		title: 'Powerline',
		description: 'Classic arrow separators',
	},
	{
		value: 'capsule',
		title: 'Capsule',
		description: 'Rounded pill segments',
	},
	{
		value: 'tui',
		title: 'TUI',
		description: 'Box-drawn grid panels',
	},
] as const
```

### Mini-Preview Implementation

Each StyleCard renders a preview `<div>` with `font-mono text-[10px] leading-tight` containing hardcoded colored spans that approximate the style. The `font-mono` utility MUST map to the Nerd Font loaded in task-008 (e.g. `'FiraCode Nerd Font', monospace`) for PUA glyphs to render.

Preview segments use 3 representative labels: "~/project", "main ✓", "◆ Sonnet" with colors approximating the dark theme palette (blue `#3b82f6`, green `#22c55e`, purple `#a855f7`).

**Important: Powerline glyph coloring.** Terminal powerline arrows work by setting the glyph's foreground to the _previous_ segment's background color, and the glyph's background to the _next_ segment's background color. The mini-previews must replicate this:

- **minimal**: 3 colored `<span>`s side by side, no gap/separator
  ```html
  <span style="background:#3b82f6;color:#fff"> ~/project </span>
  <span style="background:#22c55e;color:#fff"> main ✓ </span>
  <span style="background:#a855f7;color:#fff"> ◆ Sonnet </span>
  ```
- **powerline**: Arrow glyph `\uE0B0` between segments — arrow fg = previous segment bg, arrow bg = next segment bg (or transparent for last):
  ```html
  <span style="background:#3b82f6;color:#fff"> ~/project </span>
  <span style="color:#3b82f6;background:#22c55e">&#xE0B0;</span>
  <span style="background:#22c55e;color:#fff"> main ✓ </span>
  <span style="color:#22c55e;background:#a855f7">&#xE0B0;</span>
  <span style="background:#a855f7;color:#fff"> ◆ Sonnet </span>
  <span style="color:#a855f7">&#xE0B0;</span>
  ```
- **capsule**: Each segment wrapped with `\uE0B6` (left cap) and `\uE0B4` (right cap) — cap fg = segment bg, cap bg = transparent:
  ```html
  <span style="color:#3b82f6">&#xE0B6;</span>
  <span style="background:#3b82f6;color:#fff">~/project</span>
  <span style="color:#3b82f6">&#xE0B4;</span>
  <!-- gap -->
  <span style="color:#22c55e">&#xE0B6;</span>
  <span style="background:#22c55e;color:#fff">main ✓</span>
  <span style="color:#22c55e">&#xE0B4;</span>
  ```
- **tui**: A small box using `╭─╮│ │╰─╯` box chars with segment text inside (no Nerd Font glyphs needed, standard Unicode)

### RadioGroup Integration

Import reka-ui primitives directly (NOT the shadcn-vue `RadioGroupItem` wrapper which has `size-4 rounded-full` classes):

```vue
<script setup lang="ts">
import { RadioGroupRoot, RadioGroupItem } from 'reka-ui'
</script>

<template>
	<RadioGroupRoot
		:model-value="configStore.display.style"
		@update:model-value="configStore.setStyle($event)"
		orientation="horizontal"
		class="grid grid-cols-2 gap-3"
	>
		<RadioGroupItem v-for="s in styles" :key="s.value" :value="s.value" as-child>
			<StyleCard v-bind="s" />
		</RadioGroupItem>
	</RadioGroupRoot>
</template>
```

StyleCard uses `data-[state=checked]` for selected styling (ring, background tint) since RadioGroupItem passes this attribute when used with `as-child`. The `orientation="horizontal"` prop ensures arrow-key navigation cycles linearly through all 4 cards in DOM order.

### Padding NumberField

Uses shadcn-vue NumberField (reka-ui `NumberFieldRoot` under the hood):

```vue
<NumberField
	:model-value="configStore.display.padding"
	@update:model-value="configStore.setPadding($event)"
	:min="0"
	:max="3"
	:step="1"
>
  <!-- label, input, increment/decrement buttons -->
</NumberField>
```

### Patterns to Follow

- `<script setup lang="ts">` exclusively
- Tailwind CSS 4 for all styling
- `cn()` for conditional class merging
- reka-ui `RadioGroupRoot`/`RadioGroupItem` directly (not shadcn-vue wrapper); shadcn-vue Card, NumberField, Switch, Alert, Label components
- Store access via `useConfigStore()` and `useEditorStore()` (auto-imported)
- No Options API, no CSS modules, no inline styles

### Dependencies

**Tasks:**

- task-008 (Nerd Font + page layout) — Nerd Font must be loaded for powerline/capsule arrow glyphs in mini-previews; page shell provides sidebar panel rendering
- task-009 (Pinia stores) — must exist: `useConfigStore` (with `setStyle`, `setPadding`, `setAutoWrap`, `isTuiStyle`), `useEditorStore` (with `setActivePanel`)
- task-011 (terminal preview) — must exist for live preview updates on config changes

**Components to install:**

- `pnpm dlx shadcn-vue@latest add number-field` — NumberField not yet in project

**Skills:** shadcn-vue, reka-ui, ux-design, vue-best-practices

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Install shadcn-vue NumberField component (`pnpm dlx shadcn-vue@latest add number-field`)
- [ ] Create `src/components/studio/StyleCard.vue` with props (`value`, `title`, `description`), mini-preview rendering for each of the 4 styles, and `data-[state=checked]` selected styling
- [ ] Create `src/components/studio/panels/StylePanel.vue`:
  - [ ] RadioGroup using reka-ui `RadioGroupRoot`/`RadioGroupItem` directly (NOT shadcn-vue wrapper — its `size-4 rounded-full` classes break card layout with `as-child`), `orientation="horizontal"`, 2×2 grid, using `:model-value` / `@update:model-value` with `configStore.setStyle()`
  - [ ] NumberField (shadcn-vue) for padding stepper, min 0 / max 3 / step 1, using `:model-value` / `@update:model-value` with `configStore.setPadding()`, label "Padding", description "Spaces inside each segment". Hidden (`v-if="!configStore.isTuiStyle"`) — TUI has its own padding.
  - [ ] Switch (`v-model:checked`) + Label for auto-wrap toggle, calling `configStore.setAutoWrap()`, with description "Wrap segments to new lines when they exceed terminal width". Hidden (`v-if="!configStore.isTuiStyle"`) — TUI doesn't use autoWrap.
  - [ ] Conditional Alert (shadcn-vue) when `configStore.isTuiStyle` is true, with info text and button to navigate to TUI Layout panel via `editorStore.setActivePanel('tui')`
- [ ] Verify keyboard navigation between style cards (arrow keys, space/enter to select)
- [ ] Verify live terminal preview updates on style, padding, and auto-wrap changes
- [ ] Verify TUI info note appears/disappears correctly on style change

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Style rendering differences (from claude-powerline source):**

- `initializeSymbols()` in `powerline.ts:658` — style determines which symbols are used: minimal gets empty `right` arrow, capsule gets rounded left/right caps, powerline gets standard arrow
- `formatSegment()` in `powerline.ts:862` — capsule wraps content with `left`+`right` rounded caps and adds space between segments; powerline/minimal use arrow separators (or none for minimal)
- `config.display.padding` is used in `formatSegment()` as `" ".repeat(padding ?? 1)` on both sides of segment text
- `config.display.autoWrap` triggers `generateAutoWrapStatusline()` which measures segment widths against terminal width and wraps to new lines
- TUI style uses a completely separate rendering path via `renderTuiPanel()` with box-drawing characters

**Mini-preview approach:**
The mini-previews are intentionally NOT using the real renderer — they are pure HTML/CSS approximations. This keeps the cards lightweight and avoids coupling the style picker to the rendering service. The real live preview at the top of the page shows the actual rendered output.

**Review findings addressed (external review via Codex):**

- Added task-008 as formal dependency (Nerd Font required for powerline glyphs in mini-previews)
- Changed all store writes to use mutations (`setStyle`, `setPadding`, `setAutoWrap`) instead of direct assignment — validation/clamping centralized in store
- Clarified Switch binding as `v-model:checked` (reka-ui Switch convention)
- Specified `orientation="horizontal"` on RadioGroup for linear roving focus across 2×2 grid
- Fixed mini-preview colors to use hardcoded dark-theme hex values (not reactive theme CSS vars)
- Made StyleCard purely presentational (removed "emits selection event" — RadioGroupItem `as-child` handles selection)
- Noted panel ID discrepancy: task-008 uses `'tui-layout'`, task-009 defines `'tui'` — follow task-009 canonical IDs

**Review findings addressed (external review via Gemini):**

- Use reka-ui `RadioGroupRoot`/`RadioGroupItem` directly instead of shadcn-vue wrapper — the wrapper has `size-4 rounded-full aspect-square` classes that break card layout when used with `as-child`
- Added explicit HTML structure for powerline glyph coloring — arrow fg must match previous segment's bg, arrow bg must match next segment's bg (terminal convention)
- Hide padding stepper and auto-wrap toggle when TUI is selected — TUI uses `renderTuiPanel()` which has its own padding (`gridConfig.padding.horizontal`) and does not use `autoWrap`
- Note: `font-mono` must map to the Nerd Font for PUA glyphs to render in mini-previews

**Related Tasks:**

- task-008 — Page layout shell, Nerd Font setup, sidebar panel rendering
- task-009 — Pinia stores (useConfigStore, useEditorStore)
- task-011 — Terminal preview component
- task-014 — Theme picker (similar card-grid pattern, coordinate visual consistency)
- task-019/020 — TUI Layout panels (linked from TUI info note)

<!-- NOTES:END -->
