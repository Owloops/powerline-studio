# Date Fields

Date fields allow users to enter dates through segmented input components using `useDateField` and `useDateTimeSegment` composables.

## Dependency

Requires `@internationalized/date` for i18n support. Tree-shakable -- only included when using Calendar, Date Field, or Time Field composables.

## Features

- Automatic linking of labels, descriptions, and error messages
- Multiple calendar systems (islamic-umalqura, japanese, etc.)
- Min/max date boundary validation
- Native HTML constraints and Standard Schema validation
- Auto-directionality based on locale
- Focus management with auto-navigation between segments
- v-model binding
- Calendar picker integration via `usePicker`

## Keyboard Navigation

| Key                | Action                                |
| ------------------ | ------------------------------------- |
| ArrowDown          | Decrements selected segment by 1      |
| ArrowUp            | Increments selected segment by 1      |
| ArrowLeft          | Moves focus to previous segment       |
| ArrowRight         | Moves focus to next segment           |
| Delete / Backspace | Clears current segment                |
| Tab                | Moves to next segment or next element |

## Anatomy

```
Label
[MM] / [DD] / [YYYY]    (segmented date input)
Help text or Error Message
```

## Building a Date Field

### DateField.vue

```vue
<script setup lang="ts">
import { useDateField, type DateFieldProps, DateTimeSegment } from '@formwerk/core'

const props = defineProps<DateFieldProps>()

const {
	controlProps,
	isTouched,
	labelProps,
	errorMessageProps,
	errorMessage,
	segments,
	direction,
} = useDateField(props)
</script>

<template>
	<div class="InputDate" :class="{ touched: isTouched }" :dir="direction">
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

Style focused segments with `background-color` on `:focus`. Disabled segments use `[aria-disabled='true']`.

### DateTimeSegment Component

```vue
<script setup lang="ts">
import { useDateTimeSegment, type DateTimeSegmentProps } from '@formwerk/core'

const props = defineProps<DateTimeSegmentProps>()
const { segmentProps, label } = useDateTimeSegment(props)
</script>

<template>
	<div v-bind="segmentProps">
		{{ label }}
	</div>
</template>
```

### Basic Usage

```vue
<script setup lang="ts">
import DateField from './DateField.vue'
</script>

<template>
	<DateField name="date" label="Date" />
</template>
```

## Validation

### HTML Constraints

| Property   | Type      | Description    |
| ---------- | --------- | -------------- |
| `min`      | `Date`    | Minimum date   |
| `max`      | `Date`    | Maximum date   |
| `required` | `boolean` | Required field |

```vue
<DateField label="Date" required :min="new Date('2025-01-01')" :max="new Date('2025-12-31')" />
```

### Standard Schema (Zod)

```vue
<script setup lang="ts">
import { z } from 'zod'
import DateField from './DateField.vue'

const schema = z.date().min(new Date('2025-01-01')).max(new Date('2025-12-31'))
</script>

<template>
	<DateField label="Date" :schema="schema" />
</template>
```

Supports Zod, Valibot, Arktype, and other Standard Schema providers.

### Mixed Validation

```vue
<DateField label="Date" :schema="schema" required />
```

HTML constraints validate first; Standard Schema applies after all constraints pass.

## Usage Patterns

### Disabled

```vue
<DateField label="Disabled" :value="new Date('2025-02-11')" disabled />
```

Disabled fields skip validation and form submission.

### Readonly

```vue
<DateField label="Readonly" :value="new Date('2025-02-11')" readonly />
```

Readonly fields validate and submit but prevent user interaction.

### Min and Max Boundaries

```vue
<DateField
	label="Same Year and Month"
	:min="new Date('2025-02-01')"
	:max="new Date('2025-02-15')"
/>
```

When min/max are provided, segments with only one possible value are automatically set and disabled.

### Format Options

Accepts any `Intl.DateTimeFormatOptions`:

```vue
<DateField
	label="Formatted"
	:formatOptions="{
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	}"
/>
```

### Locale and Calendar Systems

```vue
<script setup lang="ts">
import { createCalendar } from '@internationalized/date'
import DateField from './DateField.vue'

const calendar = createCalendar('islamic-umalqura')
</script>

<template>
	<DateField
		label="Hijri Date"
		:value="new Date('2025-02-11')"
		:calendar="calendar"
		locale="ar-SA"
	/>
</template>
```

Non-Gregorian calendars still emit Gregorian `Date` objects internally.

## Calendar Picker Integration

Use `usePicker` to add a calendar popover to the date field:

```vue
<script setup lang="ts">
import { useDateField, DateTimeSegment, usePicker, type DateFieldProps } from '@formwerk/core'
import Calendar from './Calendar.vue'

const props = defineProps<DateFieldProps>()

const {
	controlProps,
	labelProps,
	errorMessageProps,
	errorMessage,
	segments,
	direction,
	calendarProps,
} = useDateField(props)

const { pickerProps, pickerTriggerProps } = usePicker({
	label: 'Pick a date',
})
</script>

