# Switches

A switch is a binary input widget that toggles between on and off states. Similar to checkboxes and toggle buttons.

Switches should not be used for required inputs where the switch must be "on" -- they represent user preferences that can be toggled off.

## Features

- Support for `input[type="checkbox"]` base element or custom elements (div, button, etc.)
- Automatic `aria-*` attribute linking for labels, descriptions, error messages
- Custom `on` and `off` value support via `trueValue`/`falseValue`
- Native HTML constraint validation and Standard Schema validation
- `v-model` binding support

### Keyboard Interactions

| Key   | Description        |
| ----- | ------------------ |
| Space | Toggles the switch |
| Enter | Toggles the switch |

## Building a Switch Component

### With `input[type="checkbox"]`

```vue
<script setup lang="ts">
import { useSwitch, type SwitchProps } from '@formwerk/core'

const props = defineProps<SwitchProps>()
const { inputProps, labelProps, isPressed, errorMessage, errorMessageProps } = useSwitch(props)
</script>

<template>
	<div class="switch">
		<label v-bind="labelProps">
			<div class="switch-control">
				<div class="switch-knob"></div>
			</div>
			<input v-bind="inputProps" type="checkbox" class="sr-only" />
			{{ label }}
		</label>
		<div v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

Style the checked state with `:has(:checked)`:

```css
.switch {
	&:has(:checked) {
		.switch-control {
			background-color: var(--color-primary);
		}
		.switch-knob {
			translate: 100% 0;
		}
	}
	&:has(:focus) {
		.switch-control {
			outline: 2px solid var(--color-focus);
		}
	}
	&:has([readonly='true']) {
		.switch-control {
			background-color: var(--switch-readonly-bg);
		}
	}
	&:has(:disabled) {
		.switch-control {
			opacity: 0.4;
			cursor: not-allowed;
		}
	}
	&:has(:user-invalid) {
		.error {
			display: block;
		}
	}
}
```

Usage:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Switch from './Switch.vue'

const isOn = ref(false)
</script>

<template>
	<Switch label="Theme" v-model="isOn" />
	<div>Switch is: {{ isOn }}</div>
</template>
```

### Without Input Elements

Use `inputProps` on a div/button instead. Style with `[aria-checked='true']` instead of `:has(:checked)`:

```vue
<script setup lang="ts">
import { useSwitch, type SwitchProps } from '@formwerk/core'

const props = defineProps<SwitchProps>()
const { inputProps, labelProps, isPressed, errorMessage, errorMessageProps } = useSwitch(props)
</script>

<template>
	<div class="switch">
		<div class="switch-wrapper" v-bind="inputProps">
			<div class="switch-control">
				<div class="switch-knob"></div>
			</div>
			<div class="switch-label" v-bind="labelProps">{{ label }}</div>
		</div>
		<div v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

Key CSS differences for non-input version:

```css
[aria-checked='true'] {
	.switch-control {
		background-color: var(--switch-active-bg);
	}
	.switch-knob {
		translate: 100% 0;
	}
}
&[aria-invalid='true'] {
	.error {
		display: block;
	}
}
```

## Validation

### HTML Constraints

The `required` attribute works with `input[type="checkbox"]` base elements:

```vue
<Switch label="HTML Validation" required />
```

### Standard Schema

Supports Zod, Valibot, Arktype, etc.:

```vue
<script setup lang="ts">
import { z } from 'zod'
import Switch from './Switch.vue'

const schema = z.literal(true)
</script>

<template>
	<Switch label="Standard Schema" :schema="schema" />
</template>
```

### Mixed Validation

HTML constraints are validated first, then Standard Schema:

```vue
<script setup lang="ts">
import { z } from 'zod'
import Switch from './Switch.vue'

const schema = z.custom((val) => {
	return val !== true
}, 'I am a paradox')
</script>

<template>
	<Switch label="Mixed Validation" required :schema="schema" />
