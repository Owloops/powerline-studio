# Form Groups

Form groups structure related fields in a form. They organize forms into manageable sections, support nested data, and enable group-level validation. They are **not** nested forms and do not submit independently.

## Features

- Multi-layered validation with HTML attributes or Standard Schemas
- Aggregated state for validation, dirty, touched status
- Support for `<fieldset>`/`<legend>` or any HTML elements
- Automatic field name prefixing for organizing submitted data structure

## Basic Usage

### With Fieldset

**FormGroup.vue:**

```vue
<script setup lang="ts">
import { type FormGroupProps, useFormGroup } from '@formwerk/core'

const props = defineProps<FormGroupProps>()
const { labelProps, groupProps } = useFormGroup(props)
</script>

<template>
	<fieldset v-bind="groupProps">
		<legend v-bind="labelProps">{{ label }}</legend>
		<slot />
	</fieldset>
</template>
```

### With Div

```vue
<script setup lang="ts">
import { type FormGroupProps, useFormGroup } from '@formwerk/core'

const props = defineProps<FormGroupProps>()
const { labelProps, groupProps } = useFormGroup(props)
</script>

<template>
	<div v-bind="groupProps">
		<h3 v-bind="labelProps">{{ label }}</h3>
		<slot />
	</div>
</template>
```

### Form Usage

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'
import FormGroup from './FormGroup.vue'

const { handleSubmit } = useForm()
const onSubmit = handleSubmit((data) => {
	alert(JSON.stringify(data.toObject(), null, 2))
})
</script>

<template>
	<form @submit="onSubmit" novalidate>
		<TextField name="email" label="Email" type="email" required />

		<FormGroup name="shipping" label="Shipping information">
			<TextField name="address" label="Address" required />
			<TextField name="city" label="City" required />
			<TextField name="zip" label="ZIP" required />
		</FormGroup>

		<button type="submit">Submit</button>
	</form>
</template>
```

## Group Names and Nested Paths

A group's `name` prop prefixes all nested field names, nesting submitted data under the group name.

```vue
<template>
	<form @submit="onSubmit" novalidate>
		<TextField name="field" label="Not Nested" />

		<FormGroup name="group-1" label="Group 1">
			<TextField name="field" label="Field 1 - Group 1" />
		</FormGroup>

		<FormGroup name="group-2" label="Group 2">
			<TextField name="field" label="Field 1 - Group 2" />
		</FormGroup>

		<button type="submit">Submit</button>
	</form>
</template>
```

Produces:

```json
{
	"field": "...",
	"group-1": {
		"field": "..."
	},
	"group-2": {
		"field": "..."
	}
}
```

## Validation

### Validation Priority Order

1. **HTML Constraints** — checked first; must pass to continue
2. **Field-level Standard Schema** — checked if HTML valid; must pass to continue
3. **Group-level Standard Schema** — checked if field-level valid; must pass to continue
4. **Form-level Standard Schema** — checked last

### Group-Level Validation Schema

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'
import FormGroup from './FormGroup.vue'
import { z } from 'zod'

const shippingSchema = z.object({
	address: z.string().min(5),
	city: z.string().min(3),
	zip: z.string().length(5),
})

const schema = z.object({
	email: z.string().email(),
})

const { handleSubmit } = useForm({
	schema,
})

const onSubmit = handleSubmit((data) => {
	alert(JSON.stringify(data.toObject(), null, 2))
})
</script>

<template>
	<form @submit="onSubmit" novalidate>
		<TextField name="email" label="Email" />

		<FormGroup name="shipping" label="Shipping information" :schema="shippingSchema">
			<TextField name="address" label="Address" />
			<TextField name="city" label="City" />
			<TextField name="zip" label="ZIP" />
		</FormGroup>

		<button type="submit">Submit</button>
	</form>
</template>
```

**Important:** Even though the group can have its own validation schema, it only acts as a liaison between the fields and the form schema. The form still tracks the fields, their validity, and their values.

## Group State Properties

| Name        | Type           | Description                                                 |
| ----------- | -------------- | ----------------------------------------------------------- |
| `isDirty`   | `Ref<boolean>` | Whether any field within the group has been modified        |
| `isValid`   | `Ref<boolean>` | Whether all fields within the group pass validation         |
| `isTouched` | `Ref<boolean>` | Whether any field within the group has been interacted with |

## Group Methods

| Name              | Type                                    | Description                                               |
| ----------------- | --------------------------------------- | --------------------------------------------------------- |
| `getErrors()`     | `() => IssueCollection[]`               | Returns all errors within the group                       |
| `getValues()`     | `() => Record<string, any>`             | Returns all values within the group                       |
| `getError(name)`  | `(name: string) => string \| undefined` | Returns error for a given field                           |
| `getValue(path?)` | `(path?: string) => any`                | Gets group value; passing path returns that field's value |
| `validate()`      | `() => Promise<GroupValidationResult>`  | Validates all fields within the group                     |

## API Reference

### useFormGroup Props

| Name                    | Type                                | Description                             |
| ----------------------- | ----------------------------------- | --------------------------------------- |
| `name`                  | `string`                            | The name/path of the form group         |
| `label`                 | `string`                            | The label for the form group            |
| `schema`                | `StandardSchemaV1<TInput, TOutput>` | Validation schema for the form group    |
| `disabled`              | `boolean`                           | Whether the form group is disabled      |
| `disableHtmlValidation` | `boolean`                           | Disable HTML5 validation for this group |

### useFormGroup Returns

| Name              | Type                                                                | Description                    |
| ----------------- | ------------------------------------------------------------------- | ------------------------------ |
| `groupProps`      | `Ref<GroupProps>`                                                   | Props for the group element    |
| `labelProps`      | `Ref<AriaLabelProps>`                                               | Props for the label element    |
| `groupEl`         | `Ref<HTMLInputElement>`                                             | Reference to the group element |
| `isDirty`         | `Ref<boolean>`                                                      | Whether the group is dirty     |
| `isValid`         | `Ref<boolean>`                                                      | Whether the group is valid     |
| `isTouched`       | `Ref<boolean>`                                                      | Whether the group is touched   |
| `isDisabled`      | `Ref<boolean>`                                                      | Whether the group is disabled  |
| `getError(path)`  | `(path: string) => string`                                          | Gets error for a given field   |
| `getErrors()`     | `() => IssueCollection[]`                                           | Gets all errors for the group  |
| `getValue(path?)` | `(path?: string) => any`                                            | Gets group or field value      |
| `getValues()`     | `() => Record<string, any>`                                         | Gets all values for the group  |
| `validate()`      | `() => Promise<GroupValidationResult<TOutput> & { type: "GROUP" }>` | Validates the form group       |
