# Forms

Forms enable users to fill and submit data with validation feedback and state tracking.

## Features

- Value tracking and submission handling
- Nested fields and arrays support
- Controlled and uncontrolled fields
- Multi-layered validation (HTML attributes or Standard Schemas)
- Aggregated state for validation, dirty, touched properties
- Type safety for form data and submitted data
- Scrolling to first invalid field after submission
- Submitted data as plain object, JSON, or FormData object

## useForm Composable

### Basic Usage

```ts
import { useForm } from '@formwerk/core'

const { handleSubmit } = useForm()

const onSubmit = handleSubmit((data) => {
	console.log(data)
})
```

### With Fields

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'
import Checkbox from './Checkbox.vue'

const { handleSubmit } = useForm()

const onSubmit = handleSubmit((data) => {
	alert(JSON.stringify(data.toObject(), null, 2))
})
</script>

<template>
	<form @submit="onSubmit" novalidate>
		<TextField name="email" label="Email" type="email" required />
		<TextField name="password" label="Password" type="password" required />
		<Checkbox label="Remember me" name="rememberMe" />
		<button type="submit">Submit</button>
	</form>
</template>
```

## Controlled Fields

Fields with a `name` prop are "controlled" — tracked by the form and included in submitted data. Fields without `name` are uncontrolled.

### Conditional Fields

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'
import Checkbox from './Checkbox.vue'

const { handleSubmit } = useForm()
const isSameAsBilling = ref(false)

const onSubmit = handleSubmit((data) => {
	const json = data.toObject()
	if (isSameAsBilling.value) {
		json.billingAddress = json.shippingAddress
	}
	alert(JSON.stringify(json, null, 2))
})
</script>

<template>
	<form @submit="onSubmit" novalidate>
		<TextField name="shippingAddress" label="Shipping Address" required />
		<TextField v-if="!isSameAsBilling" name="billingAddress" label="Billing Address" required />
		<Checkbox label="Same as shipping" v-model="isSameAsBilling" />
		<button type="submit">Submit</button>
	</form>
</template>
```

## Nested Fields

Use dot notation (`.`) for nested objects. Numeric path segments create arrays.

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'

const { handleSubmit } = useForm()

const onSubmit = handleSubmit((data) => {
	alert(JSON.stringify(data.toObject(), null, 2))
})
</script>

<template>
	<form @submit="onSubmit" novalidate>
		<TextField name="socials.github" label="GitHub" type="url" required />
		<TextField name="socials.twitter" label="Twitter" type="url" required />
		<TextField name="socials.discord" label="Discord" type="url" required />
		<TextField name="customLinks.0" label="Custom link 1" type="url" />
		<TextField name="customLinks.1" label="Custom Link 2" type="url" />
		<button type="submit">Submit</button>
	</form>
</template>
```

Produces:

```json
{
	"socials": { "github": "...", "twitter": "...", "discord": "..." },
	"customLinks": ["...", "..."]
}
```

## Submitting Forms

### handleSubmit

Returns a function that validates the form, then calls the callback only if valid. Does not require a `<form>` element.

```ts
const onSubmit = handleSubmit((data) => {
	alert(JSON.stringify(data.toObject(), null, 2))
})

// Can be called programmatically
function onClick() {
	onSubmit()
}
```

### Data Conversion Methods

#### `data.toObject()`

Returns a plain JavaScript object:

```ts
const onSubmit = handleSubmit((data) => {
	data.toObject() // { email: '...', password: '...', rememberMe: true }
})
```

#### `data.toJSON()`

Returns a JSON-serializable object. Converts non-serializable values:

- `undefined` values removed
- `Date` objects converted to strings
- `File` objects handled
- `Function`, `BigInt`, `Symbol` values converted

```ts
const onSubmit = handleSubmit(async (data) => {
	const response = await fetch('https://example.org/post', {
		body: JSON.stringify(data.toJSON()),
	})
})
```

#### `data.toFormData()`

Returns a `FormData` object. Useful for file submissions:

```ts
const onSubmit = handleSubmit((data) => {
	data.toFormData() // FormData
})
```

### formProps for Native Submissions

Use `formProps` for native form submissions without JavaScript handling:

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'
import Checkbox from './Checkbox.vue'

const { formProps } = useForm()
</script>

<template>
	<form v-bind="formProps" target="_blank" action="/form-d">
		<TextField name="email" label="Email" type="email" required />
		<TextField name="password" label="Password" type="password" required />
		<Checkbox label="Remember me" name="rememberMe" />
		<button type="submit">Submit</button>
	</form>
</template>
```

