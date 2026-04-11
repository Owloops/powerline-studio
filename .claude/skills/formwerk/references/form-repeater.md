# Form Repeaters

Form repeaters enable dynamic field collections for recurring data, such as email lists or address groups.

## Features

- Adding, removing, and swapping items
- Auto-name prefixing for nested fields
- Min and max item count enforcement
- Accessibility for add/remove and move buttons automatically managed

## Basic Setup

```ts
import { useFormRepeater, type FormRepeaterProps } from '@formwerk/core'

const props = defineProps<FormRepeaterProps>()
const { items, addButtonProps, Iteration } = useFormRepeater(props)
```

## Minimal Template

```vue
<template>
	<Iteration
		v-for="(key, index) in items"
		:key="key"
		:index="index"
		v-slot="{ removeButtonProps, moveUpButtonProps, moveDownButtonProps }"
	>
		<h3>#{{ index + 1 }}</h3>
		<slot />
		<button v-bind="moveUpButtonProps">Move up</button>
		<button v-bind="moveDownButtonProps">Move down</button>
		<button v-bind="removeButtonProps">Remove</button>
	</Iteration>
	<button v-bind="addButtonProps">Add</button>
</template>
```

## Complete Example

### FormRepeater.vue

```vue
<script setup lang="ts">
import { useFormRepeater, type FormRepeaterProps } from '@formwerk/core'

const props = defineProps<FormRepeaterProps>()
const { items, addButtonProps, Iteration } = useFormRepeater(props)
</script>

<template>
	<div class="repeater-container">
		<TransitionGroup name="list">
			<Iteration
				v-for="(key, index) in items"
				:index="index"
				:key="key"
				as="div"
				class="repeater-item"
				v-slot="{ removeButtonProps, moveUpButtonProps, moveDownButtonProps }"
			>
				<div class="repeater-item-content">
					<slot />
				</div>
				<div class="repeater-item-buttons">
					<button v-bind="moveUpButtonProps">Up</button>
					<button v-bind="removeButtonProps">Remove</button>
					<button v-bind="moveDownButtonProps">Down</button>
				</div>
			</Iteration>
		</TransitionGroup>
		<button v-bind="addButtonProps" type="button">Add item</button>
	</div>
</template>
```

### Form Usage

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'
import Checkbox from './Checkbox.vue'
import FormRepeater from './FormRepeater.vue'

const { handleSubmit } = useForm()
const onSubmit = handleSubmit((data) => {
	alert(JSON.stringify(data.toObject(), null, 2))
})
</script>

<template>
	<form @submit="onSubmit" novalidate>
		<FormRepeater name="users">
			<TextField name="email" label="Email Address" required type="email" />
			<Checkbox name="isAdmin" label="Is Admin" />
		</FormRepeater>
		<button type="submit">Submit</button>
	</form>
</template>
```

## Min and Max Items

```vue
<template>
	<form @submit="onSubmit" novalidate>
		<FormRepeater name="users" min="1" max="3">
			<TextField name="email" label="Email Address" required type="email" />
			<Checkbox name="isAdmin" label="Is Admin" />
		</FormRepeater>
		<button type="submit">Submit</button>
	</form>
</template>
```

Behavior:

- Remove button disables at minimum item count
- Add button disables at maximum item count
- Repeater automatically adds items to match minimum on initial render

## Field Path Prefixing

Repeaters require a `name` prop. Nested fields are automatically prefixed with the repeater name and item index.

For a repeater named `"users"` with a field named `"email"`, the field paths become:

- `users.0.email`
- `users.1.email`
- etc.

### Empty String Name for Flat Arrays

Use `name=""` on the field for direct array values instead of nested objects:

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'
import FormRepeater from './FormRepeater.vue'

const { values } = useForm()
</script>

<template>
	<FormRepeater name="emails" min="1">
		<TextField name="" label="Email Address" required type="email" />
	</FormRepeater>
	<pre>{{ values }}</pre>
</template>
```

