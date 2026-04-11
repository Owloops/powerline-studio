# OTP Fields

OTP fields allow users to input one-time passwords or verification codes, typically for 2FA/MFA authentication.

## Features

- Use `input` or any element for OTP field and slots
- Automatic ARIA linking for labels, descriptions, and error messages
- Native HTML constraints and Standard Schema validation
- v-model binding
- Character masking
- Prefix support
- Custom length
- Numeric and alphanumeric modes
- Comprehensive keyboard navigation
- Auto focus management between slots
- Paste event handling
- Auto submit on completion via `@completed` event

## Keyboard Navigation

| Key        | Action                                 |
| ---------- | -------------------------------------- |
| ArrowRight | Moves focus to next slot               |
| ArrowLeft  | Moves focus to previous slot           |
| Backspace  | Clears current slot, moves to previous |
| Tab        | Moves focus to next slot               |
| Enter      | Moves focus to next slot               |

## Anatomy

```
Label
[O] [T] [P] [-] [C] [O] [D] [E]
Error Message or Description
```

## Building an OTP Field

### OtpField.vue

```vue
<script setup lang="ts">
import { useOtpField, type OtpFieldProps, OtpSlot } from '@formwerk/core'

const props = defineProps<OtpFieldProps>()
const { controlProps, labelProps, errorMessage, errorMessageProps, fieldSlots } = useOtpField(props)
</script>

<template>
	<div class="otp-field">
		<div v-bind="labelProps" class="otp-field__label">{{ label }}</div>
		<div v-bind="controlProps" class="otp-field__control">
			<OtpSlot v-for="slot in fieldSlots" v-bind="slot" class="otp-field__slot" />
		</div>
		<span v-bind="errorMessageProps" class="otp-field__error-message">
			{{ errorMessage }}
		</span>
	</div>
</template>
```

Style focused slots with `:focus`. Disabled slots use `:disabled`.

### Basic Usage

```vue
<script setup lang="ts">
import OtpField from './OtpField.vue'
</script>

<template>
	<OtpField label="Your code" />
</template>
```

## Validation

### HTML Constraints

| Property   | Type      | Description               |
| ---------- | --------- | ------------------------- |
| `required` | `boolean` | Whether field is required |

Even if one slot is missing, the field is considered empty and triggers the required error.

```vue
<OtpField label="Your code" required />
```

### Standard Schema (Zod)

```vue
<script setup lang="ts">
import OtpField from './OtpField.vue'
import { z } from 'zod'

const schema = z.string().length(6)
</script>

<template>
	<OtpField label="Your code" :schema="schema" />
</template>
```

### Mixed Validation

```vue
<script setup lang="ts">
import { z } from 'zod'
const schema = z.string().length(6).startsWith('abc')
</script>

<template>
	<OtpField label="Your code" :schema="schema" required />
</template>
```

HTML constraints validate first; Standard Schema applies after. Disable native validation with `disableHtmlValidation` prop.

## Usage Patterns

### Disabled

```vue
<OtpField label="Disabled" disabled value="123456" />
```

Disabled fields are not validated or submitted.

### Readonly

```vue
<OtpField label="Readonly" readonly value="123456" />
```

Readonly fields are validated and submitted.

### Character Acceptance

```vue
<OtpField label="Numeric Code" accept="numeric" />
```

| Value          | Description                           |
| -------------- | ------------------------------------- |
| `alphanumeric` | English letters and numbers (default) |
| `numeric`      | Only numeric characters               |
| `all`          | All characters accepted               |

### Masking

```vue
<OtpField label="Secret Code" mask />
<OtpField label="Custom Mask" mask="*" />
```

When `mask` is `true`, characters display as dots. Pass a string for custom mask character. The model and submitted values are the actual unmasked values.

### Prefix

```vue
<OtpField label="Prefixed Code" prefix="F-" />
```

Prefixes are displayed but cannot be changed or edited by the user.

### Custom Length

```vue
<OtpField label="5-Digit Code" length="5" />
```

Default length: 6 without prefix, 4 with prefix.

### onCompleted Handler

Fires when all slots are filled:

```vue
<script setup lang="ts">
import OtpField from './OtpField.vue'

function onCompleted(value: string) {
	alert(`Code completed: ${value}`)
}
</script>

<template>
	<OtpField label="Enter Code" @completed="onCompleted" />
</template>
```

### RTL Support

OTP fields do **not** currently support RTL text direction.

## API Reference

### useOtpField Returns

| Name                 | Type                                                                                                   | Description            |
| -------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------- |
| `controlId`          | `string`                                                                                               | Control element ID     |
| `controlProps`       | `Ref<{ aria-invalid, aria-errormessage, aria-describedby?, aria-label?, aria-labelledby?, id, role }>` | Control bindings       |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                                                                            | Description bindings   |
| `errorMessage`       | `Ref<string>`                                                                                          | Current error          |
| `errorMessageProps`  | `Ref<AriaErrorMessageProps>`                                                                           | Error message bindings |
| `errors`             | `Ref<{}>`                                                                                              | Field errors           |
| `field`              | `FieldState<string>`                                                                                   | Field state            |
| `fieldSlots`         | `Ref<OtpSlotConfig[]>`                                                                                 | Slot configurations    |
| `fieldValue`         | `Ref<string>`                                                                                          | Current value          |
| `isBlurred`          | `Ref<boolean>`                                                                                         | Blur state             |
| `isDirty`            | `Ref<boolean>`                                                                                         | Dirty state            |
| `isDisabled`         | `Ref<boolean>`                                                                                         | Disabled state         |
| `isTouched`          | `Ref<boolean>`                                                                                         | Touched state          |
| `isValid`            | `Ref<boolean>`                                                                                         | Valid state            |
| `isValidated`        | `Ref<boolean>`                                                                                         | Validated state        |
| `labelProps`         | `Ref<AriaLabelProps>`                                                                                  | Label bindings         |
| `setBlurred`         | `(blurred: boolean) => void`                                                                           | Set blur state         |
| `setErrors`          | `(messages: Arrayable<string>) => void`                                                                | Set errors             |
| `setIsValidated`     | `(isValidated: boolean) => void`                                                                       | Set validated state    |
| `setTouched`         | `(touched: boolean) => void`                                                                           | Set touched state      |
| `setValue`           | `(value: string) => void`                                                                              | Set value              |
| `submitErrorMessage` | `Ref<string>`                                                                                          | Last submit error      |
| `submitErrors`       | `Ref<{}>`                                                                                              | Last submit errors     |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult>`                                                      | Validate field         |

### useOtpSlot Props

| Name       | Type                | Description                                                 |
| ---------- | ------------------- | ----------------------------------------------------------- |
| `accept`   | `OtpSlotAcceptType` | Character type (`'alphanumeric'` \| `'numeric'` \| `'all'`) |
| `disabled` | `boolean`           | Disable slot                                                |
| `masked`   | `boolean`           | Mask slot value                                             |
| `readonly` | `boolean`           | Readonly slot                                               |
| `value`    | `string`            | Slot value                                                  |

### useOtpSlot Returns

| Name        | Type                       | Description        |
| ----------- | -------------------------- | ------------------ |
| `key`       | `string`                   | Unique slot key    |
| `slotProps` | `Ref<Record<string, any>>` | Slot DOM bindings  |
| `value`     | `Ref<string>`              | Current slot value |
