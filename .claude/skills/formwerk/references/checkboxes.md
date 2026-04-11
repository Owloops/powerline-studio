# Checkboxes

Checkboxes allow users to toggle field state on (checked) or off (unchecked). Two main purposes:

- Single checkbox for binary choices (e.g., terms acknowledgment)
- Checkbox group for multiple selections (e.g., email preferences)

## Features

- Support for `input[type="checkbox"]` or custom HTML elements
- Automatic label, description, and error message linking via `aria-*` attributes
- Custom checked/unchecked values
- `indeterminate` state support
- Form management and validation with Standard Schemas or HTML5 validation
- `v-model` support for single and grouped checkboxes
- Keyboard: Space (select), Tab (navigate), Shift+Tab (reverse)

## Building a Checkbox Component

### With input as base element

```vue
<script setup lang="ts">
import { type CheckboxProps, useCheckbox } from '@formwerk/core'

const props = defineProps<CheckboxProps<string>>()
const { labelProps, inputProps, errorMessage, errorMessageProps, isChecked } = useCheckbox(props)
</script>

<template>
	<div class="checkbox-item">
		<label v-bind="labelProps">
			<input v-bind="inputProps" class="sr-only" />
			<div class="checkbox-square">
				<svg v-if="isChecked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
					<path
						d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"
					></path>
				</svg>
			</div>
			{{ label }}
		</label>
		<div v-if="errorMessage" v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

### With custom HTML elements as base

When not using `<input>`, bind `inputProps` to a `<div>` and use `aria-checked` / `aria-disabled` for styling:

```vue
<script setup lang="ts">
import { type CheckboxProps, useCheckbox } from '@formwerk/core'

const props = defineProps<CheckboxProps<string>>()
const { labelProps, inputProps, errorMessage, errorMessageProps, isChecked } = useCheckbox(props)
</script>

<template>
	<div class="checkbox-item">
		<div v-bind="inputProps" class="checkbox-input">
			<div class="checkbox-square">
				<svg v-if="isChecked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
					<path
						d="M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z"
					></path>
				</svg>
			</div>
			<div v-bind="labelProps">{{ label }}</div>
		</div>
		<div v-if="errorMessage" v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

Style with `&[aria-checked='true']` and `&[aria-disabled='true']` instead of `:has(:checked)` / `:has(:disabled)`.

## Building a Checkbox Group

**Important:** When a checkbox is nested inside a checkbox group, it will NOT report its own state (except `isChecked`). All other states report the group's state. Use `v-model` on the group, not individual checkboxes.

### CheckboxGroup.vue

```vue
<script setup lang="ts">
import Checkbox from './Checkbox.vue'
import { type CheckboxGroupProps, useCheckboxGroup } from '@formwerk/core'

const props = defineProps<CheckboxGroupProps>()
const { groupProps, labelProps, descriptionProps, errorMessageProps, errorMessage, isTouched } =
	useCheckboxGroup(props)
</script>

<template>
	<div v-bind="groupProps" class="checkbox-group" :class="{ 'is-touched': isTouched }">
		<div v-bind="labelProps" class="group-label">{{ label }}</div>
		<div class="checkboxes-container">
			<slot />
		</div>
		<div v-if="errorMessage" v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
		<div v-else-if="description" v-bind="descriptionProps" class="hint">
			{{ description }}
		</div>
	</div>
</template>
```

### Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Checkbox from './Checkbox.vue'
import CheckboxGroup from './CheckboxGroup.vue'

const colors = ref([])
</script>

<template>
	<CheckboxGroup label="Colors" v-model="colors">
		<Checkbox label="Red" value="red" />
		<Checkbox label="Green" value="green" />
		<Checkbox label="Blue" value="blue" />
	</CheckboxGroup>

	selected colors: {{ colors }}
</template>
```

## Validation

### HTML Constraints

| Property   | Type      | Description                           |
| ---------- | --------- | ------------------------------------- |
| `required` | `boolean` | Whether checkbox or group is required |

**Note:** Marking any checkbox item that is part of a checkbox group as required will NOT make the group required -- it will be ignored.

```vue
<!-- Single checkbox -->
<Checkbox label="Terms" required />

