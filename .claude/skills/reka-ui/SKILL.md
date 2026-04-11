---
name: reka-ui
description: reka-ui headless UI primitives for Vue — accessible unstyled components, asChild, Dialog, Select, Combobox, Popover, Calendar, DateField, NumberField
---

# Reka UI

Open-source, **unstyled**, fully accessible UI component library for Vue. Provides headless primitives — you bring all the styles. Formerly known as Radix Vue.

## Installation

```bash
pnpm add reka-ui
```

## Core Pattern

Every component is split into composable **parts** that you import and assemble:

```vue
<script setup lang="ts">
import {
	PopoverArrow,
	PopoverClose,
	PopoverContent,
	PopoverPortal,
	PopoverRoot,
	PopoverTrigger,
} from 'reka-ui'
</script>

<template>
	<PopoverRoot>
		<PopoverTrigger class="rounded-md bg-white px-4 py-2"> More info </PopoverTrigger>
		<PopoverPortal>
			<PopoverContent class="rounded-md bg-white p-5 shadow-lg w-64">
				Some content...
				<PopoverClose />
				<PopoverArrow class="fill-white" />
			</PopoverContent>
		</PopoverPortal>
	</PopoverRoot>
</template>
```

## asChild Prop

All parts that render a DOM element accept `asChild`. When `true`, Reka renders no wrapper element — it passes props/behavior to the slot's first child:

```vue
<TooltipTrigger as-child>
  <a href="/docs">Documentation</a>
</TooltipTrigger>

<!-- Compose multiple primitives -->
<DialogTrigger as-child>
  <TooltipTrigger as-child>
    <MyButton>Open</MyButton>
  </TooltipTrigger>
</DialogTrigger>
```

**Warning:** When using `asChild`, you are responsible for maintaining accessibility of the underlying element.

## Key Components

### Dialog (Modal)

```vue
<script setup lang="ts">
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogOverlay,
	DialogPortal,
	DialogRoot,
	DialogTitle,
	DialogTrigger,
} from 'reka-ui'
</script>

<template>
	<DialogRoot>
		<DialogTrigger>Open</DialogTrigger>
		<DialogPortal>
			<DialogOverlay class="fixed inset-0 bg-black/50" />
			<DialogContent
				class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6"
			>
				<DialogTitle>Edit Profile</DialogTitle>
				<DialogDescription>Make changes to your profile.</DialogDescription>
				<!-- form fields -->
				<DialogClose>Close</DialogClose>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
```

### Select

```vue
<script setup lang="ts">
import {
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectItemIndicator,
	SelectItemText,
	SelectLabel,
	SelectPortal,
	SelectRoot,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectTrigger,
	SelectValue,
	SelectViewport,
} from 'reka-ui'
import { ref } from 'vue'

const value = ref('')
</script>

<template>
	<SelectRoot v-model="value">
		<SelectTrigger class="inline-flex items-center gap-1 rounded border px-3 py-2">
			<SelectValue placeholder="Pick a fruit" />
		</SelectTrigger>
		<SelectPortal>
			<SelectContent class="rounded-md bg-white shadow-lg">
				<SelectViewport class="p-1">
					<SelectGroup>
						<SelectLabel class="px-6 py-1 text-xs text-gray-500">Fruits</SelectLabel>
						<SelectItem value="apple" class="cursor-pointer rounded px-6 py-2 hover:bg-gray-100">
							<SelectItemText>Apple</SelectItemText>
							<SelectItemIndicator />
						</SelectItem>
						<SelectItem value="banana" class="cursor-pointer rounded px-6 py-2 hover:bg-gray-100">
							<SelectItemText>Banana</SelectItemText>
						</SelectItem>
					</SelectGroup>
				</SelectViewport>
			</SelectContent>
		</SelectPortal>
	</SelectRoot>
</template>
```

### Combobox (Autocomplete)

```vue
<script setup lang="ts">
import {
	ComboboxAnchor,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxPortal,
	ComboboxRoot,
	ComboboxTrigger,
	ComboboxViewport,
} from 'reka-ui'
</script>

<template>
	<ComboboxRoot>
		<ComboboxAnchor>
			<ComboboxInput placeholder="Search..." />
			<ComboboxTrigger />
		</ComboboxAnchor>
		<ComboboxPortal>
			<ComboboxContent>
				<ComboboxViewport>
					<ComboboxEmpty>No results</ComboboxEmpty>
					<ComboboxItem value="react">React</ComboboxItem>
					<ComboboxItem value="vue">Vue</ComboboxItem>
				</ComboboxViewport>
			</ComboboxContent>
		</ComboboxPortal>
	</ComboboxRoot>
</template>
```

### Tooltip

```vue
<TooltipProvider>
  <TooltipRoot>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipPortal>
      <TooltipContent side="top" :side-offset="5" class="rounded bg-gray-900 px-3 py-1 text-sm text-white">
        Tooltip text
        <TooltipArrow class="fill-gray-900" />
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</TooltipProvider>
```

### Other Components

| Category      | Components                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| **Overlays**  | Dialog, AlertDialog, Popover, Tooltip, HoverCard, ContextMenu, DropdownMenu, Menubar, NavigationMenu |
| **Form**      | Checkbox, RadioGroup, Select, Combobox, Switch, Slider, Toggle, ToggleGroup, NumberField             |
| **Date/Time** | Calendar, RangeCalendar, DateField, DateRangeField, TimeField                                        |
| **Layout**    | Accordion, Collapsible, Tabs, Separator, ScrollArea, Splitter, AspectRatio                           |
| **Display**   | Avatar, Progress, Label                                                                              |
| **Utility**   | Primitive, Presence, VisuallyHidden, FocusScope, DismissableLayer                                    |

## Controlled vs Uncontrolled

Most components support both patterns:

```vue
<!-- Uncontrolled (internal state) -->
<DialogRoot>...</DialogRoot>

<!-- Controlled (v-model) -->
<DialogRoot v-model:open="isOpen">...</DialogRoot>

<!-- Controlled Select -->
<SelectRoot v-model="selectedValue">...</SelectRoot>
```

## Styling with Tailwind

Reka UI components emit **data attributes** for styling states:

```css
/* Style based on component state */
[data-state='open'] {
	/* content is open */
}
[data-state='closed'] {
	/* content is closed */
}
[data-disabled] {
	/* item is disabled */
}
[data-highlighted] {
	/* item is highlighted (keyboard/hover) */
}
```

```vue
<SelectItem
	class="data-[highlighted]:bg-blue-500 data-[highlighted]:text-white data-[disabled]:opacity-50"
	value="option"
>
  Option
</SelectItem>
```

## Accessibility

- All components follow WAI-ARIA design patterns
- Full keyboard navigation built-in
- Focus management and trapping in modals
- Screen reader announcements
- No extra work needed — just use the components correctly

## Gotchas

- Every component has a `Root` part — always start with it (e.g., `DialogRoot`, `SelectRoot`)
- Use `Portal` parts to render overlays outside the DOM tree (prevents z-index/overflow issues)
- The `as-child` prop only works on the **immediate** child slot element
- Import from `'reka-ui'` — all components are tree-shakeable
- v-model prop names vary: `v-model:open`, `v-model` (value), `v-model:checked`, etc.
