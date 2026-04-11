# Custom Fields

Custom fields handle complex widgets that don't fit into existing composable categories. They participate in forms with no specific UI constraints -- you control the markup, interactions, and when validation triggers.

## Features

- Automatic `aria-*` attribute linking for labels, descriptions, error messages
- Standard Schema validation support
- `v-model` binding support
- No expectations about markup or interaction patterns

## Anatomy

- **Label** - describes the field
- **Control** - the interactive element
- **Description** - help text
- **Error Message** - validation feedback

## useCustomField

### Basic Usage

```vue
<script setup lang="ts">
import { useCustomField, type CustomFieldProps } from '@formwerk/core'

const props = defineProps<CustomFieldProps>()

const {
	labelProps,
	controlProps,
	setValue,
	errorMessage,
	errorMessageProps,
	setTouched,
	isTouched,
} = useCustomField<YourValueType>(props)
</script>
```

### Speech Recognition Example

A complete custom field wrapping the Web Speech API:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCustomField, type CustomFieldProps } from '@formwerk/core'

const props = defineProps<
	CustomFieldProps & {
		sentence: string
	}
>()

const {
	labelProps,
	controlProps,
	setValue,
	errorMessage,
	errorMessageProps,
	setTouched,
	isTouched,
} = useCustomField<boolean>(props)

const words = computed(() => props.sentence.split(' '))
const results = ref<string[]>([])
const isListening = ref(false)
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()

recognition.lang = 'en-US'
recognition.interimResults = false
recognition.maxAlternatives = 1

function onSpeakClick() {
	if (isListening.value) {
		stopListening()
		return
	}
	results.value = []
	isListening.value = true
	recognition.start()
	setTimeout(() => stopListening(true), 8000)
}

function isAllSpoken() {
	return results.value.every((word) => words.value.includes(word))
}

function stopListening(done = false) {
	recognition.stop()
	isListening.value = false
	if (done) {
		setTouched(true)
		setValue(isAllSpoken())
	}
}

recognition.onresult = (event) => {
	results.value = event.results[0][0].transcript.toLowerCase().split(' ')
	setValue(isAllSpoken())
}
</script>

<template>
	<div class="speech-exercise">
		<div class="challenge-label" v-bind="labelProps">{{ label }}</div>
		<div class="challenge">
			<span
				v-for="(word, idx) in words"
				:key="`word-${idx}`"
				:class="{ 'is-spoken': results.includes(word.toLowerCase()) }"
			>
				{{ word }}
			</span>
		</div>

		<button
			type="button"
			v-bind="controlProps"
			@click="onSpeakClick"
			:class="{ 'is-listening': isListening }"
		>
			{{ isListening ? 'Listening...' : 'Speak' }}
		</button>

		<div v-if="errorMessage && isTouched" v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

Usage with validation:

```vue
<script setup lang="ts">
import SpeakField from './SpeakField.vue'
import { z } from 'zod'

const schema = z.literal(true)
</script>

<template>
	<SpeakField
		name="challenge"
		label="Say the following"
		:schema="schema"
		sentence="I went to the store"
	/>
</template>
```

## Validation

### Standard Schema

Supports Zod, Valibot, Arktype, etc. via the `schema` prop:

```vue
<SpeakField name="challenge" label="Say the following" :schema="schema" />
```

### Manual Validation Trigger

Custom fields lack automatic validation triggers. You must manually call `validate()`:

```vue
<script setup lang="ts">
import { useCustomField, type CustomFieldProps } from '@formwerk/core'

const props = defineProps<CustomFieldProps>()
const { validate, setValue } = useCustomField(props)

function onValueChange(value: string) {
	setValue(value)
	validate()
}
</script>
```

This is necessary because the framework cannot determine the appropriate interaction pattern for custom fields.

## Third-Party Component Integration

Custom fields can wrap third-party UI library components to gain:

- Form validation state
- Form API integration
- No markup expectations

Note: This is an inefficient use of Formwerk -- you only gain validation state and the form API since most UI libraries already handle accessibility and interactions.

## Field States

### Disabled

- Not automatically applied to custom field elements
- Use `isDisabled` return value to implement disabled behavior
- When disabled: field not validated, not submitted
- Disabled state inherited from parent form/group

### Readonly

- Use readonly prop; implement behavior yourself
- Readonly fields are validated and submitted
- Do not accept user input but remain focusable
- Values are copyable in text-based fields

## API Reference

### useCustomField Props (CustomFieldProps)

| Name          | Type             | Description                    |
| ------------- | ---------------- | ------------------------------ |
| `name`        | `string`         | Field name for form submission |
| `label`       | `string`         | Label text                     |
| `modelValue`  | `TValue`         | v-model value                  |
| `disabled`    | `boolean`        | Whether disabled               |
| `readonly`    | `boolean`        | Whether readonly               |
| `schema`      | `StandardSchema` | Validation schema              |
| `description` | `string`         | Help text description          |

### useCustomField Returns

| Name                 | Type                                                       | Description                                                                                                                                                  |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `controlEl`          | `Ref<HTMLInputElement>`                                    | Control element ref                                                                                                                                          |
| `controlId`          | `string`                                                   | Unique control identifier                                                                                                                                    |
| `controlProps`       | `Ref<object>`                                              | Props for control element (`aria-readonly`, `aria-disabled`, `id`, `aria-invalid`, `aria-errormessage`, `aria-describedby`, `aria-label`, `aria-labelledby`) |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                                | Props for description element                                                                                                                                |
| `errorMessage`       | `Ref<string>`                                              | Current error message                                                                                                                                        |
| `errorMessageProps`  | `Ref<AriaErrorMessageProps>`                               | Props for error message element                                                                                                                              |
| `errors`             | `Ref<{}>`                                                  | Field errors                                                                                                                                                 |
| `field`              | `FieldState<TValue>`                                       | Complete field state                                                                                                                                         |
| `fieldValue`         | `Ref<TValue>`                                              | Current value                                                                                                                                                |
| `isBlurred`          | `Ref<boolean>`                                             | Whether field lost focus                                                                                                                                     |
| `isDirty`            | `Ref<boolean>`                                             | Whether value changed from initial                                                                                                                           |
| `isDisabled`         | `Ref<boolean>`                                             | Whether disabled                                                                                                                                             |
| `isTouched`          | `Ref<boolean>`                                             | Whether interacted with                                                                                                                                      |
| `isValid`            | `Ref<boolean>`                                             | Validation status                                                                                                                                            |
| `isValidated`        | `Ref<boolean>`                                             | Whether validation occurred                                                                                                                                  |
| `labelProps`         | `Ref<AriaLabelProps>`                                      | Props for label element                                                                                                                                      |
| `setBlurred`         | `(blurred: boolean) => void`                               | Set blurred state                                                                                                                                            |
| `setErrors`          | `(messages: Arrayable<string>) => void`                    | Set errors                                                                                                                                                   |
| `setIsValidated`     | `(isValidated: boolean) => void`                           | Set validated state                                                                                                                                          |
| `setTouched`         | `(touched: boolean) => void`                               | Set touched state                                                                                                                                            |
| `setValue`           | `(value: TValue) => void`                                  | Set value                                                                                                                                                    |
| `submitErrorMessage` | `Ref<string>`                                              | Error from last submit                                                                                                                                       |
| `submitErrors`       | `Ref<{}>`                                                  | Errors from last submit                                                                                                                                      |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult<unknown>>` | Validate field                                                                                                                                               |
