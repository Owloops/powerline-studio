# Calendars

Calendar components enable date selection through an interactive grid interface. Can be used standalone or paired with date fields via `usePicker`.

## Dependency

Requires `@internationalized/date` for i18n support. Tree-shakable -- only included when using Calendar, Date Field, or Time Field composables.

## Features

- Automatic linking of labels, descriptions, and error messages
- Multiple views: weeks, months, years
- Multiple calendar systems (islamic-umalqura, japanese, etc.)
- Min/max date boundary validation
- Native HTML constraints and Standard Schema validation
- Auto-directionality based on locale
- Cell states: today, selected, disabled, outside-month
- v-model binding
- Comprehensive keyboard navigation

## Keyboard Navigation

### Week View

| Key        | Action                                                             |
| ---------- | ------------------------------------------------------------------ |
| ArrowDown  | Same day next week                                                 |
| ArrowUp    | Same day previous week                                             |
| ArrowLeft  | Previous day                                                       |
| ArrowRight | Next day                                                           |
| Home       | First day of month (if already there, first day of previous month) |
| End        | Last day of month (if already there, last day of next month)       |
| PageUp     | Same day previous month                                            |
| PageDown   | Same day next month                                                |

### Month View

| Key        | Action                                                               |
| ---------- | -------------------------------------------------------------------- |
| ArrowDown  | Next quarter                                                         |
| ArrowUp    | Previous quarter                                                     |
| ArrowLeft  | Previous month                                                       |
| ArrowRight | Next month                                                           |
| Home       | First month of year (if already there, first month of previous year) |
| End        | Last month of year (if already there, last month of next year)       |
| PageUp     | Same month previous year                                             |
| PageDown   | Same month next year                                                 |

### Year View

| Key        | Action           |
| ---------- | ---------------- |
| ArrowDown  | 3 years forward  |
| ArrowUp    | 3 years backward |
| ArrowLeft  | Previous year    |
| ArrowRight | Next year        |

## Building a Calendar

### Calendar.vue

```vue
<script setup lang="ts">
import { useCalendar, CalendarCell, type CalendarProps } from '@formwerk/core'

const props = defineProps<CalendarProps>()
const {
	calendarProps,
	gridProps,
	nextButtonProps,
	previousButtonProps,
	gridLabelProps,
	gridLabel,
	currentView,
} = useCalendar(props)
</script>

<template>
	<div class="calendar" v-bind="calendarProps">
		<div class="calendar-header">
			<button v-bind="previousButtonProps">&lt;</button>
			<span v-bind="gridLabelProps">{{ gridLabel }}</span>
			<button v-bind="nextButtonProps">&gt;</button>
		</div>

		<!-- Weeks View -->
		<div v-if="currentView.type === 'weeks'" v-bind="gridProps" class="weeks-grid">
			<div v-for="day in currentView.weekDays" :key="day" class="weekday-label">
				{{ day }}
			</div>
			<CalendarCell
				v-for="day in currentView.days"
				v-bind="day"
				class="calendar-cell"
				:class="{
					'outside-month': day.isOutsideMonth,
					today: day.isToday,
				}"
			>
				{{ day.label }}
			</CalendarCell>
		</div>

		<!-- Months View -->
		<div v-if="currentView.type === 'months'" v-bind="gridProps" class="months-grid">
			<CalendarCell v-for="month in currentView.months" v-bind="month" class="calendar-cell">
				{{ month.label }}
			</CalendarCell>
		</div>

		<!-- Years View -->
		<div v-if="currentView.type === 'years'" v-bind="gridProps" class="years-grid">
			<CalendarCell v-for="year in currentView.years" v-bind="year" class="calendar-cell">
				{{ year.label }}
			</CalendarCell>
		</div>
	</div>
</template>
```

Style selected cells via `[aria-selected='true']`, disabled via `[aria-disabled='true']`, focused via `:focus`.

### CalendarCell Component (Custom)

```vue
<script setup lang="ts">
import { useCalendarCell, type CalendarCellProps } from '@formwerk/core'

const props = defineProps<CalendarCellProps>()
const { cellProps, label } = useCalendarCell(props)
</script>

<template>
	<div v-bind="cellProps">{{ label }}</div>
</template>
```

### Basic Usage

```vue
<script setup lang="ts">
import Calendar from './Calendar.vue'
import { ref } from 'vue'

const date = ref(new Date('2025-09-14'))
</script>

<template>
	<Calendar label="Select a date" v-model="date" />
</template>
```

## Validation

### HTML Constraints

| Property   | Type      | Description             |
| ---------- | --------- | ----------------------- |
| `min`      | `Date`    | Minimum selectable date |
| `max`      | `Date`    | Maximum selectable date |
| `required` | `boolean` | Required selection      |

