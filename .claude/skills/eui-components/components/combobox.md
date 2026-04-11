# Combobox

Searchable dropdown component with built-in filtering, built on Reka UI. Supports flexible data formats (arrays, objects, key-value), grouping, and custom rendering.

## Installation

```bash
# Primitives only
pnpm dlx shadcn-vue@latest add @electricity-ui/combobox

# High-level wrapper (includes primitives)
pnpm dlx shadcn-vue@latest add @electricity-ui/custom-combobox
```

## When to Use

**Combobox**: Dataset >20 items, users need to search/filter, dynamic options
**Select**: Dataset <20 items, well-known options, simple static choices

## Props (CustomCombobox)

```typescript
interface Props {
	modelValue?: any
	options: any[] | Record<string, any>
	keySelector?: (item: any) => any
	valueSelector?: (item: any) => any
	groupSelector?: (item: any) => any
	groupLabelSelector?: (group: any) => any
	placeholder?: string
	nothingFoundText?: string
	displayValue?: (key: any) => string
	triggerClass?: HTMLAttributes['class']
	inputClass?: HTMLAttributes['class']
	contentClass?: HTMLAttributes['class']
	itemClass?: HTMLAttributes['class']
	groupClass?: HTMLAttributes['class']
	labelClass?: HTMLAttributes['class']
	portal?: boolean // default: true
}
```

## Data Formats

```javascript
// Simple arrays
options: ['Apple', 'Banana', 'Cherry']

// Key-value objects
options: { apple: 'Apple', banana: 'Banana' }

// Complex objects with selectors
options: [
	{ id: 1, name: 'Apple', category: 'Fruit' },
	{ id: 2, name: 'Carrot', category: 'Vegetable' }
]
```

Auto-detection: primitives use value directly, objects attempt common patterns (`id`/`name`, `key`/`value`).

## Usage

```html
<!-- Basic -->
<CustomCombobox v-model="selectedValue" :options="items" placeholder="Search items..." />

<!-- With custom selectors -->
<CustomCombobox
	v-model="selectedEmployee"
	:options="employees"
	:key-selector="emp => emp.id"
	:value-selector="emp => `${emp.firstName} ${emp.lastName}`"
	:display-value="id => employees.find(e => e.id === id)?.firstName"
	placeholder="Search employees..."
/>

<!-- Grouped -->
<CustomCombobox
	v-model="selectedValue"
	:options="tarifications"
	content-class="max-h-[360px]"
	placeholder="Choose timezone..."
	:key-selector="item => item.TimeZoneName"
	:value-selector="item => item.TimeZoneTranslation"
	:group-selector="item => item.Translation"
	:group-label-selector="group => group.toUpperCase()"
/>
```

### Legacy UMD Registration

```javascript
app.component('custom-combobox', EUI.Components.Combobox)
```

## Component Structure

```
Combobox/
├── Combobox.vue              # Root (wraps Reka UI ComboboxRoot)
├── ComboboxAnchor.vue        # Positioning anchor
├── ComboboxInput.vue         # Search text input
├── ComboboxTrigger.vue       # Dropdown button
├── ComboboxList.vue          # Dropdown content
├── ComboboxItem.vue          # Selectable items
├── ComboboxItemIndicator.vue # Selection indicators
├── ComboboxEmpty.vue         # "No results" state
├── ComboboxGroup.vue         # Grouping wrapper
├── ComboboxLabel.vue         # Group labels
├── ComboboxSeparator.vue     # Visual separators
└── index.ts                  # Exports

CustomCombobox/
└── CustomCombobox.vue        # High-level wrapper combining primitives
```

Typical nesting structure:

```html
<ComboboxAnchor>
	<ComboboxInput />
	<ComboboxTrigger />
</ComboboxAnchor>
<ComboboxList>
	<ComboboxEmpty />
	<ComboboxGroup>
		<ComboboxLabel />
		<ComboboxItem>
			<ComboboxItemIndicator />
		</ComboboxItem>
		<ComboboxSeparator />
	</ComboboxGroup>
</ComboboxList>
```

## Reka UI Wrapper Pattern

All primitives are lightweight wrappers around Reka UI components using `useForwardPropsEmits`:

```vue
<script setup lang="ts">
import {
	ComboboxRoot,
	type ComboboxRootEmits,
	type ComboboxRootProps,
	useForwardPropsEmits,
} from 'reka-ui'

const props = defineProps<ComboboxRootProps>()
const emits = defineEmits<ComboboxRootEmits>()
const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
	<ComboboxRoot v-bind="forwarded" class="relative flex-1">
		<slot />
	</ComboboxRoot>
</template>
```

## Portal Rendering

By default `portal: true` -- the dropdown renders in `document.body` for proper z-index stacking. Set `:portal="false"` to render inline for special positioning needs.

## Styling / Animations

Dropdown animation uses Tailwind data-attribute classes:

```css
data-[state=open]:animate-in data-[state=closed]:animate-out
data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
```

Item interaction states:

```css
data-[highlighted]:bg-primary-50 data-[highlighted]:text-black
data-[disabled]:pointer-events-none data-[disabled]:opacity-50
```

## Exports (Legacy UMD)

```javascript
window.EUI.Components.Combobox // CustomCombobox
window.EUI.Components.ComboboxComponent // All primitives:
// Combobox, ComboboxAnchor, ComboboxCancel, ComboboxEmpty,
// ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator,
// ComboboxLabel, ComboboxList, ComboboxSeparator, ComboboxTrigger
```

## Keyboard Navigation

- **Arrow Keys**: Navigate filtered results
- **Enter**: Select highlighted item
- **Escape**: Close dropdown, clear search
- **Tab**: Next form element
- **Home/End**: First/last option

## Troubleshooting / Best Practices

1. **Dropdown not showing** -- Check portal rendering: use `:portal="false"` for debugging; verify z-index conflicts
2. **Search not working** -- Ensure using `ComboboxInput`, not a regular `<input>`; check data format compatibility
3. **Custom selectors not working** -- Verify selector functions return consistent types; check for null/undefined in data