<!-- Checkbox group -->
<CheckboxGroup name="test" label="Colors" required>
  <Checkbox label="Red" value="red" />
  <Checkbox label="Green" value="green" />
  <Checkbox label="Blue" value="blue" />
</CheckboxGroup>
```

### Standard Schema Validation

```vue
<script setup lang="ts">
import { z } from 'zod'
import Checkbox from './Checkbox.vue'
import CheckboxGroup from './CheckboxGroup.vue'

const schema = z.array(z.string()).min(1, 'Required')
const singleSchema = z.literal(true, 'Required')
</script>

<template>
	<!-- Single checkbox -->
	<Checkbox label="Terms" :value="true" :schema="singleSchema" />

	<!-- Checkbox group -->
	<CheckboxGroup label="Colors (Standard Schema)" :schema="schema">
		<Checkbox label="Red" value="red" />
		<Checkbox label="Green" value="green" />
		<Checkbox label="Blue" value="blue" />
	</CheckboxGroup>
</template>
```

## Usage

### Disabled

Individual checkboxes or entire groups can be disabled:

```vue
<CheckboxGroup label="Checkbox Group">
  <Checkbox label="Option 1" value="1" />
  <Checkbox label="Option 2" value="2" />
  <Checkbox label="Option 3" value="3" disabled />
  <Checkbox label="Option 4" value="4" />
</CheckboxGroup>

<CheckboxGroup label="Disabled Group" disabled>
  <Checkbox label="Option 1" value="1" />
  <Checkbox label="Option 2" value="2" />
  <Checkbox label="Option 3" value="3" />
</CheckboxGroup>
```

### Readonly

Available on group and group-less checkboxes. Prevents interaction while allowing submission and validation.

```vue
<CheckboxGroup label="Readonly Group" readonly>
  <Checkbox label="Option 1" value="1" />
  <Checkbox label="Option 2" value="2" />
  <Checkbox label="Option 3" value="3" />
</CheckboxGroup>
```

### Indeterminate

Only available on checkbox items. Represents tri-state checkbox behavior. Indeterminate checkboxes change their checked state until the indeterminate state is removed.

```vue
<Checkbox label="Terms" indeterminate />
```

### Group Checked State

The `groupState` property on `useCheckboxGroup` is an enum: `'checked'`, `'unchecked'`, or `'mixed'`.

```vue
<script setup lang="ts">
import { type CheckboxGroupProps, useCheckboxGroup } from '@formwerk/core'

const props = defineProps<CheckboxGroupProps>()
const { groupProps, groupState, labelProps } = useCheckboxGroup(props)

