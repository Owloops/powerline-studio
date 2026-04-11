---
name: eui-components
description: ElectricityUI component library reference for Enerity Trade. Vue 3 components built on Reka UI with TailwindCSS 4, distributed as a shadcn-vue custom registry. Covers architecture, all components (Alert, Combobox, DateInput, FlagIcon, Modal, Notification, NumberMask, Select, DataTable), registry configuration, and programmatic APIs. Use when working with any ElectricityUI component.
---

# ElectricityUI Component Library

Vue 3 component library for Enerity Trade, built on Reka UI (Radix for Vue) primitives with TailwindCSS 4 and shadcn-vue theming. Distributed primarily as a **shadcn-vue custom registry** — components are installed into your project and fully owned. UMD bundle (`window.EUI`) still available for legacy consumers.

## Quick Reference

| Component                                  | File                | Use For                                                       |
| ------------------------------------------ | ------------------- | ------------------------------------------------------------- |
| [Architecture](components/architecture.md) | --                  | Library structure, distribution, build process, design tokens |
| [Alert](components/alert.md)               | Alert.vue           | Inline feedback, validation messages, page-level status       |
| [FlagIcon](components/flagicon.md)         | FlagIcon.vue        | Country flag icons (249 ISO 3166-1 codes) from SVG sprite     |
| [Combobox](components/combobox.md)         | CustomCombobox.vue  | Searchable dropdowns (>20 items), filtered selection          |
| [DateInput](components/dateinput.md)       | DateInput.vue       | Date/time entry with segmented fields, calendar popup         |
| [Modal](components/modal.md)               | Modal.vue           | Dialog windows, confirmations, form dialogs                   |
| [Notification](components/notification.md) | Notification.vue    | Toast messages, CRUD feedback, global status                  |
| [NumberMask](components/numbermask.md)     | MaskNumberInput.vue | Locale-aware numeric input, currency, percentages             |
| [Select](components/select.md)             | CustomSelect.vue    | Simple dropdowns (<20 items), static choices                  |
| [DataTable](components/datatable.md)       | DataTable.vue       | Data tables with sort, filter, pagination, export             |

## Registry Configuration

### Consumer project (`components.json`)

The `@electricity-ui` registry namespace must match what the registry's `registryDependencies` use internally. The `"style": "eui"` field matches the `registry/eui/` source directory convention.

```json
{
	"style": "eui",
	"registries": {
		"@electricity-ui": {
			"url": "http://localhost:5050/r/{name}.json"
		}
	}
}
```

The `{name}` placeholder is replaced with the component name (e.g., `alert`, `custom-combobox`). For production, replace `localhost:5050` with the hosted registry URL.

### Registry source (`electricity-ui/registry.json`)

Components are organized under `registry/eui/` with `registry.json` defining each item's files, dependencies, and targets.

**Critical: every file entry must include a `target` field** using the `~/` prefix to specify the exact install path. Without targets, the shadcn-vue CLI has a bug where it fails to strip the style directory prefix from paths when resolving cross-registry `registryDependencies`, causing files to land in `src/components/eui/` instead of `src/components/`.

```json
{
	"name": "custom-combobox",
	"type": "registry:ui",
	"dependencies": ["reka-ui"],
	"registryDependencies": ["@electricity-ui/combobox"],
	"files": [
		{
			"path": "registry/eui/CustomCombobox/CustomCombobox.vue",
			"type": "registry:component",
			"target": "~/src/components/CustomCombobox/CustomCombobox.vue"
		}
	]
}
```

Target path rules:

- **`~/` prefix is required** — it maps to the project root directly, bypassing the CLI's broken `src/` stripping logic
- **Components**: `"target": "~/src/components/ComponentName/File.vue"`
- **Composables/hooks**: `"target": "~/src/composables/file.ts"` (or `"~/src/composables/table/file.ts"` for nested)
- Without `~/`, the CLI strips `src/` from the target and places files at the project root (e.g., `./components/` instead of `./src/components/`)

### Building the registry

```bash
cd electricity-ui
vp dlx shadcn-vue@latest build    # Outputs to public/r/*.json
```

### Serving the registry locally

The registry needs to be served over HTTP for the CLI to fetch it:

```bash
cd electricity-ui
npx serve dist -l 5050 --cors     # Serve on port 5050
# Copy built files: cp -r public/r dist/r
```

## Installing Components

### Via direct URL (recommended)

Install individual components using their full registry URL. Always run from the **consuming project directory** (not the registry project):

```bash
# Single component
pnpm dlx shadcn-vue@latest add "http://localhost:5050/r/alert.json" --yes

# Components with dependencies are resolved automatically
pnpm dlx shadcn-vue@latest add "http://localhost:5050/r/data-table.json" --yes
```

### Via shadcn MCP server

The shadcn MCP server can resolve `@electricity-ui/` namespaced names if the registry is configured in `components.json`:

```bash
# Use MCP tools: list_items_in_registries, get_add_command_for_items
```

### Install order