</template>
```

To disable native validation in mixed scenarios, use `disableHtmlValidation`:

```vue
<Switch label="Mixed Validation" required :schema="schema" disable-html-validation />
```

## Usage

### Disabled

Disabled switches are non-interactive, not validated, and not submitted:

```vue
<Switch label="Disabled switch" disabled />
```

### Readonly

Readonly switches are validated and submitted but do not accept user input. The switch remains focusable:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Switch from './Switch.vue'

const value = ref(true)
</script>

<template>
	<Switch label="Readonly switch" v-model="value" readonly />
</template>
```

### Custom On/Off Values

Use `trueValue` and `falseValue` props (any data type):

```vue
<script setup lang="ts">
import { ref } from 'vue'
import Switch from './Switch.vue'

const value = ref('off')
</script>

<template>
	<Switch label="Custom values" v-model="value" :trueValue="'on'" :falseValue="'off'" />
	<div>Value is: {{ value }}</div>
</template>
```

## API Reference

### useSwitch Props (SwitchProps)

| Name                    | Type             | Description                           |
| ----------------------- | ---------------- | ------------------------------------- |
| `label`                 | `string`         | Label text                            |
| `modelValue`            | `TValue`         | v-model value                         |
| `disabled`              | `boolean`        | Whether disabled                      |
| `readonly`              | `boolean`        | Whether readonly                      |
| `required`              | `boolean`        | Whether required (checkbox base only) |
| `schema`                | `StandardSchema` | Validation schema                     |
| `trueValue`             | `TValue`         | Custom "on" value                     |
| `falseValue`            | `TValue`         | Custom "off" value                    |
| `disableHtmlValidation` | `boolean`        | Disable native HTML validation        |
| `name`                  | `string`         | Field name for form submission        |

### useSwitch Returns

| Name                 | Type                                                       | Description                        |
| -------------------- | ---------------------------------------------------------- | ---------------------------------- |
| `controlId`          | `string`                                                   | Unique control identifier          |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                                | Props for description element      |
| `errorMessage`       | `Ref<string>`                                              | Current error message              |
| `errorMessageProps`  | `Ref<AriaErrorMessageProps>`                               | Props for error message element    |
| `errors`             | `Ref<{}>`                                                  | Field errors                       |
| `field`              | `FieldState<TValue>`                                       | Complete field state               |
| `fieldValue`         | `Ref<TValue>`                                              | Current field value                |
| `inputEl`            | `Ref<HTMLInputElement>`                                    | Input element ref                  |
| `inputProps`         | `Ref<SwitchDomInputProps \| SwitchDOMProps>`               | Props for input/container element  |
| `isBlurred`          | `Ref<boolean>`                                             | Whether blurred                    |
| `isDirty`            | `Ref<boolean>`                                             | Whether value differs from initial |
| `isDisabled`         | `Ref<boolean>`                                             | Whether disabled                   |
| `isPressed`          | `Ref<boolean>`                                             | Whether switch is pressed          |
| `isTouched`          | `Ref<boolean>`                                             | Whether touched                    |
| `isValid`            | `Ref<boolean>`                                             | Whether valid                      |
| `isValidated`        | `Ref<boolean>`                                             | Whether validated                  |
| `labelProps`         | `Ref<AriaLabelProps>`                                      | Props for label element            |
| `setBlurred`         | `(blurred: boolean) => void`                               | Set blurred state                  |
| `setErrors`          | `(messages: Arrayable<string>) => void`                    | Set errors                         |
| `setIsValidated`     | `(isValidated: boolean) => void`                           | Set validated state                |
| `setTouched`         | `(touched: boolean) => void`                               | Set touched state                  |
| `setValue`           | `(value: TValue) => void`                                  | Set value                          |
| `submitErrorMessage` | `Ref<string>`                                              | Error from last submit             |
| `submitErrors`       | `Ref<{}>`                                                  | Errors from last submit            |
| `togglePressed`      | `(force?: boolean) => void`                                | Toggle pressed state               |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult<unknown>>` | Validate the field                 |
