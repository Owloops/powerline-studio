# Radio Buttons

A radio group is a set of checkable buttons where no more than one can be checked at a time. Radios require grouping via composables (`useRadioGroup` + `useRadio`), not HTML name attributes.

## Features

- Native `input[type="radio"]` or custom HTML elements as base
- Automatic aria-attribute linking for labels and descriptions
- Form management with HTML5 or Standard Schema validation
- Horizontal and vertical orientation support
- `v-model` binding
- Comprehensive keyboard navigation

## Keyboard Navigation

| Key         | Function                         |
| ----------- | -------------------------------- |
| Arrow Down  | Focus next radio                 |
| Arrow Right | Focus next radio (RTL: previous) |
| Arrow Left  | Focus previous radio             |
| Arrow Up    | Focus previous radio (RTL: next) |
| Tab         | Focus selected item or first     |
| Space       | Select focused radio             |

## Building a Radio Group Component

```vue
<script setup lang="ts">
import { type RadioGroupProps, useRadioGroup } from '@formwerk/core'

const props = defineProps<RadioGroupProps>()
const { groupProps, labelProps, descriptionProps, errorMessageProps, errorMessage, isTouched } =
	useRadioGroup(props)
</script>

<template>
	<div v-bind="groupProps" class="radio-group" :class="{ 'is-touched': isTouched }">
		<div v-bind="labelProps" class="group-label">{{ label }}</div>
		<div class="radios-container">
			<slot />
		</div>
		<div v-if="errorMessage" v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
		<div v-else-if="description" v-bind="descriptionProps" class="hint">
			{{ description }}
		</div>
	</div>
</template>
```

## Building a Radio Item (with input element)

```vue
<script setup lang="ts">
import { type RadioProps, useRadio } from '@formwerk/core'

const props = defineProps<RadioProps>()
const { labelProps, inputProps } = useRadio(props)
</script>

<template>
	<label v-bind="labelProps" class="radio-item">
		<input v-bind="inputProps" class="sr-only" />
		<div class="radio-circle">
			<div class="radio-circle-inner"></div>
		</div>
		{{ label }}
	</label>
</template>
```

Style with `:has(:checked)`, `:has(:focus)`, `:has(:disabled)`.

## Building a Radio Item (with custom element)

```vue
<script setup lang="ts">
import { type RadioProps, useRadio } from '@formwerk/core'

const props = defineProps<RadioProps>()
const { labelProps, inputProps } = useRadio(props)
</script>

<template>
	<div class="radio-item" v-bind="inputProps">
		<div class="radio-circle">
			<div class="radio-circle-inner"></div>
		</div>
		<span v-bind="labelProps">{{ label }}</span>
	</div>
</template>
```

Style with `&[aria-checked='true']`, `&:focus`, `&[aria-disabled='true']`, `&[aria-readonly='true']`.

## Validation

### HTML Constraints

| Property   | Type      | Description                         |
| ---------- | --------- | ----------------------------------- |
| `required` | `boolean` | Whether the radio group is required |

```vue
<RadioGroup label="Radio Group" required>
  <Radio label="Radio 1" value="1" />
  <Radio label="Radio 2" value="2" />
  <Radio label="Radio 3" value="3" />
</RadioGroup>
```

### Standard Schema Validation

```vue
<script setup lang="ts">
import { z } from 'zod'

const schema = z.string().min(1, 'Please select a drink').endsWith('coffee', 'WRONG ANSWER!')
</script>

<template>
	<RadioGroup label="Select a drink" :schema="schema">
		<RadioItem label="Tea" value="tea" />
		<RadioItem label="Coffee" value="coffee" />
		<RadioItem label="Milk" value="milk" />
	</RadioGroup>
</template>
```

## Usage

### Disabled

Individual radios or entire groups can be disabled:

```vue
<RadioGroup label="Radio Group">
  <RadioItem label="Radio 1" value="1" />
  <RadioItem label="Radio 2" value="2" />
  <RadioItem label="Radio 3" value="3" disabled />
  <RadioItem label="Radio 4" value="4" />
</RadioGroup>

<RadioGroup label="Disabled Group" disabled>
  <RadioItem label="Radio 1" value="1" />
  <RadioItem label="Radio 2" value="2" />
  <RadioItem label="Radio 3" value="3" />
</RadioGroup>
```

### Readonly

