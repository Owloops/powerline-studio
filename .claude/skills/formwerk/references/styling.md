# Styling

Formwerk provides form logic without built-in CSS or HTML structure. Style components using custom CSS or frameworks like Tailwind CSS.

## Pseudo Classes

### `:invalid` and `:valid`

Applied to input elements based on validity state. Considered "too aggressive" -- styles apply **before** user interaction.

```vue
<script setup lang="ts">
import TextField from './TextField.vue'
</script>

<template>
	<TextField label="Email" required type="email" />
	<TextField label="Password" required type="password" min-length="8" />
</template>

<style>
.field:has(:invalid) {
	input {
		border-color: red;
	}
	.error {
		display: block;
	}
}

.field:has(:valid) {
	input {
		border-color: green;
	}
}
</style>
```

### `:user-invalid` and `:user-valid`

Applied **only after user interaction** (value change or form submission). Better UX by avoiding premature error styling.

```css
.field:has(:user-invalid) {
	input {
		border-color: red;
	}
	.error {
		display: block;
	}
}

.field:has(:user-valid) {
	input {
		border-color: green;
	}
}
```

### `:disabled`

Applied to disabled input elements. For non-input base elements, use `aria-disabled` instead.

```css
*:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
```

### `:focus`

Applied when an element receives focus. Formwerk manages focus state for many components. Key use cases:

- Highlighting focused inputs
- Highlighting focused option elements in Select (keyboard navigation)
- Highlighting focused checkboxes and radio button items
- Highlighting focused slider knobs

## ARIA Attributes

Formwerk automatically generates accessible ARIA attributes. Use them for styling:

| Attribute          | Description                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `aria-required`    | Element requires input. Applied if base element is **not** an `<input>`.                                            |
| `aria-disabled`    | Element is disabled. Applied if base element is **not** an `<input>`.                                               |
| `aria-invalid`     | Element is invalid. **Always applied.**                                                                             |
| `aria-selected`    | Element is selected. Used for option components in single-selection Select fields.                                  |
| `aria-checked`     | Element is checked. For checkboxes/radios if base is **not** `<input>`. Also for switches and multi-select options. |
| `aria-orientation` | Element orientation. Commonly applied on sliders.                                                                   |
| `aria-expanded`    | Element is expanded. Commonly applied in Select fields.                                                             |

## `:has()` Selector

Style parent elements based on child conditions, eliminating dynamic classes or JavaScript.

**Example -- required field asterisk:**

```vue
<script setup lang="ts">
import TextField from './TextField.vue'
</script>

<template>
	<TextField label="Email" required type="email" class="Field" />
	<TextField label="Password" required type="password" class="Field" />
	<TextField label="Name" class="Field" />
</template>

<style>
.Field:has(:required) {
	label {
		&::after {
			content: ' *';
			color: red;
		}
	}
}
</style>
```

Works with any pseudo-class or ARIA attribute applied to child elements.

## Full TextField Component Example

A complete example showing all styling patterns together:

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

<style scoped>
.field {
	--color-primary: #10b981;
	--color-text-primary: #333;
	--color-text-secondary: #666;
	--color-border: #d4d4d8;
	--color-focus: var(--color-primary);
	--color-error: #f00;

	label {
		display: block;
		margin-bottom: 0.25rem;
		font-size: 14px;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.hint {
		font-size: 13px;
		color: var(--color-text-secondary);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.hint,
	.error {
		margin-top: 0.25rem;
	}

	input {
		display: block;
		width: max-content;
		padding: 0.5rem 0.6rem;
		font-size: 13px;
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		transition: border-color 0.3s ease;

		&:focus {
			outline: none;
			border-color: var(--color-focus);
			box-shadow: 0 0 0 1px var(--color-focus);
		}
	}

	.error {
		display: none;
		font-size: 13px;
		color: var(--color-error);
	}

	&:has(:focus) {
		.hint {
			opacity: 1;
		}
	}
}
</style>
```