This produces `{ emails: ["value1", "value2"] }` instead of `{ emails: [{ "": "value1" }] }`.

Omit the `name` prop entirely for uncontrolled fields.

## Form Context Integration

When `useFormRepeater` and `useForm` are in the same component, pass form context via the `form` prop to prevent parent context injection:

```ts
import { useFormRepeater, useForm } from '@formwerk/core'

const form = useForm()
const { items, Iteration } = useFormRepeater({
	name: 'emails',
	form,
})
```

## Animations

Use Vue's `<TransitionGroup>` wrapping the `Iteration` components for enter/leave/move animations:

```vue
<template>
	<TransitionGroup name="list">
		<Iteration
			v-for="(key, index) in items"
			:index="index"
			:key="key"
			v-slot="{ removeButtonProps }"
		>
			<slot />
			<button v-bind="removeButtonProps">Remove</button>
		</Iteration>
	</TransitionGroup>
</template>

<style>
.list-move,
.list-enter-active,
.list-leave-active {
	transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
	opacity: 0;
	transform: translateX(30px);
}
.list-leave-active {
	position: absolute;
}
</style>
```

## API Reference

### useFormRepeater Props

| Name                  | Type                        | Description                                                                                   |
| --------------------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| `name`                | `string`                    | The name/path of the repeater field                                                           |
| `form`                | `FormReturns<TForm, TForm>` | Form object from `useForm`. Required when `useFormRepeater` is in same component as `useForm` |
| `min`                 | `Numberish`                 | Minimum number of iterations allowed                                                          |
| `max`                 | `Numberish`                 | Maximum number of iterations allowed                                                          |
| `addButtonLabel`      | `string`                    | Accessible label for the add button                                                           |
| `removeButtonLabel`   | `string`                    | Accessible label for the remove button                                                        |
| `moveUpButtonLabel`   | `string`                    | Accessible label for the move up button                                                       |
| `moveDownButtonLabel` | `string`                    | Accessible label for the move down button                                                     |

### useFormRepeater Returns

| Name             | Type                                       | Description                                    |
| ---------------- | ------------------------------------------ | ---------------------------------------------- |
| `items`          | `Ref<string[]>`                            | Array of unique keys for each repeater item    |
| `add`            | `(count?: number) => void`                 | Add items (default 1). Cannot exceed max       |
| `remove`         | `(index: number) => void`                  | Remove item at index. Cannot go below min      |
| `insert`         | `(index: number) => void`                  | Insert item at a given index                   |
| `move`           | `(from: number, to: number) => void`       | Move item from one index to another            |
| `swap`           | `(indexA: number, indexB: number) => void` | Swap two items                                 |
| `addButtonProps` | `Ref<FormRepeaterButtonDomProps>`          | Props for the add button                       |
| `Iteration`      | `Component`                                | Iteration component to wrap each repeated item |

### Iteration Component

#### Props

| Name    | Type     | Description                              |
| ------- | -------- | ---------------------------------------- |
| `index` | `number` | The index of the current item (required) |
| `as`    | `string` | The tag name to render as (optional)     |

#### Slot Props

| Name                  | Type                         | Description                    |
| --------------------- | ---------------------------- | ------------------------------ |
| `removeButtonProps`   | `FormRepeaterButtonDomProps` | Props for the remove button    |
| `moveUpButtonProps`   | `FormRepeaterButtonDomProps` | Props for the move up button   |
| `moveDownButtonProps` | `FormRepeaterButtonDomProps` | Props for the move down button |

## Key Notes

- The `Iteration` component is returned by `useFormRepeater` — it is not imported separately
- The `items` array contains unique identifier keys; do not manually set these
- `useFormRepeater` requires form context from `useForm` to maintain synchronization
- Accessibility attributes are automatically managed on all buttons
- Move up is disabled on the first item; move down is disabled on the last item
