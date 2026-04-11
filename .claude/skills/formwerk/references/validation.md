# Validation

Form validation provides better user experience through client-side feedback. Formwerk integrates two validation systems that work together:

- **HTML Constraint Validation API**
- **Standard Schema Validation**

## HTML Constraint Validation API

### Supported Attributes

| Attribute   | Behavior                                                                      |
| ----------- | ----------------------------------------------------------------------------- |
| `required`  | Suggestive — user can violate, sees error                                     |
| `minlength` | Suggestive — user can violate, sees error                                     |
| `maxlength` | Preventative — prevents values that violate                                   |
| `min`       | Preventative — prevents values that violate                                   |
| `max`       | Preventative — prevents values that violate                                   |
| `type`      | Suggestive — implicit validation (e.g., `type="email"` enforces email format) |

**Preventative rules** prevent invalid values from being entered.
**Suggestive rules** allow violation and show error messages.

### Caveats

- Type-specific validation is applied implicitly (e.g., `type="email"`)
- Validation messages are always in the user's browser language
- Limited for advanced scenarios

### Disabling HTML5 Validation

**Global:**

```ts
import { configure } from '@formwerk/core'

configure({
	disableHtmlValidation: true,
})
```

**Per-form or per-field:** Set `disableHtmlValidation` as a prop on individual fields, forms, or form groups.

Use case: resolves language mismatch between browser locale and application language.

## Standard Schema Validation

Implements the [Standard Schema Spec](https://github.com/standard-schema/standard-schema). Supported providers:

- **Zod**
- **Valibot**
- **Arktype**

### Example with Valibot

```ts
import * as v from 'valibot'
import { useForm } from '@formwerk/core'

const schema = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.minLength(8)),
})

const { values, handleSubmit } = useForm({
	schema,
})
```

### Type Inference

#### With useForm

```ts
const schema = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.minLength(8)),
})

const { values, handleSubmit } = useForm({
	schema,
})

// values type: { email?: string | undefined; password?: string | undefined }

const onSubmit = handleSubmit((data) => {
	data.toObject() // Type: { email: string; password: string }
})
```

#### With useFormGroup

```ts
import { useFormGroup } from '@formwerk/core'
import * as v from 'valibot'

const schema = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.minLength(8)),
})

const { getValues } = useFormGroup({
	schema,
})

// Returns: { email?: string | undefined; password?: string | undefined }
```

## Unified Validation API

Formwerk unifies standard schema validation with the HTML constraint validation API:

- Schema errors are set on the field's `validationMessage` property
- Enables CSS pseudo-classes (`:invalid`, `:valid`) regardless of validation system
- Works consistently across HTML and schema-based validation

## Validation Triggers

Formwerk validates on these events by default:

| Event     | When                                                 |
| --------- | ---------------------------------------------------- |
| `blur`    | Field loses focus                                    |
| `change`  | Field value changes                                  |
| `submit`  | Form is submitted                                    |
| `click`   | Checkbox or radio fields                             |
| `invalid` | Field becomes invalid via HTML constraint validation |

**Note:** Default validation events cannot currently be customized.

## Error Display

Formwerk always makes errors available internally regardless of user interaction. You control when to display them.

### Available Error Properties

All Formwerk field composables expose:

| Property       | Type       | Description                             |
| -------------- | ---------- | --------------------------------------- |
| `errors`       | `string[]` | All error messages if invalid           |
| `errorMessage` | `string`   | First error message (if invalid)        |
| `isTouched`    | `boolean`  | Field has been interacted with          |
| `isBlurred`    | `boolean`  | Field has been blurred                  |
| `isValid`      | `boolean`  | Field is valid                          |
| `isValidated`  | `boolean`  | Field validated due to user interaction |
| `isDirty`      | `boolean`  | Field value has changed                 |

### Show Errors on Touch Pattern

**TextField.vue:**

```vue
<script setup lang="ts">
import { type TextFieldProps, useTextField } from '@formwerk/core'

const props = defineProps<TextFieldProps>()

const { inputProps, labelProps, errorMessage, errorMessageProps, isTouched, descriptionProps } =
	useTextField(props)
</script>

<template>
	<div>
		<label v-bind="labelProps">{{ label }}</label>
		<input v-bind="inputProps" :style="{ display: 'block' }" />

		<div v-if="isTouched && errorMessage" v-bind="errorMessageProps">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

**Usage:**

```vue
<script setup lang="ts">
import TextField from './TextField.vue'
</script>

<template>
	<TextField label="Email" type="email" required />
</template>
```

### CSS Pseudo-Class Validation

Because Formwerk sets schema errors on the native `validationMessage`, you can use CSS pseudo-classes:

```css
/* Style invalid fields */
.field:has(:user-invalid) {
	--color-border: var(--color-error);
	--color-focus: var(--color-error);
}

.field:has(:user-invalid) .error {
	display: block;
}
```

## Validation Priority (Cascading)

When mixing validation sources, they are checked in order:

1. **HTML Constraints** — checked first; stops if invalid
2. **Field-level Standard Schema** — checked if HTML valid; stops if invalid
3. **Group-level Standard Schema** — checked if field schema valid; stops if invalid
4. **Form-level Standard Schema** — checked last

Each layer stops validation if it finds errors, preventing cascading error messages.

## Form-Level Error Access

```ts
import { useForm } from '@formwerk/core'

const { getError, getErrors } = useForm({
	schema: z.object({
		url: z.string().url().max(8),
		email: z.string().email(),
	}),
})

// Single field error
getError('url') // string | undefined

// All errors
getErrors() // Array<{ path: string, messages: string[] }>
```

## Submit Errors

Different from validation errors — appear only after submission:

**Field-level access:**

```ts
import { useTextField } from '@formwerk/core'

const { submitErrorMessage, submitErrors } = useTextField({
	/* ... */
})
```

**Form-level access:**

```ts
import { useForm } from '@formwerk/core'

const { getSubmitError, getSubmitErrors } = useForm()
```
