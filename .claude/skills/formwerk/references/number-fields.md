# Number Fields

Number fields include built-in validation to reject non-numerical input. Use for values meant to be consumed as numbers (units, prices, percentages) -- not for numeric identifiers like credit card numbers.

## Key Features

- Input element with `type="text"` and automatic `inputmode`
- Automatic aria-\* attribute linking for labels and descriptions
- Number formatting/parsing via `Intl.NumberFormat` API
- Multiple numeral systems support (Latin, Arabic, Chinese)
- Currency and unit support
- Spinbutton ARIA pattern for increment/decrement
- Support for `min`, `max`, `step` attributes
- Validation via HTML constraints or Standard Schema
- Rejects non-numerical characters
- `v-model` binding support

## Keyboard Shortcuts

| Key        | Description                  |
| ---------- | ---------------------------- |
| Arrow Up   | Increment by step            |
| Arrow Down | Decrement by step            |
| Page Up    | Increment by larger multiple |
| Page Down  | Decrement by larger multiple |
| Home       | Set to min value             |
| End        | Set to max value             |
| Wheel up   | Increment by step            |
| Wheel down | Decrement by step            |

## Anatomy

- Label
- Input
- Increment button
- Decrement button
- Help text (Description or Error Message)

## Building a Number Field Component

```vue
<script setup lang="ts">
import { type NumberFieldProps, useNumberField } from '@formwerk/core'

const props = defineProps<NumberFieldProps>()
const {
	inputProps,
	labelProps,
	errorMessage,
	descriptionProps,
	errorMessageProps,
	incrementButtonProps,
	decrementButtonProps,
	isTouched,
} = useNumberField(props)
</script>

<template>
	<div class="field" :class="{ 'is-touched': isTouched }">
		<label v-bind="labelProps">{{ label }}</label>
		<div class="input-wrapper">
			<input v-bind="inputProps" />
			<div class="spinbutton">
				<button type="button" v-bind="incrementButtonProps">+</button>
				<button type="button" v-bind="decrementButtonProps">-</button>
			</div>
		</div>
		<div v-if="description" v-bind="descriptionProps" class="hint">
			{{ description }}
		</div>
		<div v-if="errorMessage" v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

### Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import NumberField from './NumberField.vue'

const count = ref(5)
</script>

<template>
	<NumberField label="Count" v-model="count" />
</template>
```

## Validation

### HTML Constraints

| Name       | Type      | Description               |
| ---------- | --------- | ------------------------- |
| `max`      | `number`  | Maximum value             |
| `min`      | `number`  | Minimum value             |
| `required` | `boolean` | Whether field is required |
| `step`     | `number`  | Step amount               |

`min`, `max`, and `step` accept numbers or strings parseable as numbers.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import NumberField from './NumberField.vue'

const value = ref(26)
</script>

<template>
	<NumberField v-model="value" label="Amount" max="50" min="0" step="2" required />
</template>
```

### Standard Schema Validation

```vue
<script setup lang="ts">
import { z } from 'zod'
import NumberField from './NumberField.vue'

const schema = z.number('Required').min(1, 'Must be greater than 0').max(14, 'Must be less than 14')
</script>

<template>
	<NumberField label="Number" :schema="schema" />
</template>
```

HTML constraints are validated first. Once satisfied, Standard Schema is validated.

### Mixed Validation

```vue
<script setup lang="ts">
import { z } from 'zod'
import NumberField from './NumberField.vue'

const schema = z.number().min(1).max(10)
</script>

<template>
	<NumberField label="Number" :schema="schema" max="50" min="0" step="2" />
</template>
```

## Usage

### Disabled

Disabled fields are not validated and are not submitted. Use `readonly` instead to prevent interaction while allowing submission.

```vue
<NumberField label="Disabled" disabled />
```

### Readonly

Readonly fields are validated and submitted, but do not accept user input. Still focusable and value is copyable.

```vue
<NumberField label="Readonly" value="47" readonly />
```

### Formatting and Units

The `formatOptions` prop accepts all options supported by `Intl.NumberFormat`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import NumberField from './NumberField.vue'

const value = ref(1000)
</script>

<template>
	<NumberField
		label="Amount"
		v-model="value"
		step="100"
		:formatOptions="{ style: 'currency', currency: 'USD' }"
	/>
</template>
```

### Internationalization (i18n)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import NumberField from './NumberField.vue'

const value = ref(10)
</script>

<template>
	<NumberField label="Latin" v-model="value" />
	<NumberField label="Arabic" v-model="value" locale="ar-EG" />
	<NumberField label="Chinese" v-model="value" locale="zh-cn-u-nu-hanidec" />

	value is: {{ value }}
</template>
```

### RTL Support

```vue
<NumberField label="Amount" value="10" dir="rtl" />
```

## API Reference

### Props

`useNumberField` accepts `NumberFieldProps`. All props can be passed as `Ref<T>` or `() => T`.

### Returns

| Name                   | Type                                                       | Description                   |
| ---------------------- | ---------------------------------------------------------- | ----------------------------- |
| `controlId`            | `string`                                                   | Unique identifier             |
| `decrement`            | `() => void`                                               | Decrement value               |
| `decrementButtonProps` | `Ref`                                                      | Props for decrement button    |
| `descriptionProps`     | `Ref<AriaDescriptionProps>`                                | Props for description element |
| `errorMessage`         | `Ref<string>`                                              | Current error message         |
| `errorMessageProps`    | `Ref<AriaErrorMessageProps>`                               | Props for error element       |
| `errors`               | `Ref<{}>`                                                  | Field errors object           |
| `field`                | `FieldState<number>`                                       | Complete field state          |
| `fieldValue`           | `Ref`                                                      | Current field value           |
| `formattedText`        | `Ref<string>`                                              | Formatted display text        |
| `increment`            | `() => void`                                               | Increment value               |
| `incrementButtonProps` | `Ref`                                                      | Props for increment button    |
| `inputEl`              | `Ref<HTMLInputElement>`                                    | Reference to input element    |
| `inputProps`           | `Ref<NumberInputDOMProps>`                                 | Props for input element       |
| `isBlurred`            | `Ref<boolean>`                                             | Blur state                    |
| `isDirty`              | `Ref<boolean>`                                             | Dirty state                   |
| `isDisabled`           | `Ref<boolean>`                                             | Disabled state                |
| `isTouched`            | `Ref<boolean>`                                             | Touched state                 |
| `isValid`              | `Ref<boolean>`                                             | Validity state                |
| `isValidated`          | `Ref<boolean>`                                             | Whether validation has run    |
| `labelProps`           | `Ref<AriaLabelProps>`                                      | Props for label element       |
| `setBlurred`           | `(blurred: boolean) => void`                               | Update blur state             |
| `setErrors`            | `(messages: Arrayable<string>) => void`                    | Set error messages            |
| `setIsValidated`       | `(isValidated: boolean) => void`                           | Update validation state       |
| `setTouched`           | `(touched: boolean) => void`                               | Update touched state          |
| `setValue`             | `(value: number) => void`                                  | Update field value            |
| `submitErrorMessage`   | `Ref<string>`                                              | Error from last submit        |
| `submitErrors`         | `Ref<{}>`                                                  | Errors from last submit       |
| `validate`             | `(mutate?: boolean) => Promise<ValidationResult<unknown>>` | Validate the field            |
