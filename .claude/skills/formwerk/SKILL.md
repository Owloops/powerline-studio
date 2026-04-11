---
name: formwerk
description: FormWerk headless form composables for Vue — useTextField, useNumberField, useForm, useCustomField, validation with Zod/Valibot Standard Schema
argument-hint: '[question or describe what you want to build]'
---

# FormWerk

Headless form composables for Vue. Provides accessible, zero-markup-opinion form primitives with built-in validation (HTML constraints + Standard Schema via Zod/Valibot) and state management.

```bash
pnpm add @formwerk/core
```

## Reference Pages

Read the relevant reference files based on the task at hand:

### Guides

- [getting-started.md] — Installation, core pattern (binding objects + v-bind), building first component
- [why.md] — Philosophy: headless, composable-based, Standard Schema, accessibility-first
- [composables.md] — Full list of available composables and what they do

### Forms

- [forms.md] — `useForm`: submission handling, controlled/uncontrolled fields, nested fields (dot notation), data conversion (toObject/toJSON/toFormData), submit state, scroll to invalid, reset, type inference
- [validation.md] — HTML Constraint Validation, Standard Schema (Zod/Valibot/Arktype), validation triggers (blur/change/submit), error display properties, 4-layer priority cascade, disabling HTML5 validation
- [form-groups.md] — `useFormGroup`: fieldset grouping, name prefixing for nested data, group-level schemas, group state/methods
- [form-repeater.md] — `useFormRepeater`: dynamic arrays, Iteration component, add/remove/insert/move/swap, min/max, TransitionGroup animations

### Field Composables

- [text-fields.md] — `useTextField`: text/email/url/password/tel, props, multiline (textarea), returns
- [number-fields.md] — `useNumberField`: min/max/step, increment/decrement buttons, locale formatting, Intl.NumberFormat
- [search-fields.md] — `useSearchField`: search input with clear button, onClear callback
- [checkboxes.md] — `useCheckbox` + `useCheckboxGroup`: single/group, indeterminate, mixed state
- [radios.md] — `useRadioGroup` + `useRadio`: radio groups, orientation, keyboard navigation
- [selects.md] — `useSelect` + `useOption` + `useOptionGroup`: single select, popup listbox, Popover API, keyboard nav
- [comboboxes.md] — `useComboBox` + `useOption`: text + dropdown, filtering strategies, keyboard nav
- [date-fields.md] — `useDateField` + `useDateSegment`: segmented date input, calendar picker integration, min/max dates, formatting
- [time-fields.md] — `useTimeField` + `useTimeSegment`: segmented time input, 12/24h, min/max time
- [calendars.md] — `useCalendar` + `useCalendarCell`: month grid, keyboard nav, min/max, formatters
- [file-fields.md] — `useFileField`: drag-and-drop, accept filter, multiple, max size validation
- [otp-fields.md] — `useOtpField` + `useOtpSlot`: one-time password, slot-based, auto-focus, accept pattern
- [sliders.md] — `useSlider` + `useSliderThumb`: single/range, min/max/step, orientation, output display
- [switches.md] — `useSwitch`: toggle, trueValue/falseValue, label positioning
- [hidden-fields.md] — `useHiddenField`: invisible form values, no validation
- [custom-fields.md] — `useCustomField`: wrap ANY third-party component, manual setValue/validate, full control

### Extras

- [i18n.md] — Locale configuration, `configure({ locale })`, Vue I18n integration, Nuxt I18n, RTL
- [styling.md] — CSS pseudo-classes (`:user-invalid`, `:disabled`), ARIA attributes, `:has()` patterns
- [ssr.md] — SSR compatible, requires Vue 3.5+ (useId), no special config needed
- [resources.md] — Community links (Discord, GitHub)

## Quick Reference

### Core Pattern

Every composable returns **binding objects** you spread with `v-bind`:

```vue
<script setup lang="ts">
import { type TextFieldProps, useTextField } from '@formwerk/core'

const props = defineProps<TextFieldProps>()
const { inputProps, labelProps, errorMessage, errorMessageProps, descriptionProps, isTouched } =
	useTextField(props)
</script>

<template>
	<div>
		<label v-bind="labelProps">{{ label }}</label>
		<input v-bind="inputProps" />
		<div v-if="description" v-bind="descriptionProps">{{ description }}</div>
		<div v-if="isTouched && errorMessage" v-bind="errorMessageProps">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

## Key Composables

### useTextField

```vue
<script setup lang="ts">
import { type TextFieldProps, useTextField } from '@formwerk/core'

const props = defineProps<TextFieldProps>()
const { inputProps, labelProps, errorMessage, errorMessageProps } = useTextField(props)
</script>
```

Props: `name`, `label`, `type` (text/email/url/password/tel/search), `required`, `minlength`, `maxlength`, `pattern`, `schema`, `description`, `disabled`, `readonly`, `modelValue`

### useNumberField

```vue
<script setup lang="ts">
import { type NumberFieldProps, useNumberField } from '@formwerk/core'