Components without `registryDependencies` can be installed in any order. Components with cross-registry deps (e.g., `custom-combobox` → `combobox`) will automatically install their dependencies. Install all base components first for fastest results:

```bash
# Base components (no EUI deps)
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/alert.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/combobox.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/select.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/popover.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/tooltip.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/slider.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/switch.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/mask-number-input.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/mask-text-input.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/modal.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/notification.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/use-tree.json --yes

# Components with EUI deps (install after base)
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/calendar.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/custom-combobox.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/custom-select.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/custom-tooltip.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/data-table.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/date-input.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/date-picker.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/date-range-picker.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/percentage-input.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/range-calendar.json --yes
pnpm dlx shadcn-vue@latest add http://localhost:5050/r/tree.json --yes
```

### Known issues

- **Wrong working directory**: The CLI reads `components.json` from `cwd`. If you run from the electricity-ui directory, it reads the wrong config and fails with `registries.json not found`. Always `cd` to the consumer project first.
- **pnpm hoist pattern**: If the CLI fails with `ERR_PNPM_PUBLIC_HOIST_PATTERN_DIFF`, run `CI=true vp install` first to recreate node_modules.
- **FlagIcon**: The FlagIcon component's large SVG sprite JSON may cause issues during registry install. Install separately or copy manually.

## All Available Components (23)

| Name              | Type          | Has EUI Deps | Installs To                     |
| ----------------- | ------------- | ------------ | ------------------------------- |
| alert             | registry:ui   | No           | src/components/Alert/           |
| calendar          | registry:ui   | Yes          | src/components/Calendar/        |
| combobox          | registry:ui   | No           | src/components/Combobox/        |
| custom-combobox   | registry:ui   | Yes          | src/components/CustomCombobox/  |
| custom-select     | registry:ui   | Yes          | src/components/CustomSelect/    |
| custom-tooltip    | registry:ui   | Yes          | src/components/CustomTooltip/   |
| data-table        | registry:ui   | Yes          | src/components/Table/           |
| date-input        | registry:ui   | Yes          | src/components/DateInput/       |
| date-picker       | registry:ui   | Yes          | src/components/DatePicker/      |
| date-range-picker | registry:ui   | Yes          | src/components/DateRangePicker/ |
| mask-number-input | registry:ui   | No           | src/components/MaskNumberInput/ |
| mask-text-input   | registry:ui   | No           | src/components/MaskTextInput/   |
| modal             | registry:ui   | No           | src/components/Modal/           |
| notification      | registry:ui   | No           | src/components/Notification/    |
| percentage-input  | registry:ui   | Yes          | src/components/PercentageInput/ |
| popover           | registry:ui   | No           | src/components/Popover/         |
| range-calendar    | registry:ui   | Yes          | src/components/RangeCalendar/   |
| select            | registry:ui   | No           | src/components/Select/          |
| slider            | registry:ui   | No           | src/components/Slider/          |
| switch            | registry:ui   | No           | src/components/Switch/          |
| tooltip           | registry:ui   | No           | src/components/Tooltip/         |
| tree              | registry:ui   | Yes          | src/components/Tree/            |
| use-tree          | registry:hook | No           | src/composables/tree.ts         |

## Legacy UMD Registration (window.EUI)

```javascript
const app = Vue.createApp({
	/* ... */
})

// Register components
app.component('electricity-alert', EUI.Components.Alert)
app.component('electricity-modal', EUI.Components.Modal)
app.component('electricity-table', EUI.Components.DataTable.DataTable)
app.component('custom-select', EUI.Components.Select)
app.component('custom-combobox', EUI.Components.Combobox)
app.component('date-input', EUI.Components.DateInput)
app.component('electricity-numbermask', EUI.Components.NumberMask)
app.component('percentage-input', EUI.Components.PercentageInput)
app.component('electricity-notification', EUI.Components.Notification)

app.mount('#app')
```

## Programmatic Utilities

```javascript
EUI.Utils.Tooltip.createTooltip(target, options)
EUI.Utils.Tooltip.showTooltip(target, options)
```

## When to Use Which Component

- **Select vs Combobox**: Select for <20 items with known options. Combobox for >20 items or when search/filtering is needed.
- **Alert vs Notification**: Alert for inline, persistent, context-specific messages. Notification for toast-style, temporary, global feedback.
- **DateInput vs DatePicker**: DateInput for keyboard-first with segment control and custom formats. DatePicker for visual calendar selection.
- **NumberMask vs plain input**: NumberMask for any numeric value needing locale formatting, decimal precision, or masking.

## Source Code Location

- Electricity-UI source repo: `C:\Users\Juugo\Documents\Projects\electricity-ui`
- Source components: `electricity-ui/src/components/`
- Registry source components: `electricity-ui/registry/eui/`
- Registry definition: `electricity-ui/registry.json`
- Built registry output: `electricity-ui/public/r/` (default) or `electricity-ui/dist/r/` (copied for serving)

**IMPORTANT**: ElectricityUI source code in the repo is for reference only. DO NOT modify it -- all changes to the EUI library must be done in its own repo separately.