Formwerk collects values from custom input components alongside native inputs.

## Submit State

### isSubmitting

Boolean ref — `true` during async handler execution:

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'

const { handleSubmit, isSubmitting } = useForm()

const onSubmit = handleSubmit(async (data) => {
	await new Promise((resolve) => setTimeout(resolve, 2000))
	alert(JSON.stringify(data.toObject(), null, 2))
})
</script>

<template>
	<form @submit="onSubmit" novalidate>
		<TextField name="email" label="Email" type="email" required />
		<TextField name="password" label="Password" type="password" required />
		<button :disabled="isSubmitting" type="submit">Submit</button>
	</form>
</template>
```

### wasSubmitted

Boolean — `true` after handler completes successfully:

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'

const { handleSubmit, wasSubmitted } = useForm()

const onSubmit = handleSubmit(async (data) => {
	console.log(JSON.stringify(data.toObject(), null, 2))
})
</script>

<template>
	<form v-if="!wasSubmitted" @submit="onSubmit" novalidate>
		<TextField name="email" label="Email" type="email" required />
		<TextField name="password" label="Password" type="password" required />
		<button type="submit">Submit</button>
	</form>
	<p v-else>Form was submitted</p>
</template>
```

### submitAttemptsCount

Number of submission attempts regardless of validity.

### isSubmitAttempted

Boolean — `true` if form was submitted (valid or invalid).

## Scrolling to Invalid Fields

Default: scrolls to first invalid field on submission with smooth behavior.

```ts
// Custom scroll options
useForm({
	scrollToInvalidFieldOnSubmit: {
		behavior: 'instant', // default: 'smooth'
		block: 'center', // default: 'center'
		inline: 'start', // default: 'start'
	},
})

// Disable scrolling
useForm({
	scrollToInvalidFieldOnSubmit: false,
})
```

## Touched Fields

A field is touched when the user focuses and blurs it. All fields are marked touched on form submission.

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'

const { handleSubmit, isTouched } = useForm()

const onSubmit = handleSubmit((data) => {
	console.log('All fields should be touched now')
})
</script>

<template>
	<form @submit="onSubmit" novalidate>
		<TextField name="email" label="Email" type="email" />
		<TextField name="password" label="Password" type="password" />
		<pre>Email Touched: {{ isTouched('email') }}</pre>
		<pre>Password Touched: {{ isTouched('password') }}</pre>
		<pre>Form Touched: {{ isTouched() }}</pre>
		<button type="submit">Submit</button>
	</form>
</template>
```

### Setting Touched State

```ts
import { useForm } from '@formwerk/core'

const { setTouched } = useForm()

// Set specific field
setTouched('email', true)

// Set all fields
setTouched(true)
```

## Dirty Fields

A field is dirty when its value changes from its initial value. Dirty state is computed and cannot be set manually.

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'

const { isDirty } = useForm()
</script>

<template>
	<TextField name="email" label="Email" type="email" />
	<TextField name="password" label="Password" type="password" />
	<pre>Email Dirty: {{ isDirty('email') }}</pre>
	<pre>Password Dirty: {{ isDirty('password') }}</pre>
	<pre>Form Dirty: {{ isDirty() }}</pre>
</template>
```

## Validation

### HTML Constraints

Field-level validation using HTML attributes (`required`, `min`, `max`, `minlength`, `maxlength`, `type`).

Disable HTML validation:

```ts
useForm({
	disableHtmlValidation: true,
})
```

### Form-Level Validation with Standard Schemas

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'
import { z } from 'zod'

const { handleSubmit } = useForm({
	schema: z.object({
		email: z.string().email(),
		password: z.string().min(8),
	}),
})

const onSubmit = handleSubmit((data) => {
	alert(JSON.stringify(data.toObject(), null, 2))
})
</script>

<template>
	<form @submit="onSubmit" novalidate>
		<TextField name="email" label="Email" />
		<TextField name="password" label="Password" type="password" />
		<button type="submit">Submit</button>
	</form>
</template>
```

### Validation Priority (Cascading)

1. **HTML Constraints** — checked first; stops if invalid
2. **Field-level Standard Schema** — checked if HTML valid; stops if invalid
3. **Form-level Standard Schema** — checked if field schema valid

## Displaying Errors

### getError(fieldName)

Returns error string for a specific field, or `undefined`:

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'
import { z } from 'zod'

const { handleSubmit, getError } = useForm({
	schema: z.object({
		url: z.string().url().max(8),
		email: z.string().email(),
	}),
})
</script>

<template>
	<TextField name="url" label="URL" required />
	<TextField name="email" label="Email" required />
	<ul>
		<li>URL Error: {{ getError('url') }}</li>
		<li>Email Error: {{ getError('email') }}</li>
	</ul>
</template>
```

