# Time Fields

Time fields allow users to input time values through segmented inputs using `useTimeField` and `DateTimeSegment` composables.

## Dependency

Requires `@internationalized/date` for i18n support. Tree-shakable -- only included when using Calendar, Date Field, or Time Field composables.

## Features

- Automatic label, description, and error message linking
- Native HTML constraints and Standard Schema validation
- v-model binding
- Comprehensive keyboard navigation
- Focus management with auto-navigation between segments
- Format options (12/24 hour, seconds)

## Keyboard Navigation

| Key                | Action                                |
| ------------------ | ------------------------------------- |
| ArrowDown          | Decrements selected segment by 1      |
| ArrowUp            | Increments selected segment by 1      |
| ArrowLeft          | Moves focus to previous segment       |
| ArrowRight         | Moves focus to next segment           |
| Delete / Backspace | Clears current segment                |
| Tab                | Moves to next segment or next element |

## Building a Time Field

### TimeField.vue

```vue
<script setup lang="ts">
import { useTimeField, type TimeFieldProps, DateTimeSegment } from '@formwerk/core'

const props = defineProps<TimeFieldProps>()
const {
	controlProps,
	isTouched,
	labelProps,
	errorMessageProps,
	errorMessage,
	segments,
	direction,
} = useTimeField(props)
</script>

<template>
	<div class="InputTime" :class="{ touched: isTouched }" :dir="direction">
		<span v-bind="labelProps" class="label">{{ label }}</span>
		<div class="control">
			<div v-bind="controlProps">
				<DateTimeSegment v-for="segment in segments" v-bind="segment" class="segment" />
			</div>
		</div>
		<span v-bind="errorMessageProps" class="error-message">
			{{ errorMessage }}
		</span>
	</div>
</template>
```

Style focused segments with `:focus` pseudo-class. The `DateTimeSegment` component is the same one used by date fields.

### Basic Usage

```vue
<script setup lang="ts">
import TimeField from './TimeField.vue'
</script>

<template>
	<TimeField name="time" label="Time" />
</template>
```

## Validation

### HTML Constraints

| Property   | Type      | Description                    |
| ---------- | --------- | ------------------------------ |
| `min`      | `string`  | Minimum time (e.g., `"00:00"`) |
| `max`      | `string`  | Maximum time (e.g., `"10:04"`) |
| `required` | `boolean` | Required field                 |

```vue
<TimeField label="Time" required min="00:00" max="10:04" />
```

### Standard Schema (Zod)

```vue
<script setup lang="ts">
import { z } from 'zod'
import TimeField from './TimeField.vue'

const schema = z.string().refine(
	(value) => {
		const time = new Date(`1970-01-01T${value}`)
		return (
			time.getHours() >= 0 &&
			time.getHours() <= 10 &&
			time.getMinutes() >= 0 &&
			time.getMinutes() <= 4
		)
	},
	{ message: 'Time must be between 00:00 and 10:04' },
)
</script>

<template>
	<TimeField label="Time" :schema="schema" />
</template>
```

### Mixed Validation

```vue
<TimeField label="Time" :schema="schema" required />
```

HTML constraints validate first; Standard Schema applies after all constraints pass.

## Usage Patterns

### Disabled

```vue
<TimeField label="Disabled" value="10:04" disabled />
```

Disabled fields are not validated or submitted.

### Readonly

```vue
<TimeField label="Readonly" value="10:04" readonly />
```

Readonly fields are validated and submitted but not editable.

### Min and Max

```vue
<TimeField label="Bounded" min="00:00" max="10:04" />
```

### 12-Hour Format

```vue
<TimeField
	label="12-Hour"
	:formatOptions="{
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	}"
/>
```

Format options only affect display. The value always remains in `HH:mm` 24-hour format.

### With Seconds

```vue
<TimeField
	label="With Seconds"
	:formatOptions="{
		second: '2-digit',
	}"
/>
```

## API Reference

### useTimeField Returns

| Name                 | Type                                              | Description                                |
| -------------------- | ------------------------------------------------- | ------------------------------------------ |
| `controlId`          | `string`                                          | Unique control identifier                  |
| `controlProps`       | `Ref`                                             | Control element bindings (ARIA attributes) |
| `descriptionProps`   | `Ref`                                             | Description element bindings               |
| `direction`          | `Ref<'ltr' \| 'rtl'>`                             | Text direction                             |
| `errorMessage`       | `Ref<string>`                                     | Current error message                      |
| `errorMessageProps`  | `Ref`                                             | Error message bindings                     |
| `errors`             | `Ref<{}>`                                         | Field errors                               |
| `field`              | `FieldState<string>`                              | Complete field state                       |
| `fieldValue`         | `Ref<string>`                                     | Current value (HH:mm format)               |
| `isBlurred`          | `Ref<boolean>`                                    | Blur state                                 |
| `isDirty`            | `Ref<boolean>`                                    | Dirty state                                |
| `isDisabled`         | `Ref<boolean>`                                    | Disabled state                             |
| `isTouched`          | `Ref<boolean>`                                    | Touched state                              |
| `isValid`            | `Ref<boolean>`                                    | Validation state                           |
| `isValidated`        | `Ref<boolean>`                                    | Whether validated                          |
| `labelProps`         | `Ref<AriaLabelProps>`                             | Label bindings                             |
| `segments`           | `Ref<DateTimeSegmentConfig[]>`                    | Time segment configurations                |
| `setBlurred`         | `(blurred: boolean) => void`                      | Set blur state                             |
| `setErrors`          | `(messages: Arrayable<string>) => void`           | Set errors                                 |
| `setIsValidated`     | `(isValidated: boolean) => void`                  | Set validated state                        |
| `setTouched`         | `(touched: boolean) => void`                      | Set touched state                          |
| `setValue`           | `(value: string) => void`                         | Set value                                  |
| `submitErrorMessage` | `Ref<string>`                                     | Error from last submit                     |
| `submitErrors`       | `Ref<{}>`                                         | Errors from last submit                    |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult>` | Validate field                             |

### Important Notes

- **Value format:** Always returns `HH:mm` string in 24-hour format regardless of display format
- **Default format:** `HH:mm` if no `formatOptions` provided
- **Shared segments:** Uses the same `DateTimeSegment` component as date fields
- **Future:** Will migrate to Temporal API once baseline browser support is available
