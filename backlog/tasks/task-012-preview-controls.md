---
id: task-012-preview-controls
title: Add preview controls (terminal width, color mode, charset, background)
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

Create a compact toolbar of preview controls that sits directly below the terminal preview. Users adjust these controls to see how their powerline statusline looks under different terminal conditions — wider or narrower terminals, different color capabilities, ASCII-only environments, and dark vs light backgrounds. Every change updates the live preview instantly.

The toolbar contains four controls in a single horizontal row:

1. A width slider with a numeric readout showing the current column count (30–200, default 120)
2. A color mode dropdown to simulate different terminal color capabilities (Truecolor, 256-color, basic ANSI, or no color)
3. A charset dropdown to toggle between Unicode (Nerd Font symbols) and plain text fallback
4. A dark/light background toggle switch for the terminal preview area

Controls bind to two stores:

- `usePreviewStore` for terminal width, color mode, and dark/light background (preview-only settings)
- `useConfigStore` for charset (since charset is part of the exported config at `display.charset`)

When any value changes, the rendering service (task-010) reactively re-renders the statusline, and the terminal preview (task-011) updates its display.

<!-- DESCRIPTION:END -->

## Specification

<!-- SPECIFICATION:BEGIN -->

- **Component:** `src/components/studio/PreviewControls.vue`
- **Layout:** Single horizontal row (toolbar style), compact spacing, visually grouped with labeled controls
- **Terminal width slider:**
  - Range: 30–200
  - Default: 120 (matches usePreviewStore default from task-009)
  - Step: 1
  - Shows current value as a numeric label to the right of the slider (e.g., "120 cols")
  - Uses shadcn-vue `Slider` component (needs to be installed)
  - Bound to `usePreviewStore.terminalWidth`
- **Color mode select:**
  - Options: `truecolor` (label: "Truecolor"), `ansi256` (label: "256 Color"), `ansi` (label: "Basic ANSI"), `none` (label: "No Color")
  - Default: `truecolor`
  - Uses shadcn-vue `Select` component (needs to be installed)
  - Bound to `usePreviewStore.colorMode`
  - Note: `"none"` is a preview-only rendering mode. The rendering service (task-010) handles mapping this to the renderer — it does NOT map directly to `display.colorCompatibility` (which only supports `"auto" | "ansi" | "ansi256" | "truecolor"`)
- **Charset select:**
  - Options: `unicode` (label: "Unicode"), `text` (label: "ASCII")
  - Default: `unicode`
  - Uses shadcn-vue `Select` component
  - Bound to `useConfigStore` via `config.display.charset` (charset is part of the exported config, not preview-only state)
  - Maps directly to claude-powerline's `display.charset` field
- **Dark/light background toggle:**
  - Uses shadcn-vue `Switch` component (already installed)
  - Label: "Dark" when checked (default), "Light" when unchecked
  - Bound to `usePreviewStore.darkBackground`
  - Controls the terminal preview `<pre>` background color (dark = terminal dark bg, light = terminal light bg)
- **Reactivity:** Controls use `v-model` binding to store refs (preview store for width/color/background, config store for charset); changes propagate immediately to the rendering pipeline
- **Accessibility:** Each control has an associated `Label` (shadcn-vue, already installed) with proper `for`/`id` linkage
- **Responsive:** On narrow viewports, controls wrap to a second row rather than overflowing

<!-- SPECIFICATION:END -->

## Design

<!-- DESIGN:BEGIN -->

**Architecture Approach:**

Single Vue SFC using `<script setup lang="ts">`. The component imports shadcn-vue controls (Slider, Select, Switch, Label) and binds them to two stores:

- `usePreviewStore` (via `storeToRefs`) for `terminalWidth`, `colorMode`, `darkBackground`
- `useConfigStore` (via `storeToRefs`) for `config.display.charset`

No FormWerk integration needed — these are reactive settings controls, not a submittable form. The only local state is a computed wrapper to bridge the Slider's `number[]` model to the store's `number` ref.

**Layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Width: [──────●──────] 120 cols  │  Color: [Truecolor ▾]      │
│  Charset: [Unicode ▾]            │  Background: ○ Dark         │
└──────────────────────────────────────────────────────────────────┘
```

Implemented as a flex-wrap row with `gap-x-6 gap-y-3` between control groups. Each control group is a flex row with a Label and the control. The entire bar has `px-4 py-2` padding, a subtle top border (`border-t border-border`), and matching background to the surrounding panel (`bg-muted/50`).

**Mounting:** The component is placed directly below `TerminalPreview.vue` in the studio page layout (defined in task-008). The parent page/layout component imports both `TerminalPreview` and `PreviewControls` and stacks them vertically.

**Component Structure:**

```vue
<script setup lang="ts">
import { Slider } from '@/components/ui/slider'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const previewStore = usePreviewStore()
const configStore = useConfigStore()
const { terminalWidth, colorMode, darkBackground } = storeToRefs(previewStore)

// Slider needs number[] model — bridge to store's number ref
const sliderModel = computed({
	get: () => [terminalWidth.value],
	set: (val: number[]) => {
		terminalWidth.value = val[0]
	},
})

const COLOR_MODE_OPTIONS = [
	{ value: 'truecolor', label: 'Truecolor' },
	{ value: 'ansi256', label: '256 Color' },
	{ value: 'ansi', label: 'Basic ANSI' },
	{ value: 'none', label: 'No Color' },
] as const

const CHARSET_OPTIONS = [
	{ value: 'unicode', label: 'Unicode' },
	{ value: 'text', label: 'ASCII' },
] as const
</script>

<template>
	<div
		class="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border bg-muted/50 px-4 py-2"
	>
		<!-- Width slider group -->
		<div class="flex items-center gap-2">
			<Label>Width</Label>
			<Slider v-model="sliderModel" :min="30" :max="200" :step="1" class="w-32" />
			<span class="text-xs text-muted-foreground tabular-nums w-12">{{ terminalWidth }} cols</span>
		</div>

		<!-- Color mode select group -->
		<div class="flex items-center gap-2">
			<Label>Color</Label>
			<Select v-model="colorMode">
				<SelectTrigger class="h-8 w-[130px]">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem v-for="opt in COLOR_MODE_OPTIONS" :key="opt.value" :value="opt.value">
						{{ opt.label }}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<!-- Charset select group -->
		<div class="flex items-center gap-2">
			<Label>Charset</Label>
			<Select
				:model-value="configStore.config.display.charset"
				@update:model-value="configStore.setCharset"
			>
				<SelectTrigger class="h-8 w-[110px]">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem v-for="opt in CHARSET_OPTIONS" :key="opt.value" :value="opt.value">
						{{ opt.label }}
					</SelectItem>
				</SelectContent>
			</Select>
		</div>

		<!-- Dark/light toggle group -->
		<div class="flex items-center gap-2">
			<Label>Background</Label>
			<Switch v-model="darkBackground" />
			<span class="text-xs text-muted-foreground">{{ darkBackground ? 'Dark' : 'Light' }}</span>
		</div>
	</div>