const props = defineProps<NumberFieldProps>()
const { inputProps, labelProps, errorMessage, incrementButtonProps, decrementButtonProps } =
	useNumberField(props)
</script>
```

Props: `name`, `label`, `min`, `max`, `step`, `required`, `schema`, `locale`, `formatOptions`

### useSelect

```vue
<script setup lang="ts">
import { type SelectProps, useSelect } from '@formwerk/core'

const props = defineProps<SelectProps>()
const { triggerProps, listboxProps, labelProps, options, errorMessage } = useSelect(props)
</script>
```

### useCheckbox / useRadioGroup / useSwitch

```vue
<script setup lang="ts">
import { type CheckboxProps, useCheckbox } from '@formwerk/core'

const props = defineProps<CheckboxProps>()
const { inputProps, labelProps, isChecked, errorMessage } = useCheckbox(props)
</script>
```

## useForm

Creates a form context. Use once per component. All child field composables automatically register.

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import TextField from './TextField.vue'

const { handleSubmit, values } = useForm()

const onSubmit = handleSubmit((data) => {
	// data.toObject() -> typed form values
	console.log(data.toObject())
})
</script>

<template>
	<form @submit="onSubmit" novalidate>
		<TextField name="email" label="Email" type="email" required />
		<TextField name="password" label="Password" type="password" required />
		<button type="submit">Submit</button>
	</form>
</template>
```

### useForm with Standard Schema (Zod)

```vue
<script setup lang="ts">
import { useForm } from '@formwerk/core'
import { z } from 'zod'

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
})

const { handleSubmit } = useForm({ schema })

const onSubmit = handleSubmit((data) => {
	data.toObject() // typed: { email: string; password: string }
})
</script>

<template>
	<form @submit="onSubmit" novalidate>
		<TextField name="email" label="Email" type="email" />
		<TextField name="password" label="Password" type="password" />
		<button type="submit">Submit</button>
	</form>
</template>
```

### useCustomField (wrapping reka-ui/shadcn-vue)

```vue
<script setup lang="ts">
import { useCustomField, type CustomFieldProps } from '@formwerk/core'

const props = defineProps<CustomFieldProps & { options: string[] }>()
const {
	controlProps,
	labelProps,
	errorMessage,
	errorMessageProps,
	setValue,
	validate,
	setTouched,
	isTouched,
	isDisabled,
	fieldValue,
} = useCustomField<string>(props)

function onValueChange(value: string) {
	setValue(value) // Must call manually — FormWerk can't hook into 3rd-party events
	validate() // Must trigger validation manually
}
</script>

<template>
	<div>
		<label v-bind="labelProps">{{ label }}</label>
		<!-- Your reka-ui/shadcn component here -->
		<SomeThirdPartySelect
			v-bind="controlProps"
			:model-value="fieldValue"
			@update:model-value="onValueChange"
		/>
		<div v-if="isTouched && errorMessage" v-bind="errorMessageProps">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

**Key point:** With `useCustomField`, you must call `setValue()` and `validate()` manually because FormWerk cannot hook into third-party component events.

## Validation

### HTML Constraint Validation

Built-in via props — `required`, `minlength`, `maxlength`, `min`, `max`, `pattern`, `type`:

```vue
<TextField name="email" label="Email" type="email" required minlength="5" />
```

### Standard Schema Validation (Zod/Valibot)

Per-field schema:

```vue
<script setup lang="ts">
import { z } from 'zod'
const emailSchema = z.string().email().min(5)
</script>

<template>
	<TextField name="email" label="Email" :schema="emailSchema" />
</template>
```

Form-level schema (recommended):

```ts
import { useForm } from '@formwerk/core'
import * as v from 'valibot'

const schema = v.object({
	email: v.pipe(v.string(), v.email()),
	password: v.pipe(v.string(), v.minLength(8)),
})

const { handleSubmit } = useForm({ schema })
```

### Disable HTML5 Validation Globally

```ts
import { configure } from '@formwerk/core'
configure({ disableHtmlValidation: true })
```

## Error Display Properties

All field composables expose:

| Property       | Type            | Description                            |
| -------------- | --------------- | -------------------------------------- |
| `errors`       | `Ref<string[]>` | All error messages                     |
| `errorMessage` | `Ref<string>`   | First error message                    |
| `isTouched`    | `Ref<boolean>`  | User has interacted with field         |
| `isBlurred`    | `Ref<boolean>`  | Field has been blurred                 |
| `isValid`      | `Ref<boolean>`  | Field passes validation                |
| `isDirty`      | `Ref<boolean>`  | Value has changed                      |
| `isValidated`  | `Ref<boolean>`  | Field has been validated at least once |

### Gotchas

- `useForm` can only be called **once per component**
- Fields with `name` prop automatically register with parent form
- `handleSubmit` prevents submission if any field is invalid
- Disabled fields are excluded from validation and submit data
- For `useCustomField`: always call `validate()` after `setValue()`
- HTML validation messages use **browser locale**, not app locale
- Add `novalidate` to `<form>` when using Standard Schema validation
