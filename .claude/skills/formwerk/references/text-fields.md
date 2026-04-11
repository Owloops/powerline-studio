# Text Fields

Text fields enable users to input plain text via `input` (single line) or `textarea` (multiple lines) elements.

## Features

- Uses `input` or `textarea` elements as base
- Automatic linking of labels, descriptions, and error messages with `aria-*` attributes
- Validation support via native HTML constraints or Standard Schema
- `v-model` binding support

## Anatomy

- Label
- Value
- Input
- Help text (Description or Error Message)

## Building a Text Field Component

```vue
<script setup lang="ts">
import { type TextFieldProps, useTextField } from '@formwerk/core'
const props = defineProps<TextFieldProps>()
const { inputProps, labelProps, errorMessage, errorMessageProps, descriptionProps } =
	useTextField(props)
</script>
<template>
	<div class="field">
		<label v-bind="labelProps">{{ label }}</label>
		<input v-bind="inputProps" />

		<div v-if="errorMessage" v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
		<div v-if="description" v-bind="descriptionProps" class="hint">
			{{ description }}
		</div>
	</div>
</template>
```

### Usage

```vue
<script setup lang="ts">
import TextField from './TextField.vue'
import { ref } from 'vue'
const name = ref('')
</script>
<template>
	<TextField v-model="name" label="Your name" />
</template>
```

## Supported Input Types

Only `text`, `password`, `email`, `tel`, and `url` types are supported for `input` elements. Other types have dedicated composables (NumberField, SearchField, DateField).

## Building a Text Area Component

Use `useTextField` with a `<textarea>` instead of `<input>`:

```vue
<script setup lang="ts">
import { type TextFieldProps, useTextField } from '@formwerk/core'
const props = defineProps<TextFieldProps>()
const { inputProps, labelProps, errorMessage, errorMessageProps, descriptionProps } =
	useTextField(props)
</script>
<template>
	<div class="field">
		<label v-bind="labelProps">{{ label }}</label>
		<textarea v-bind="inputProps"></textarea>

		<div v-if="errorMessage" v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
		<div v-if="description" v-bind="descriptionProps" class="hint">
			{{ description }}
		</div>
	</div>
</template>
```

```vue
<script setup lang="ts">
import TextAreaField from './TextAreaField.vue'
</script>
<template>
	<TextAreaField label="Write a poem" />
</template>
```

## Validation

### HTML Constraints

| Name        | Type               | Description                                      |
| ----------- | ------------------ | ------------------------------------------------ |
| `maxLength` | `number`           | Maximum character length                         |
| `minLength` | `number`           | Minimum character length                         |
| `required`  | `boolean`          | Field is required                                |
| `pattern`   | `string \| RegExp` | Regular expression validation (not for textarea) |

Input type validation: `email` validates as email address, `url` validates as URL.

```vue
<script setup lang="ts">
import TextField from './TextField.vue'
</script>
<template>
	<TextField label="HTML Constraints Demo" maxLength="8" minLength="3" required />
</template>
```

### Standard Schema Validation

```vue
<script setup lang="ts">
import { z } from 'zod'
import TextField from './TextField.vue'

const schema = z.string().min(3).max(8)
</script>
<template>
	<TextField label="Standard Schema" :schema="schema" />
</template>
```

### Mixed Validation

HTML constraints are validated first. Once all HTML constraints are satisfied, the Standard Schema is validated.

```vue
<script setup lang="ts">
import { z } from 'zod'
import TextField from './TextField.vue'

const schema = z.string().min(3).max(20)
</script>
<template>
	<TextField label="Mixed Validation" :schema="schema" type="url" required />
</template>
```

### Disabling HTML Validation

```vue
<script setup lang="ts">
import { z } from 'zod'
import TextField from './TextField.vue'

const schema = z.string().min(3).max(20)
</script>
<template>
	<TextField
		label="HTML Validation Disabled"
		disable-html-validation
		:schema="schema"
		type="url"
		required
	/>
</template>
```

## Usage

### Disabled

Disabled fields are not validated and are not submitted.

```vue
<TextField label="Disabled Field" disabled />
```

### Readonly

Readonly fields are validated and submitted, but they do not accept user input.

```vue
<TextField label="Readonly Field" value="You can't change me" readonly />
```

### RTL Support

```vue
<TextField name="fullName" label="ما هو اسمك؟" dir="rtl" />
```

## Styling

Formwerk uses the `:user-invalid` pseudo-class to control error display without JavaScript.

## API Reference

### Props

`useTextField` accepts `TextFieldProps`. All props can be passed as `Ref<T>` or `() => T` with reactivity handled automatically.

### Returns

| Name                 | Type                                                       | Description                                                                |
| -------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| `controlId`          | `string`                                                   | Unique field identifier                                                    |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                                | Props for description element                                              |
| `errorMessage`       | `Ref<string>`                                              | Current error message                                                      |
| `errorMessageProps`  | `Ref<AriaErrorMessageProps>`                               | Props for error message element                                            |
| `errors`             | `Ref<{}>`                                                  | Field errors object                                                        |
| `field`              | `FieldState<string>`                                       | Field state                                                                |
| `fieldValue`         | `Ref<TValue>`                                              | Field value                                                                |
| `inputEl`            | `Ref<HTMLInputElement>`                                    | Input element reference                                                    |
| `inputProps`         | `Ref<object>`                                              | Props with value, maxlength, minlength, disabled, pattern, aria attributes |
| `isBlurred`          | `Ref<boolean>`                                             | Blur state                                                                 |
| `isDirty`            | `Ref<boolean>`                                             | Dirty state (value changed)                                                |
| `isDisabled`         | `Ref<boolean>`                                             | Disabled state                                                             |
| `isTouched`          | `Ref<boolean>`                                             | Touched state                                                              |
| `isValid`            | `Ref<boolean>`                                             | Validation state                                                           |
| `isValidated`        | `Ref<boolean>`                                             | Whether validation occurred                                                |
| `labelProps`         | `Ref<AriaLabelProps>`                                      | Props for label element                                                    |
| `model`              | `Ref<string>`                                              | Two-way binding model                                                      |
| `setBlurred`         | `(blurred: boolean) => void`                               | Set blur state                                                             |
| `setErrors`          | `(messages: Arrayable<string>) => void`                    | Set error messages                                                         |
| `setIsValidated`     | `(isValidated: boolean) => void`                           | Set validation state                                                       |
| `setTouched`         | `(touched: boolean) => void`                               | Set touched state                                                          |
| `setValue`           | `(value: string) => void`                                  | Set field value                                                            |
| `submitErrorMessage` | `Ref<string>`                                              | Error from last submit attempt                                             |
| `submitErrors`       | `Ref<{}>`                                                  | Errors from last submit attempt                                            |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult<unknown>>` | Manual validation function                                                 |
