<script setup lang="ts">
import { cn } from '@/lib/utils'

import { RangeCalendar } from '@/components/RangeCalendar'
import { type MarkedDates } from '@/components/Calendar/marked-dates'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import {
	DateFormatter,
	type DateValue,
	type CalendarDate,
	type CalendarDateTime,
	type ZonedDateTime,
	getLocalTimeZone,
	parseDate,
	parseDateTime,
	CalendarDate as CalendarDateClass,
	CalendarDateTime as CalendarDateTimeClass,
	toZoned,
	today,
} from '@internationalized/date'
import { CalendarIcon } from '@lucide/vue'
import { computed, watch } from 'vue'

interface DateRange {
	start?: Date | string | DateValue | null
	end?: Date | string | DateValue | null
}

interface Props {
	modelValue?: DateRange
	locale?: string
	dateFormat?: string
	date?: DateValue
	weekDays?: string[]
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
	fixedWeeks?: boolean
	timeZone?: string
	placeholder?: string
	class?: string
	disabled?: boolean
	markedDates?: MarkedDates
}

const props = withDefaults(defineProps<Props>(), {
	locale: 'fi-FI',
	dateFormat: 'dd.MM.yyyy',
	placeholder: 'Valitse',
})

const emit = defineEmits<{
	'update:modelValue': [value: DateRange | undefined]
}>()

// Get the current timezone value
const getCurrentTimeZone = () => props.timeZone || getLocalTimeZone()

const df = computed(() => {
	// Using DateFormatter with the user's locale
	const formatter = new DateFormatter(props.locale)

	return {
		format: (date: Date) => {
			// Format based on the dateFormat prop
			if (props.dateFormat === 'dd.MM.yyyy') {
				const day = date.getDate().toString().padStart(2, '0')
				const month = (date.getMonth() + 1).toString().padStart(2, '0')
				const year = date.getFullYear()
				return `${day}.${month}.${year}`
			} else if (props.dateFormat === 'MM/dd/yyyy') {
				const day = date.getDate().toString().padStart(2, '0')
				const month = (date.getMonth() + 1).toString().padStart(2, '0')
				const year = date.getFullYear()
				return `${month}/${day}/${year}`
			} else if (props.dateFormat === 'yyyy-MM-dd') {
				const day = date.getDate().toString().padStart(2, '0')
				const month = (date.getMonth() + 1).toString().padStart(2, '0')
				const year = date.getFullYear()
				return `${year}-${month}-${day}`
			} else {
				// For other formats, use a generic formatter
				return formatter.format(date)
			}
		},
		parse: (value: string): Date | null => {
			try {
				// Try to parse based on the dateFormat prop
				if (props.dateFormat === 'dd.MM.yyyy') {
					const [day, month, year] = value.split('.')
					return new Date(Number(year), Number(month) - 1, Number(day))
				} else if (props.dateFormat === 'MM/dd/yyyy') {
					const [month, day, year] = value.split('/')
					return new Date(Number(year), Number(month) - 1, Number(day))
				} else if (props.dateFormat === 'yyyy-MM-dd') {
					return new Date(value)
				} else {
					// For other formats, try to use the browser's date parsing
					return new Date(value)
				}
			} catch (e) {
				console.error('Error parsing date:', e)
				return null
			}
		},
	}
})

// Convert a Date, string, or DateValue to a CalendarDate
const toCalendarDate = (
	value: Date | string | DateValue | null | undefined,
): DateValue | undefined => {
	if (!value) return undefined

	// If it's already a DateValue, return it
	if (typeof value === 'object' && 'calendar' in value && typeof value.calendar === 'string') {
		return value as DateValue
	}

	try {
		// If it's a Date object
		if (value instanceof Date) {
			const dateObj = value
			return new CalendarDateClass(
				dateObj.getFullYear(),
				dateObj.getMonth() + 1, // JavaScript months are 0-indexed
				dateObj.getDate(),
			)
		}

		// If it's a date string
		if (typeof value === 'string') {
			// Try to parse as ISO date format first
			if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
				// Check if it contains 'T' which indicates a datetime string
				if (value.includes('T')) {
					try {
						// Use parseDateTime for strings with time component
						return parseDateTime(value)
					} catch (e) {
						console.error('Error parsing datetime:', e)
						// Fall back to parseDate if parseDateTime fails
						return parseDate(value.split('T')[0])
					}
				} else {
					// Use parseDate for strings with date component only
					return parseDate(value)
				}
			}

			// Try to parse using our formatter
			const parsedDate = df.value.parse(value)
			if (parsedDate) {
				return new CalendarDateClass(
					parsedDate.getFullYear(),
					parsedDate.getMonth() + 1,
					parsedDate.getDate(),
				)
			}
		}
	} catch (e) {
		console.error('Error parsing date:', e)
	}

	return undefined
}

// Convert the input model value to a DateRange with DateValue objects
const internalValue = computed(() => {
	const range = props.modelValue || {}

	return {
		start: toCalendarDate(range.start),
		end: toCalendarDate(range.end),
	}
})

// Convert the DateValue range to a standard JavaScript Date range for emitting
const updateValue = (value: { start?: DateValue; end?: DateValue } | undefined) => {
	if (!value || (!value.start && !value.end)) {
		emit('update:modelValue', { start: undefined, end: undefined })
		return
	}

	// Convert DateValue to JavaScript Date using the specified timezone
	const jsDateRange = {
		start: value.start ? value.start.toDate(getCurrentTimeZone()) : undefined,
		end: value.end ? value.end.toDate(getCurrentTimeZone()) : undefined,
	}

	emit('update:modelValue', jsDateRange)
}

// Format the display date range
const getFormattedDateRange = () => {
	const { start, end } = internalValue.value

	if (!start && !end) return props.placeholder

	if (start && end) {
		const startDate = start.toDate(getCurrentTimeZone())
		const endDate = end.toDate(getCurrentTimeZone())
		return `${df.value.format(startDate)} - ${df.value.format(endDate)}`
	}

	if (start) {
		const startDate = start.toDate(getCurrentTimeZone())
		return df.value.format(startDate)
	}

	if (end) {
		const endDate = end.toDate(getCurrentTimeZone())
		return df.value.format(endDate)
	}

	return props.placeholder
}
</script>

<template>
	<Popover>
		<PopoverTrigger as-child>
			<slot :df="df" :value="modelValue">
				<button
					type="button"
					:class="[
						'inline-flex cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-md text-sm font-normal transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-3',
						props.class,
					]"
					:disabled="props.disabled"
				>
					{{ getFormattedDateRange() }}
					<CalendarIcon class="text-muted-foreground ml-2 h-4 w-4" />
				</button>
			</slot>
		</PopoverTrigger>
		<PopoverContent class="w-auto p-0 bg-background" align="start">
			<RangeCalendar
				:model-value="internalValue"
				@update:model-value="updateValue"
				:date="date"
				:week-days="weekDays"
				:week-starts-on="weekStartsOn"
				:locale="locale"
				:fixed-weeks="fixedWeeks"
				:marked-dates="props.markedDates"
				initial-focus
				class="w-auto bg-transparent"
				:numberOfMonths="2"
			/>
		</PopoverContent>
	</Popover>
</template>
