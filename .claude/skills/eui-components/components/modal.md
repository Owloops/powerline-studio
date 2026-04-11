# Modal

Dialog component built on Reka UI Dialog. Supports slots, v-model binding, nested modals, class customization via `classes` prop, and full accessibility. Uses shadcn-vue theming (`bg-background`, `text-foreground`, `bg-muted`).

## Installation

```bash
pnpm dlx shadcn-vue@latest add @electricity-ui/modal
```

## Props

```typescript
interface ModalClasses {
	overlay?: string
	content?: string
	wrapper?: string
	title?: string
	description?: string
	actions?: string
}

interface Props {
	open: boolean // Required: visibility state
	setOpen?: (open: boolean) => void // Optional: function-based control
	onInteractOutside?: (event: Event) => void // Optional: custom outside click handler
	classes?: ModalClasses // Optional: class overrides per section
}
```

Default outside click behavior: ignores clicks on flatpickr and portal elements.

## Slots

- `#title` -- Header content (required for accessibility)
- `#description` -- Screen reader description (optional)
- `#default` -- Main body content
- `#actions` -- Footer buttons area (rendered with `bg-muted` background)

## Events

```typescript
'update:open': [value: boolean]  // Enables v-model:open usage
```

## Usage

### With setOpen callback

```html
<Modal :open="modalOpen" :set-open="setModalOpen">
	<template #title>
		<span class="text-3xl font-bold">Edit Product</span>
	</template>
	<template #default>
		<div class="px-4 sm:px-6 mb-6">
			<form><!-- form fields --></form>
		</div>
	</template>
	<template #actions>
		<div class="flex justify-end gap-3">
			<button
				class="rounded-md bg-secondary px-4 py-2 text-secondary-foreground"
				@click="modalOpen = false"
			>
				Cancel
			</button>
			<button class="rounded-md bg-primary px-4 py-2 text-primary-foreground" @click="saveProduct">
				Save
			</button>
		</div>
	</template>
</Modal>
```

### V-Model

```html
<Modal v-model:open="isModalVisible">
	<template #title>Confirmation</template>
	<template #default>
		<p>Are you sure you want to delete this item?</p>
	</template>
	<template #actions>
		<button @click="isModalVisible = false">Cancel</button>
		<button @click="confirmDelete">Delete</button>
	</template>
</Modal>
```

### With class overrides

```html
<Modal
	:open="open"
	@update:open="open = $event"
	:classes="{ content: 'max-w-lg', actions: 'bg-transparent p-0' }"
>
	<!-- ... -->
</Modal>
```

### Legacy UMD Registration

```javascript
app.component('electricity-modal', EUI.Components.Modal)
```

## Styling

Uses `cn()` for class merging with shadcn-vue design tokens:

- **Overlay**: `fixed inset-0 z-40 bg-black/75` with fade animation
- **Content**: `fixed left-[50%] top-[50%] z-50 w-full max-w-max translate-x-[-50%] translate-y-[-50%] border bg-background p-0 shadow-lg sm:rounded-lg` with fade + zoom animation
- **Title**: `text-xl font-bold leading-6 text-foreground`
- **Actions area**: `bg-muted p-4 sm:p-6`

Animations: 200ms duration, `fade-in-0`/`fade-out-0` + `zoom-in-95`/`zoom-out-95`

## Nested Modals

```html
<!-- Master modal -->
<Modal :open="showMaster" @update:open="showMaster = $event">
	<template #actions>
		<button @click="showConfirm = true">Process Selected</button>
	</template>
</Modal>

<!-- Nested confirmation -->
<Modal :open="showConfirm" @update:open="showConfirm = $event">
	<template #title>Confirm</template>
	<template #actions>
		<button @click="showConfirm = false">Cancel</button>
		<button @click="processBulk">Confirm</button>
	</template>
</Modal>
```

## Accessibility

- **Escape**: Closes modal
- **Tab/Shift+Tab**: Navigate focusable elements within modal
- Focus trapped inside modal; returns to trigger on close
- Full WAI-ARIA dialog pattern via Reka UI
