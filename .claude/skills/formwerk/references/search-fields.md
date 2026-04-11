# Search Fields

Search fields are specialized input elements designed for user search queries. They function identically to text inputs but offer distinct behaviors suited for search use cases.

## Key Differences from Text Fields

- Text content clearable via button or keyboard shortcut (Esc key)
- Often used without parent `form` element or submit button
- Can submit independently with Enter key

## Features

- Uses `input[type="search"]` as base element
- Automatic ARIA labeling and descriptions
- Custom clear button support
- HTML constraint and Standard Schema validation
- `v-model` binding support
- Keyboard support (Esc to clear, Enter to submit)

## Anatomy

- Label
- Input field
- Clear button
- Help text (description or error message)

## Building a Search Field Component

```vue
<script setup lang="ts">
import { type SearchFieldProps, useSearchField } from '@formwerk/core'

const props = defineProps<SearchFieldProps>()
const { inputProps, labelProps, fieldValue, errorMessage, errorMessageProps, clearBtnProps } =
	useSearchField(props)
</script>

<template>
	<div class="search-field" :class="{ 'is-blank': !fieldValue }">
		<label v-bind="labelProps">{{ label }}</label>
		<div class="input-wrapper">
			<input v-bind="inputProps" />
			<button class="clear-btn" v-bind="clearBtnProps">Clear</button>
		</div>
		<div v-if="errorMessage" v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

## Validation

### HTML Constraints

| Name        | Type               | Description                   |
| ----------- | ------------------ | ----------------------------- |
| `maxLength` | `number`           | Maximum character count       |
| `minLength` | `number`           | Minimum character count       |
| `required`  | `boolean`          | Whether field is required     |
| `pattern`   | `string \| RegExp` | Regular expression validation |

```vue
<SearchField label="Keywords" placeholder="Search for..." required min-length="3" max-length="8" />
```

### Standard Schema Validation

```vue
<script setup lang="ts">
import { z } from 'zod'

const schema = z.string().min(3).max(8)
</script>

<template>
	<SearchField label="Standard Schema" placeholder="Search for..." :schema="schema" />
</template>
```

### Mixed Validation

HTML constraints validate first; Standard Schema validates after all constraints pass.

```vue
<SearchField label="Mixed Validation" placeholder="Search for..." :schema="schema" required />
```

Disable native validation with `disable-html-validation` prop.

## Usage

### Disabled

Disabled fields skip validation and form submission.

```vue
<SearchField label="Disabled" disabled value="Well..." />
```

### Readonly

Readonly fields validate and submit but reject user input. Field remains focusable.

```vue
<SearchField label="Readonly" value="Can't change this" readonly />
```

### RTL Support

```vue
<SearchField label="البحث" placeholder="ابحث عن..." dir="rtl" />
```

### Submit Handler

Empty fields can submit, so implement validation as needed.

```vue
<script setup lang="ts">
const onSubmit = (value: string) => {
	alert(`Searching for: ${value}`)
}
</script>

<template>
	<SearchField label="Search" placeholder="Search for..." @submit="onSubmit" />
</template>
```

## API Reference

### Props

`useSearchField` accepts `SearchFieldProps`. All props can be passed as `Ref<T>` or `() => T`.

### Returns

| Name                | Type                                              | Description                      |
| ------------------- | ------------------------------------------------- | -------------------------------- |
| `inputProps`        | `Ref`                                             | Bindings for input element       |
| `labelProps`        | `Ref`                                             | Bindings for label element       |
| `fieldValue`        | `Ref`                                             | Current field value              |
| `errorMessage`      | `Ref<string>`                                     | Field error message              |
| `errorMessageProps` | `Ref`                                             | Bindings for error display       |
| `descriptionProps`  | `Ref`                                             | Bindings for description element |
| `clearBtnProps`     | `Ref`                                             | Bindings for clear button        |
| `isValid`           | `Ref<boolean>`                                    | Validation status                |
| `isDirty`           | `Ref<boolean>`                                    | Whether field modified           |
| `isTouched`         | `Ref<boolean>`                                    | Whether field accessed           |
| `isBlurred`         | `Ref<boolean>`                                    | Focus state                      |
| `validate`          | `(mutate?: boolean) => Promise<ValidationResult>` | Manual validation trigger        |
| `setValue`          | `(value: string) => void`                         | Update field value               |
| `setErrors`         | `(messages: Arrayable<string>) => void`           | Set custom errors                |