function toggleGroupState() {
	groupState.value = groupState.value === 'checked' ? 'unchecked' : 'checked'
}
</script>
```

## Generics / Value Types

Default checkbox value is boolean. Change via generic type on `CheckboxProps` or `CheckboxGroupProps`.

### Basic

```typescript
import { useCheckbox, type CheckboxProps } from '@formwerk/core'
const props = defineProps<CheckboxProps<string>>()
```

### Component-level generics (recommended)

```vue
<script setup lang="ts" generic="TValue">
import { useCheckbox, type CheckboxProps } from '@formwerk/core'
const props = defineProps<CheckboxProps<TValue>>()
</script>
```

Same for groups:

```vue
<script setup lang="ts" generic="TValue">
import { useCheckboxGroup, type CheckboxGroupProps } from '@formwerk/core'
const props = defineProps<CheckboxGroupProps<TValue>>()
</script>
```

## API Reference

### useCheckbox Props

| Name                    | Type               | Description                          |
| ----------------------- | ------------------ | ------------------------------------ |
| `disabled`              | `boolean`          | Whether the checkbox is disabled     |
| `disableHtmlValidation` | `boolean`          | Whether HTML5 validation is disabled |
| `falseValue`            | `TValue`           | Value when unchecked                 |
| `indeterminate`         | `boolean`          | Whether in indeterminate state       |
| `label`                 | `string`           | Label text                           |
| `modelValue`            | `TValue`           | Current value                        |
| `name`                  | `string`           | Field name/path                      |
| `readonly`              | `boolean`          | Whether readonly                     |
| `required`              | `boolean`          | Whether required                     |
| `schema`                | `StandardSchemaV1` | Validation schema                    |
| `standalone`            | `boolean`          | Operate independently                |
| `trueValue`             | `TValue`           | Value when checked                   |
| `value`                 | `TValue`           | Value in group context               |

### useCheckbox Returns

| Name                 | Type                                                       | Description                 |
| -------------------- | ---------------------------------------------------------- | --------------------------- |
| `controlId`          | `string`                                                   | Input element ID            |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                                | Description element props   |
| `errorMessage`       | `Ref<string>`                                              | Error message text          |
| `errorMessageProps`  | `any`                                                      | Error message element props |
| `errors`             | `Ref<{}>`                                                  | Field errors                |
| `fieldValue`         | `Ref<TValue>`                                              | Field value                 |
| `inputEl`            | `Ref<HTMLElement>`                                         | Input element reference     |
| `inputProps`         | `Ref<CheckboxDomInputProps \| CheckboxDomProps>`           | Input binding props         |
| `isBlurred`          | `Ref<boolean>`                                             | Blurred state               |
| `isChecked`          | `Ref<boolean>`                                             | Checked state               |
| `isDirty`            | `Ref<boolean>`                                             | Dirty state                 |
| `isDisabled`         | `Ref<boolean>`                                             | Disabled state              |
| `isGrouped`          | `boolean`                                                  | Whether grouped             |
| `isTouched`          | `Ref<boolean>`                                             | Touched state               |
| `isValid`            | `Ref<boolean>`                                             | Valid state                 |
| `isValidated`        | `Ref<boolean>`                                             | Validated state             |
| `labelProps`         | `any`                                                      | Label element props         |
| `setBlurred`         | `(blurred: boolean) => void`                               | Set blurred state           |
| `setErrors`          | `(messages: Arrayable<string>) => void`                    | Set error messages          |
| `setIsValidated`     | `(isValidated: boolean) => void`                           | Set validated state         |
| `setTouched`         | `(touched: boolean) => void`                               | Set touched state           |
| `setValue`           | `(value: TValue) => void`                                  | Set field value             |
| `submitErrorMessage` | `Ref<string>`                                              | Submit error message        |
| `submitErrors`       | `Ref<{}>`                                                  | Submit errors               |
| `toggle`             | `(force?: boolean) => void`                                | Toggle checkbox value       |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult<unknown>>` | Validate field              |

### useCheckboxGroup Returns

| Name                 | Type                                                       | Description                                    |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                                | Description element props                      |
| `errorMessage`       | `Ref<string>`                                              | Error message text                             |
| `errorMessageProps`  | `Ref<AriaErrorMessageProps>`                               | Error element props                            |
| `errors`             | `Ref<{}>`                                                  | Field errors                                   |
| `fieldValue`         | `Ref<TValue>`                                              | Field value                                    |
| `groupId`            | `string`                                                   | Group element ID                               |
| `groupProps`         | `Ref<CheckboxGroupDomProps>`                               | Group binding props                            |
| `groupState`         | `Ref<CheckboxGroupState>`                                  | State: `'checked'` / `'unchecked'` / `'mixed'` |
| `isBlurred`          | `Ref<boolean>`                                             | Blurred state                                  |
| `isDirty`            | `Ref<boolean>`                                             | Dirty state                                    |
| `isDisabled`         | `Ref<boolean>`                                             | Disabled state                                 |
| `isTouched`          | `Ref<boolean>`                                             | Touched state                                  |
| `isValid`            | `Ref<boolean>`                                             | Valid state                                    |
| `isValidated`        | `Ref<boolean>`                                             | Validated state                                |
| `labelProps`         | `Ref<AriaLabelProps>`                                      | Label element props                            |
| `setBlurred`         | `(blurred: boolean) => void`                               | Set blurred state                              |
| `setErrors`          | `(messages: Arrayable<string>) => void`                    | Set error messages                             |
| `setIsValidated`     | `(isValidated: boolean) => void`                           | Set validated state                            |
| `setTouched`         | `(touched: boolean) => void`                               | Set touched state                              |
| `setValue`           | `(value: {}) => void`                                      | Set field value                                |
| `submitErrorMessage` | `Ref<string>`                                              | Submit error message                           |
| `submitErrors`       | `Ref<{}>`                                                  | Submit errors                                  |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult<unknown>>` | Validate field                                 |
