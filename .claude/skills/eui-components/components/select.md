# Select

Dropdown component built on Reka UI. Two-layer architecture: primitives and CustomSelect high-level component. Supports options, selectors, grouping, slots for custom rendering, and portal rendering.

## Installation

```bash
# Primitives only
pnpm dlx shadcn-vue@latest add @electricity-ui/select

# High-level wrapper (includes primitives)
pnpm dlx shadcn-vue@latest add @electricity-ui/custom-select
```

## When to Use

**Select**: <20 items, well-known options, simple static choices
**Combobox**: >20 items, needs search/filter, dynamic options

## Architecture

Two-layer design, each building on the previous:

1. **Primitives** (Reka UI wrappers) - Low-level building blocks (Select, SelectTrigger, SelectContent, SelectItem, etc.) for full layout control
2. **CustomSelect** - High-level component combining primitives into a complete dropdown with selectors, grouping, slots, and portal support

Most usage should target CustomSelect. Use primitives only when CustomSelect slots are insufficient.

## Props (CustomSelect)

```typescript
interface Props {
	modelValue?: any
	options: any[] | Record<string, any>
	keySelector?: (item: any) => any
	valueSelector?: (item: any) => any
	groupSelector?: (item: any) => any
	groupLabelSelector?: (group: any) => any
	triggerClass?: HTMLAttributes['class']
	contentClass?: HTMLAttributes['class']
	itemClass?: HTMLAttributes['class']
	placeholder?: string
	portal?: boolean // default: true
}
```

## Usage

```html
<!-- Basic -->
<CustomSelect
	v-model="selectedValue"
	:options="options"
	:key-selector="(item) => item.id"
	:value-selector="(item) => item.name"
	placeholder="Choose an option"
	class="w-full"
/>

<!-- With grouping -->
<CustomSelect
	v-model="selectedValue"
	:options="groupedOptions"
	:group-selector="(item) => item.category"
	:group-label-selector="(group) => group.name"
	:key-selector="(item) => item.id"
	:value-selector="(item) => item.value"
	placeholder="Choose from groups"
/>

<!-- Custom slots -->
<CustomSelect v-model="selectedValue" :options="options">
	<template #trigger="{ selectedItem }">
		<div class="flex items-center gap-2">
			<img :src="selectedItem?.icon" class="w-4 h-4" />
			{{ selectedItem?.name }}
		</div>
	</template>
	<template #item="{ item }">
		<div class="flex items-center gap-2">
			<img :src="item.icon" class="w-4 h-4" />
			<span>{{ item.name }}</span>
		</div>
	</template>
</CustomSelect>
```

### Legacy UMD Registration

```javascript
app.component('custom-select', EUI.Components.Select)
```

## Data Formats

```javascript
// Simple arrays
const options = ['Option 1', 'Option 2', 'Option 3']

// Object arrays
const options = [
	{ id: 1, name: 'Option 1', value: 'opt1' },
	{ id: 2, name: 'Option 2', value: 'opt2' },
]

// Grouped options
const options = [
	{ id: 1, name: 'Item 1', category: 'Group A' },
	{ id: 2, name: 'Item 2', category: 'Group A' },
	{ id: 3, name: 'Item 3', category: 'Group B' },
]
```

## Portal Rendering

Dropdown content is rendered into the document body by default (`portal: true`). This prevents the dropdown from being clipped by parent containers with `overflow: hidden` and avoids z-index stacking context issues. Set `:portal="false"` only when you need the dropdown to remain inside its parent DOM hierarchy.

## Styling

Uses inline Tailwind utilities with shadcn-vue design tokens:

**Dropdown content:** animated enter/exit via `data-[state]` attributes, `shadow-md border bg-popover`, max-h-96 overflow-hidden

**Item states:**

- Hover/focus: `focus:bg-accent focus:text-accent-foreground`
- Disabled: `data-[disabled]:opacity-50`
- Selected: checkmark indicator

## Primitive Components

All built as thin Reka UI wrappers:

| Component                                     | Purpose                        |
| --------------------------------------------- | ------------------------------ |
| Select.vue                                    | Root wrapper                   |
| SelectTrigger.vue                             | Dropdown trigger button        |
| SelectValue.vue                               | Displays selected value        |
| SelectContent.vue                             | Dropdown container with portal |
| SelectItem.vue                                | Selectable options             |
| SelectItemText.vue                            | Item text content              |
| SelectGroup.vue                               | Groups related options         |
| SelectLabel.vue                               | Group labels                   |
| SelectSeparator.vue                           | Visual separators              |
| SelectScrollUpButton / SelectScrollDownButton | Scroll buttons                 |

## Exports (Legacy UMD)

```javascript
window.EUI.Components.Select // CustomSelect
window.EUI.Components.SelectComponent // All primitives
```

## Keyboard Navigation

| Key         | Action            |
| ----------- | ----------------- |
| Arrow Keys  | Navigate options  |
| Enter/Space | Select option     |
| Escape      | Close dropdown    |
| Tab         | Move focus        |
| Home/End    | First/last option |

## Troubleshooting

**Dropdown Not Appearing:**

- Check if parent container has `overflow: hidden` -- enable portal with `:portal="true"`
- Verify z-index stacking context is not trapping the dropdown

**Selection Not Working:**

- Ensure `keySelector` and `valueSelector` match the actual option data structure
- Check that `v-model` binding is correctly wired
- Verify option objects have the properties your selectors reference