```vue
<script setup lang="ts">
import { ref } from 'vue'
const value = ref('coffee')
</script>

<template>
	<RadioGroup label="Select a drink" v-model="value" description="Can't change this" readonly>
		<RadioItem label="Tea" value="tea" />
		<RadioItem label="Coffee" value="coffee" />
		<RadioItem label="Milk" value="milk" />
	</RadioGroup>
</template>
```

### Vertical Orientation

```vue
<RadioGroup label="Radio Group" orientation="vertical">
  <RadioItem label="Radio 1" value="1" />
  <RadioItem label="Radio 2" value="2" />
  <RadioItem label="Radio 3" value="3" />
</RadioGroup>
```

Style via `&[aria-orientation='vertical']` on the group.

### RTL Support

```vue
<RadioGroup label="من اليمين لليسار" dir="rtl">
  <RadioItem label="الحقل الأول" value="1" />
  <RadioItem label="الحقل الثاني" value="2" />
  <RadioItem label="الحقل الثالث" value="3" />
</RadioGroup>
```

## Generics

```typescript
import { useRadio, type RadioProps } from '@formwerk/core'
const props = defineProps<RadioProps<string>>()
```

Component-level generic (recommended):

```vue
<script setup lang="ts" generic="TValue">
import { useRadio, type RadioProps } from '@formwerk/core'
const props = defineProps<RadioProps<TValue>>()
</script>
```

For RadioGroup:

```vue
<script setup lang="ts" generic="TValue">
import { useRadioGroup, type RadioGroupProps } from '@formwerk/core'
const props = defineProps<RadioGroupProps<TValue>>()
</script>
```

## API Reference

### useRadioGroup Returns

| Property             | Type                                                       | Description                     |
| -------------------- | ---------------------------------------------------------- | ------------------------------- |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                                | Props for description element   |
| `errorMessage`       | `Ref<string>`                                              | Field error message             |
| `errorMessageProps`  | `Ref<AriaErrorMessageProps>`                               | Props for error message element |
| `errors`             | `Ref<{}>`                                                  | Field errors object             |
| `fieldValue`         | `Ref<TValue>`                                              | Current field value             |
| `groupId`            | `string`                                                   | Group element ID                |
| `groupProps`         | `Ref<RadioGroupDomProps>`                                  | Props for group element         |
| `isBlurred`          | `Ref<boolean>`                                             | Blurred state                   |
| `isDirty`            | `Ref<boolean>`                                             | Dirty state                     |
| `isDisabled`         | `Ref<boolean>`                                             | Disabled state                  |
| `isTouched`          | `Ref<boolean>`                                             | Touched state                   |
| `isValid`            | `Ref<boolean>`                                             | Validation status               |
| `isValidated`        | `Ref<boolean>`                                             | Whether validated               |
| `labelProps`         | `Ref<AriaLabelProps>`                                      | Props for label element         |
| `setBlurred`         | `(blurred: boolean) => void`                               | Set blurred state               |
| `setErrors`          | `(messages: Arrayable<string>) => void`                    | Set error messages              |
| `setIsValidated`     | `(isValidated: boolean) => void`                           | Set validated state             |
| `setTouched`         | `(touched: boolean) => void`                               | Set touched state               |
| `setValue`           | `(value: TValue) => void`                                  | Set field value                 |
| `submitErrorMessage` | `Ref<string>`                                              | Error from last submit          |
| `submitErrors`       | `Ref<{}>`                                                  | Errors from last submit         |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult<unknown>>` | Validate field                  |

### useRadio Props

| Property   | Type      | Description          |
| ---------- | --------- | -------------------- |
| `disabled` | `boolean` | Disable radio button |
| `label`    | `string`  | Label text           |
| `value`    | `TValue`  | Associated value     |

### useRadio Returns

| Property     | Type                                       | Description             |
| ------------ | ------------------------------------------ | ----------------------- |
| `controlId`  | `string`                                   | Input element ID        |
| `inputEl`    | `Ref<HTMLInputElement>`                    | Input element reference |
| `inputProps` | `Ref<RadioDomInputProps \| RadioDomProps>` | Props for input element |
| `isChecked`  | `Ref<boolean>`                             | Checked state           |
| `isDisabled` | `Ref<boolean>`                             | Disabled state          |
| `labelProps` | `Ref<AriaLabelProps>`                      | Props for label element |