</template>
```

**Store Contracts:**

From `usePreviewStore` (task-009) — preview-only settings:

- `terminalWidth: Ref<number>` — default 120, range 30–200
- `colorMode: Ref<'truecolor' | 'ansi256' | 'ansi' | 'none'>` — default `'truecolor'`
- `darkBackground: Ref<boolean>` — default `true`

From `useConfigStore` (task-009) — exported config:

- `config.display.charset: 'unicode' | 'text'` — default `'unicode'`
- `setCharset(charset)` mutation

Note: `usePreviewStore` exposes a read-only `charset` computed that derives from the config store. The controls write to the config store directly for charset.

**Slider model note:** shadcn-vue Slider uses `v-model` with `number[]` (to support range sliders). A computed get/set wrapper bridges the store's scalar `number` ref to the Slider's array model.

**Switch model note:** The local `Switch.vue` wraps reka-ui's `SwitchRoot` which uses standard `v-model` (not `v-model:checked`). Bind with `v-model="darkBackground"`.

**"No Color" mode note:** `"none"` is valid for `usePreviewStore.colorMode` but does NOT map directly to `display.colorCompatibility` (which only allows `"auto" | "ansi" | "ansi256" | "truecolor"`). The rendering service (task-010) is responsible for handling this mapping when invoking the renderer.

**Key Files:**

- `src/components/studio/PreviewControls.vue` — the preview controls toolbar component (new)
- `src/stores/preview.ts` — usePreviewStore (from task-009, consumed for terminalWidth/colorMode/darkBackground)
- `src/stores/config.ts` — useConfigStore (from task-009, consumed for charset via setCharset)
- `src/components/ui/slider/` — shadcn-vue Slider (to be installed)
- `src/components/ui/select/` — shadcn-vue Select (to be installed)
- `src/components/ui/switch/Switch.vue` — shadcn-vue Switch (already installed)
- `src/components/ui/label/Label.vue` — shadcn-vue Label (already installed)

**Patterns to Follow:**

- `<script setup lang="ts">` exclusively
- shadcn-vue component composition (Label + control pairs)
- `storeToRefs()` for reactive store property access
- Tailwind CSS 4 for all styling, `cn()` for conditional classes
- No FormWerk — these are reactive controls, not a submittable form
- Use `vp dlx` (not `pnpm dlx`) for installing shadcn-vue components per VitePlus conventions

**Dependencies:**

- Tasks: task-009 (Pinia stores — provides usePreviewStore + useConfigStore), task-011 (terminal preview — provides visual context)
- Components to install: `vp dlx shadcn-vue@latest add slider select`
- Skills: shadcn-vue, reka-ui, vue-best-practices

<!-- DESIGN:END -->

## TODO

<!-- TODO:BEGIN -->

- [ ] Install missing shadcn-vue components: `vp dlx shadcn-vue@latest add slider select`
- [ ] Create `src/components/studio/PreviewControls.vue` with `<script setup lang="ts">`
- [ ] Import shadcn-vue Slider, Select (SelectContent, SelectItem, SelectTrigger, SelectValue), Switch, and Label
- [ ] Connect to `usePreviewStore` via `storeToRefs()` for `terminalWidth`, `colorMode`, `darkBackground`
- [ ] Connect to `useConfigStore` for charset (read `config.display.charset`, write via `setCharset`)
- [ ] Build terminal width slider group: Label + Slider (min=30, max=200, step=1) + numeric readout showing `{{ value }} cols`
- [ ] Create computed get/set wrapper to bridge store's scalar `terminalWidth` (number) to Slider's array model (number[])
- [ ] Build color mode select group: Label + Select with options Truecolor/256 Color/Basic ANSI/No Color, bound to `colorMode`
- [ ] Build charset select group: Label + Select with options Unicode/ASCII, bound to `configStore.config.display.charset` / `configStore.setCharset`
- [ ] Build dark/light background toggle group: Label + Switch (using `v-model`, not `v-model:checked`) + text indicator ("Dark"/"Light")
- [ ] Style as compact horizontal toolbar with `flex flex-wrap`, consistent gaps, `border-t border-border bg-muted/50 px-4 py-2`
- [ ] Verify all controls reactively update their respective stores and trigger preview re-rendering
- [ ] Test responsive wrapping on narrow viewports

<!-- TODO:END -->

## Notes

<!-- NOTES:BEGIN -->

**Review decisions (2026-04-11, external review via codex):**

1. **Charset ownership:** `charset` is part of the exported config (`display.charset`), not preview-only state. Task-009 correctly defines it in `useConfigStore` with a read-only computed in `usePreviewStore`. The controls write to `useConfigStore.setCharset()` directly.

2. **"No Color" mode:** `"none"` is valid for `usePreviewStore.colorMode` but does NOT exist in claude-powerline's `display.colorCompatibility` type (which allows `"auto" | "ansi" | "ansi256" | "truecolor"`). The rendering service (task-010) must handle this mapping — when colorMode is `"none"`, it strips all color from the rendered output rather than passing `"none"` to the upstream renderer.

3. **Terminal width default:** 120, not 80. Aligned with task-009's `usePreviewStore` definition.

4. **Switch v-model:** Local `Switch.vue` wraps reka-ui `SwitchRoot` which uses standard `v-model` (modelValue), not `v-model:checked`.

5. **Slider model bridging:** shadcn-vue Slider expects `number[]` for v-model. A computed get/set wrapper bridges the store's scalar `number` ref.

6. **CLI convention:** Use `vp dlx` instead of `pnpm dlx` per VitePlus toolchain conventions.

**Related Tasks:**

- task-009-pinia-stores — provides usePreviewStore + useConfigStore consumed here
- task-010-rendering-service — handles colorMode-to-colorCompatibility mapping
- task-011-terminal-preview — visual context; PreviewControls mounts below it

<!-- NOTES:END -->
