# DateInput

Segmented date/time input component -- each date/time part gets its own input field. Supports format tokens, timezone handling, and calendar popup.

## Installation

```bash
pnpm dlx shadcn-vue@latest add @electricity-ui/date-input
```

This also installs dependencies: `@electricity-ui/date-picker`, `@electricity-ui/calendar`.

## Key Concept

Segmented input -- each date/time part gets its own `<input type="text">` field:

```html
<!-- For format "DD.MM.YYYY HH:mm" -->
[DD].[MM].[YYYY] [HH]:[mm] [calendar button]
```

## Props

```typescript
interface DateInputProps {
	modelValue: string | Date | null
	locale: string // default: 'en-US'
	format: string // default: 'YYYY-MM-DD'
	utc: boolean // default: false
	timeZone: string // default: undefined
	assumeUtc: boolean // default: false
	debug: boolean // default: false
	disabled: boolean // default: false
	isDateUnavailable: (date: DateValue) => boolean
}
```

## Events

```typescript
interface DateInputEvents {
	'update:modelValue': [value: string | Date | null] // Value changed
	blur: [event: FocusEvent] // Component lost focus
	focus: [event: FocusEvent] // Component gained focus
}
```

## Format Tokens

| Token  | Description   | Example |
| ------ | ------------- | ------- |
| `YYYY` | 4-digit year  | 2025    |
| `YY`   | 2-digit year  | 25      |
| `MM`   | 2-digit month | 01-12   |
| `M`    | 1-digit month | 1-12    |
| `DD`   | 2-digit day   | 01-31   |
| `D`    | 1-digit day   | 1-31    |
| `HH`   | 24-hour hour  | 00-23   |
| `mm`   | Minutes       | 00-59   |

Common formats: `DD.MM.YYYY`, `YYYY-MM-DD`, `DD.MM.YYYY HH:mm`, `YYYY-MM`, `MM/DD/YYYY`

**Note**: Seconds (`ss`) not supported.

### Segment Parsing

The format string is parsed into typed segments for rendering individual inputs:

```typescript
// Example: "DD.MM.YYYY" parses to:
const segments = [
	{ type: 'day', value: 'DD', placeholder: 'DD' },
	{ type: 'literal', value: '.' },
	{ type: 'month', value: 'MM', placeholder: 'MM' },
	{ type: 'literal', value: '.' },
	{ type: 'year', value: 'YYYY', placeholder: 'YYYY' },
]
```

### Key Computed Properties

```typescript
const formatSegments = computed(() => parseFormatToSegments(props.format))
const isMonthPickerMode = computed(() => !formatSegments.value.some((s) => s.type === 'day'))
```

## Usage

```html
<!-- Simple date -->
<DateInput v-model="selectedDate" format="DD.MM.YYYY" locale="fi-FI" />

<!-- Date with time -->
<DateInput v-model="selectedDateTime" format="DD.MM.YYYY HH:mm" locale="en-US" :utc="true" />

<!-- Month picker -->
<DateInput v-model="selectedMonth" format="MM/YYYY" locale="sv-SE" />

<!-- With date availability check -->
<DateInput v-model="deliveryDate" format="YYYY-MM-DD" :is-date-unavailable="isWeekend" />
```

### Legacy UMD Registration

```javascript
app.component('date-input', EUI.Components.DateInput)
```

## Timezone Handling

```html
<!-- UTC mode -->
<DateInput v-model="utcDate" :utc="true" format="DD.MM.YYYY HH:mm" />

<!-- Specific timezone -->
<DateInput v-model="localDate" time-zone="Europe/Helsinki" format="DD.MM.YYYY HH:mm" />

<!-- Assume UTC for timezone-less strings -->
<DateInput v-model="stringDate" :assume-utc="true" format="YYYY-MM-DD" />
```

**Important**: Don't mix `:utc="true"` with `time-zone` -- choose one approach.

## Input Behavior

### Auto-Advance Rules

- Day > 3 --> advance to month
- Month > 1 --> advance to year
- Hour > 2 --> advance to minute
- Minute > 5 --> advance (or 2-digit complete)

### Validation / Clamping

- Feb 31 --> Feb 28; 25:70 --> 23:59
- Day: 1-31, Month: 1-12, Year: 1900-2100, Hour: 0-23, Minute: 0-59

### Type Preservation

- `Date` input --> `Date` output
- `string` input --> `string` output
- `null` --> `null`

## File Structure

```
DateInput/
├── DateInput.vue          # Main component
└── index.ts               # Exports

composables/
├── useDateInput.ts        # Core logic
└── dateHelpers.ts         # Date utilities
```

## Calendar Popup (DatePicker Integration)

The DateInput embeds a DatePicker internally for visual date selection:

- Calendar button opens a popup with the DatePicker component
- `isMonthPickerMode` auto-enables month-only picker when format lacks a day token
- Selection from the calendar updates all input segments automatically
- Popup closes on `Escape`, click outside, or date selection

## DateInput vs DatePicker

**DateInput**: Keyboard typing, precise segment control, custom formats, power users, time components
**DatePicker**: Visual calendar selection, date ranges, mobile-first, standard formats

## Troubleshooting / Best Practices

### Common Pitfalls

```html
<!-- Wrong: seconds not supported -->
<DateInput format="DD.MM.YYYY HH:mm:ss" />

<!-- Wrong: mixing timezone modes -->
<DateInput :utc="true" time-zone="Europe/Helsinki" />

<!-- Correct alternatives -->
<DateInput format="DD.MM.YYYY HH:mm" />
<DateInput :utc="true" />
```

### Debug Mode

Enable `:debug="true"` to get console logging of value changes, segment parsing, format validation, and input behavior.