<template>
	<div class="InputDate" :dir="direction">
		<span v-bind="labelProps" class="label">{{ label }}</span>

		<div class="control">
			<div v-bind="controlProps">
				<DateTimeSegment v-for="segment in segments" v-bind="segment" class="segment" />
			</div>

			<button class="picker-trigger" v-bind="pickerTriggerProps">
				<!-- calendar icon -->
			</button>
		</div>

		<div v-bind="pickerProps" popover>
			<Calendar v-bind="calendarProps" />
		</div>

		<span v-bind="errorMessageProps" class="error-message">
			{{ errorMessage }}
		</span>
	</div>
</template>
```

Key: `useDateField` returns `calendarProps` that are passed directly to the Calendar component, keeping the date field and calendar in sync.

## API Reference

### useDateField Props

| Name            | Type                         | Description                     |
| --------------- | ---------------------------- | ------------------------------- |
| `disabled`      | `boolean`                    | Disable the field               |
| `readonly`      | `boolean`                    | Make field readonly             |
| `required`      | `boolean`                    | Make field required             |
| `min`           | `Date`                       | Minimum date                    |
| `max`           | `Date`                       | Maximum date                    |
| `value`         | `Date`                       | Initial/controlled value        |
| `name`          | `string`                     | Field name for form submission  |
| `label`         | `string`                     | Label text                      |
| `description`   | `string`                     | Help text                       |
| `schema`        | `StandardSchema`             | Validation schema               |
| `locale`        | `string`                     | Locale string (e.g., `'ar-SA'`) |
| `calendar`      | `Calendar`                   | Calendar system object          |
| `formatOptions` | `Intl.DateTimeFormatOptions` | Display format options          |

### useDateField Returns

| Name                 | Type                                              | Description                                                                         |
| -------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `controlProps`       | `Ref`                                             | Control element bindings (aria-disabled, aria-invalid, aria-errormessage, role, id) |
| `labelProps`         | `Ref<AriaLabelProps>`                             | Label bindings                                                                      |
| `errorMessageProps`  | `Ref<AriaErrorMessageProps>`                      | Error message bindings                                                              |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                       | Description bindings                                                                |
| `segments`           | `Ref<DateTimeSegmentConfig[]>`                    | Segment configurations                                                              |
| `direction`          | `Ref<'ltr' \| 'rtl'>`                             | Text direction                                                                      |
| `controlId`          | `string`                                          | Control identifier                                                                  |
| `errorMessage`       | `Ref<string>`                                     | Current error                                                                       |
| `errors`             | `Ref<{}>`                                         | All errors                                                                          |
| `fieldValue`         | `Ref<Date \| undefined>`                          | Current value                                                                       |
| `isValid`            | `Ref<boolean>`                                    | Valid state                                                                         |
| `isValidated`        | `Ref<boolean>`                                    | Has been validated                                                                  |
| `isDirty`            | `Ref<boolean>`                                    | Dirty state                                                                         |
| `isTouched`          | `Ref<boolean>`                                    | Touched state                                                                       |
| `isBlurred`          | `Ref<boolean>`                                    | Blurred state                                                                       |
| `isDisabled`         | `Ref<boolean>`                                    | Disabled state                                                                      |
| `field`              | `FieldState<Date>`                                | Complete field state                                                                |
| `calendarProps`      | `Ref<CalendarProps>`                              | Props to pass to Calendar component                                                 |
| `setValue`           | `(value: Date) => void`                           | Set value                                                                           |
| `setErrors`          | `(messages: Arrayable<string>) => void`           | Set errors                                                                          |
| `setIsValidated`     | `(validated: boolean) => void`                    | Set validated state                                                                 |
| `setTouched`         | `(touched: boolean) => void`                      | Set touched state                                                                   |
| `setBlurred`         | `(blurred: boolean) => void`                      | Set blurred state                                                                   |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult>` | Manual validation                                                                   |
| `submitErrorMessage` | `Ref<string>`                                     | Last submit error                                                                   |
| `submitErrors`       | `Ref<{}>`                                         | Last submit errors                                                                  |

### useDateTimeSegment Props

| Name       | Type                  | Description                 |
| ---------- | --------------------- | --------------------------- |
| `type`     | `DateTimeSegmentType` | Segment type                |
| `value`    | `string`              | Segment text value          |
| `disabled` | `boolean`             | Disabled state              |
| `readonly` | `boolean`             | Readonly state              |
| `spinOnly` | `boolean`             | Strict spin-button behavior |

`DateTimeSegmentType`: `'day'` | `'month'` | `'year'` | `'hour'` | `'minute'` | `'second'` | `'era'` | `'weekday'` | `'timeZoneName'` | `'dayPeriod'`

### useDateTimeSegment Returns

| Name           | Type                           | Description                                                                                       |
| -------------- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| `label`        | `Ref<string>`                  | Display text                                                                                      |
| `segmentProps` | `Ref<DateTimeSegmentDomProps>` | DOM bindings (aria-valuenow, aria-valuemin, aria-valuemax, contentEditable, role, event handlers) |
| `key`          | `Ref<string>`                  | Unique key                                                                                        |