```vue
<Calendar
	label="Calendar"
	:value="new Date('2025-01-15')"
	:min="new Date(2025, 0, 4)"
	:max="new Date('2025-01-20')"
/>
```

## Usage Patterns

### Disabled

```vue
<Calendar label="Disabled" disabled />
```

### Readonly

```vue
<Calendar label="Readonly" readonly />
```

### Locale and Calendar Systems

```vue
<script setup lang="ts">
import { createCalendar } from '@internationalized/date'
import Calendar from './Calendar.vue'

const calendar = createCalendar('islamic-umalqura')
</script>

<template>
	<Calendar label="Calendar" :calendar="calendar" locale="ar-SA" />
</template>
```

Non-Gregorian calendars still emit Gregorian `Date` objects. The display shows the chosen calendar system but the value is always the equivalent Gregorian date.

### As Picker (Popover)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { usePicker } from '@formwerk/core'
import Calendar from './Calendar.vue'

const { pickerProps, pickerTriggerProps } = usePicker({
	label: 'Pick a date',
})
const date = ref()
</script>

<template>
	<pre>Selected: {{ date || 'none' }}</pre>
	<button v-bind="pickerTriggerProps">Open Calendar</button>
	<div v-bind="pickerProps" popover>
		<Calendar label="Calendar" v-model="date" />
	</div>
</template>
```

### Disabling Views

Restrict which views the user can navigate to:

```vue
<Calendar label="Calendar" :allowed-views="['weeks', 'months']" />
```

Available views: `'weeks'`, `'months'`, `'years'`.

## API Reference

### useCalendar Returns

| Name                  | Type                                                                | Description                                |
| --------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| `calendarProps`       | `Ref<{ role, dir, onKeydown, id }>`                                 | Root element bindings                      |
| `controlId`           | `string`                                                            | Generated control ID                       |
| `currentView`         | `Ref<CalendarWeeksView \| CalendarMonthsView \| CalendarYearsView>` | Active view                                |
| `field`               | `FieldState<Date>`                                                  | Field state                                |
| `focusedDate`         | `Ref<ZonedDateTime>`                                                | Currently focused date                     |
| `gridLabel`           | `Ref<string>`                                                       | Label for current grid                     |
| `gridLabelProps`      | `Ref<{ 'aria-live': 'polite', tabindex, onClick }>`                 | Grid label bindings (click to change view) |
| `gridProps`           | `Ref<{ 'aria-label'?, 'aria-labelledby'?, id, role }>`              | Grid element bindings                      |
| `nextButtonProps`     | `Ref<{ type: 'button', role, tabindex }>`                           | Next button bindings                       |
| `previousButtonProps` | `Ref<{ type: 'button', role, tabindex }>`                           | Previous button bindings                   |
| `selectedDate`        | `Ref<ZonedDateTime>`                                                | Currently selected date                    |
| `setView`             | `(type: CalendarViewType) => void`                                  | Change view programmatically               |

### CalendarWeeksView

| Property   | Type                | Description            |
| ---------- | ------------------- | ---------------------- |
| `type`     | `'weeks'`           | View type identifier   |
| `weekDays` | `string[]`          | Weekday labels         |
| `days`     | `CalendarDayCell[]` | Day cells for the grid |

Each day cell has: `label`, `value`, `disabled`, `focused`, `selected`, `isOutsideMonth`, `isToday`.

### CalendarMonthsView

| Property | Type                  | Description          |
| -------- | --------------------- | -------------------- |
| `type`   | `'months'`            | View type identifier |
| `months` | `CalendarMonthCell[]` | Month cells          |

### CalendarYearsView

| Property | Type                 | Description          |
| -------- | -------------------- | -------------------- |
| `type`   | `'years'`            | View type identifier |
| `years`  | `CalendarYearCell[]` | Year cells           |

### useCalendarCell Props

| Name       | Type                         | Description      |
| ---------- | ---------------------------- | ---------------- |
| `disabled` | `boolean`                    | Whether disabled |
| `focused`  | `boolean`                    | Whether focused  |
| `label`    | `string`                     | Display text     |
| `selected` | `boolean`                    | Whether selected |
| `type`     | `'day' \| 'month' \| 'year'` | Cell type        |
| `value`    | `any`                        | Cell value       |

### useCalendarCell Returns

| Name        | Type                    | Description           |
| ----------- | ----------------------- | --------------------- |
| `cellProps` | `Ref<{ onClick, ... }>` | Cell element bindings |
| `key`       | `Ref<string>`           | Unique key            |
| `label`     | `Ref<string>`           | Display label         |

## Integration with Date Fields

The `useDateField` composable returns `calendarProps` that can be passed directly to a Calendar component. Combined with `usePicker`, this creates a date field with an attached calendar popover. See the Date Fields reference for the full integration pattern.