### getErrors()

Returns array of error groups with `path` and `messages`:

```vue
<template>
	<ul>
		<li v-for="error in getErrors()">{{ error.path }}: {{ error.messages }}</li>
	</ul>
</template>
```

## Submit Errors

Submit errors appear only after submission. Access via:

- **Field-level:** `submitErrorMessage` and `submitErrors` from field composables
- **Form-level:** `getSubmitError(fieldName)` and `getSubmitErrors()` from `useForm`

```ts
import { useTextField } from '@formwerk/core'
const { submitErrorMessage, submitErrors } = useTextField({
	/* ... */
})

import { useForm } from '@formwerk/core'
const { getSubmitError, getSubmitErrors } = useForm()
```

## Resetting Forms

`reset()` resets values to initial state, clears touched state, removes custom errors, clears `wasSubmitted`, and resets `submitAttemptsCount`:

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'
import Checkbox from './Checkbox.vue'

const { handleSubmit, reset } = useForm()

const onSubmit = handleSubmit((data) => {
	alert(JSON.stringify(data.toObject(), null, 2))
})
</script>

<template>
	<form @submit="onSubmit" novalidate>
		<TextField name="email" label="Email" type="email" required />
		<TextField name="password" label="Password" type="password" required />
		<Checkbox label="Remember me" name="rememberMe" />
		<button type="submit">Submit</button>
		<button type="button" @click="reset()">Reset</button>
	</form>
</template>
```

## Form Types

### Via initialValues

```ts
const { handleSubmit } = useForm({
	initialValues: {
		email: '',
		password: '',
	},
})
```

### Via Standard Schema

```ts
import { z } from 'zod'

const { handleSubmit } = useForm({
	schema: z.object({
		email: z.string().email(),
		password: z.string().min(8),
	}),
})
```

Both approaches infer types for `values` and `handleSubmit` callback data.

## API Reference

### useForm Props

| Prop                           | Type                           | Description                                           |
| ------------------------------ | ------------------------------ | ----------------------------------------------------- |
| `schema`                       | `StandardSchema`               | Form-level Standard Schema for validation             |
| `initialValues`                | `Record<string, any>`          | Initial form values                                   |
| `disableHtmlValidation`        | `boolean`                      | Disable HTML constraint validation                    |
| `scrollToInvalidFieldOnSubmit` | `boolean \| ScrollViewOptions` | Configure or disable scrolling to first invalid field |

### useForm Returns

| Name                  | Type                                              | Description                                   |
| --------------------- | ------------------------------------------------- | --------------------------------------------- |
| `handleSubmit`        | `(cb: (data) => void) => (e?) => void`            | Creates a submit handler that validates first |
| `formProps`           | `Ref<{ onSubmit, novalidate }>`                   | Props to bind to `<form>` element             |
| `isSubmitting`        | `Ref<boolean>`                                    | True during async handler execution           |
| `wasSubmitted`        | `Ref<boolean>`                                    | True after handler completes successfully     |
| `isSubmitAttempted`   | `Ref<boolean>`                                    | True if form was submitted (valid or not)     |
| `submitAttemptsCount` | `Ref<number>`                                     | Number of submission attempts                 |
| `isValid`             | `Ref<boolean>`                                    | Whether all fields are valid                  |
| `isTouched`           | `(fieldName?: string) => boolean`                 | Check touched state (field or form)           |
| `setTouched`          | `(field: string \| true, value: boolean) => void` | Set touched state                             |
| `isDirty`             | `(fieldName?: string) => boolean`                 | Check dirty state (field or form)             |
| `getError`            | `(fieldName: string) => string \| undefined`      | Get first error for a field                   |
| `getErrors`           | `() => Array<{ path, messages }>`                 | Get all validation errors                     |
| `getSubmitError`      | `(fieldName: string) => string \| undefined`      | Get submit error for a field                  |
| `getSubmitErrors`     | `() => Array<{ path, messages }>`                 | Get all submit errors                         |
| `reset`               | `() => void`                                      | Reset form to initial state                   |
| `values`              | `Ref<Record<string, any>>`                        | Reactive form values                          |
